import { readdir, unlink, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const sourceDirectory = "C:\\Users\\ASUS\\Desktop\\shadisutra-originals";
const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const imagesDirectory = path.join(repositoryRoot, "public", "images");
const brandDirectory = path.join(repositoryRoot, "public", "brand");
const originalLogoPath = path.join(brandDirectory, "logo.png");
const optimizedLogoPath = path.join(brandDirectory, "logo.webp");
const maxBytes = 300 * 1024;
const maxLogoBytes = 400 * 1024;

const stalePlaceholderPaths = [
  "about\\about-01.webp",
  "hero\\hero-01.webp",
  "services\\birthdays.webp",
  "services\\functions.webp",
  "services\\weddings.webp",
  "gallery\\birthdays\\birthday-decor-01.webp",
  "gallery\\functions\\function-corporate-01.webp",
  "gallery\\weddings\\wedding-haldi-01.webp",
  "gallery\\weddings\\wedding-mandap-01.webp",
  "gallery\\weddings\\wedding-reception-01.webp",
];

const categoryPrefixes = [
  { expression: /^(hero)-/i, category: "hero" },
  { expression: /^(about)-/i, category: "about" },
  { expression: /^(weddings|weeding)-/i, category: "weddings" },
  { expression: /^(birthdays|birthday)-/i, category: "birthdays" },
  { expression: /^(functions|funcation)-/i, category: "functions" },
];

const files = (await readdir(sourceDirectory, { withFileTypes: true }))
  .filter((entry) => entry.isFile() && /\.(jpe?g|png|webp|tiff?)$/i.test(entry.name))
  .map((entry) => entry.name)
  .sort((left, right) => left.localeCompare(right, undefined, { numeric: true }));

if (files.length === 0) {
  throw new Error(`No supported photos found in ${sourceDirectory}`);
}

const outputs = [];

for (const filename of files) {
  const prefix = categoryPrefixes.find(({ expression }) => expression.test(filename));
  if (!prefix) {
    throw new Error(`Photo filename must start with a supported category prefix: ${filename}`);
  }

  const sourcePath = path.join(sourceDirectory, filename);
  const outputFolder =
    prefix.category === "hero"
      ? path.join(imagesDirectory, "hero")
      : prefix.category === "about"
        ? path.join(imagesDirectory, "about")
        : path.join(imagesDirectory, "gallery", prefix.category);
  const outputName = filename
    .replace(/\.[^.]+$/, "")
    .replace(/^(weeding)-/i, "weddings-")
    .replace(/^(birthday)-/i, "birthdays-")
    .replace(/^(funcation)-/i, "functions-")
    .toLowerCase() + ".webp";
  const outputPath = path.join(outputFolder, outputName);
  const maximumEdge = prefix.category === "hero" ? 1920 : 1600;

  await mkdir(outputFolder, { recursive: true });

  let output;
  for (let quality = 82; quality >= 42; quality -= 5) {
    output = await sharp(sourcePath)
      .rotate()
      .resize({
        width: maximumEdge,
        height: maximumEdge,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality, effort: 6 })
      .toBuffer({ resolveWithObject: true });
    if (output.data.byteLength < maxBytes) break;
  }

  if (!output || output.data.byteLength >= maxBytes) {
    throw new Error(`Could not optimize ${filename} below 300 KB.`);
  }

  await sharp(output.data).toFile(outputPath);
  outputs.push({
    source: filename,
    destination: path.relative(repositoryRoot, outputPath),
    width: output.info.width,
    height: output.info.height,
    bytes: output.data.byteLength,
  });
}

for (const relativePath of stalePlaceholderPaths) {
  await unlink(path.join(imagesDirectory, relativePath)).catch((error) => {
    if (error.code !== "ENOENT") throw error;
  });
}

for (const item of outputs) {
  console.log(
    `${item.source} -> ${item.destination} (${item.width}x${item.height}, ${Math.ceil(item.bytes / 1024)} KB)`
  );
}

const brandFiles = await readdir(brandDirectory);
const logoSourcePath = brandFiles.includes("logo.png")
  ? originalLogoPath
  : brandFiles.includes("logo.webp")
    ? optimizedLogoPath
    : null;

if (logoSourcePath) {
  const logoMetadata = await sharp(logoSourcePath).metadata();
  if (!logoMetadata.width || !logoMetadata.height) {
    throw new Error("Could not read the supplied logo dimensions.");
  }

  let logoBuffer;
  for (let quality = 85; quality >= 45; quality -= 5) {
    logoBuffer = await sharp(logoSourcePath)
      .resize({
        width: 1200,
        height: 1200,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality, effort: 6 })
      .toBuffer();
    if (logoBuffer.byteLength < maxLogoBytes) break;
  }
  if (!logoBuffer || logoBuffer.byteLength >= maxLogoBytes) {
    throw new Error("Could not optimize the logo below 400 KB.");
  }
  await sharp(logoBuffer).toFile(optimizedLogoPath);

  const markCrop = {
    left: Math.round(logoMetadata.width * 0.28),
    top: Math.round(logoMetadata.height * 0.068),
    width: Math.round(logoMetadata.width * 0.44),
    height: Math.round(logoMetadata.height * 0.596),
  };
  const markPath = path.join(brandDirectory, "favicon.png");
  await sharp(logoSourcePath)
    .extract(markCrop)
    .resize(256, 256, { fit: "cover" })
    .png()
    .toFile(markPath);

  if (logoSourcePath === originalLogoPath) await unlink(originalLogoPath);
  console.log(
    `Optimized supplied logo to public/brand/logo.webp (${Math.ceil(logoBuffer.byteLength / 1024)} KB) and generated its favicon mark.`
  );
} else {
  console.warn("Logo not found; skipped logo optimization and favicon generation.");
}
