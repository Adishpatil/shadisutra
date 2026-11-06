import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "..");
const sourcePath = path.join(projectRoot, "public", "brand", "logo.png");
const outputPath = path.join(
  projectRoot,
  "public",
  "brand",
  "logo-transparent.png"
);

const { data, info } = await sharp(sourcePath)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const blackThreshold = 16;

for (let index = 0; index < data.length; index += info.channels) {
  const maximumChannel = Math.max(data[index], data[index + 1], data[index + 2]);
  const alpha = Math.max(
    0,
    (maximumChannel - blackThreshold) / (255 - blackThreshold)
  );
  data[index + 3] = Math.round(data[index + 3] * alpha);
}

const trimmed = await sharp(data, { raw: info })
  .trim({
    background: { r: 0, g: 0, b: 0, alpha: 0 },
    threshold: 1,
  })
  .png()
  .toBuffer({ resolveWithObject: true });

await sharp(trimmed.data)
  .resize({ height: 88, fit: "inside" })
  .png()
  .toFile(outputPath);

console.log(`Created ${path.relative(projectRoot, outputPath)}`);
