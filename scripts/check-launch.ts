import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import gallery from "../src/data/gallery.json";
import { site } from "../src/config/site";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const errors: string[] = [];

async function filesUnder(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const fullPath = path.join(directory, entry.name);
      return entry.isDirectory() ? filesUnder(fullPath) : [fullPath];
    })
  );
  return nested.flat();
}

function imageMatchesExtension(filename: string, bytes: Buffer): boolean {
  const extension = path.extname(filename).toLowerCase();
  switch (extension) {
    case ".webp":
      return (
        bytes.length >= 12 &&
        bytes.toString("ascii", 0, 4) === "RIFF" &&
        bytes.toString("ascii", 8, 12) === "WEBP"
      );
    case ".jpg":
    case ".jpeg":
      return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    case ".png":
      return bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    case ".gif":
      return ["GIF87a", "GIF89a"].includes(bytes.toString("ascii", 0, 6));
    case ".ico":
      return bytes.length >= 4 && bytes[0] === 0 && bytes[1] === 0 && bytes[2] === 1 && bytes[3] === 0;
    case ".svg":
      return /^\s*(?:<\?xml[^>]*>\s*)?<svg[\s>]/i.test(bytes.toString("utf8"));
    case ".avif":
      return bytes.length >= 12 && bytes.toString("ascii", 4, 8) === "ftyp" &&
        ["avif", "avis"].includes(bytes.toString("ascii", 8, 12));
    default:
      return true;
  }
}

async function main() {
  const siteConfigPath = path.join(root, "src", "config", "site.ts");
  const siteConfigSource = await readFile(siteConfigPath, "utf8");
  if (/\bTODO\b/i.test(siteConfigSource) || /\bTODO\b/i.test(JSON.stringify(site))) {
    errors.push("Remove TODO values from src/config/site.ts.");
  }

  const brandPath = path.join(root, "public", "brand");
  const brandFiles = await filesUnder(brandPath);
  if (!brandFiles.some((filename) => /^logo\./i.test(path.basename(filename)))) {
    errors.push("Add the client-provided public/brand/logo.* asset.");
  }

  const publicFiles = await filesUnder(path.join(root, "public"));
  const imageExtensions = new Set([
    ".webp", ".jpg", ".jpeg", ".png", ".gif", ".ico", ".svg", ".avif",
  ]);
  for (const filename of publicFiles) {
    if (!imageExtensions.has(path.extname(filename).toLowerCase())) continue;
    const [fileStat, bytes] = await Promise.all([stat(filename), readFile(filename)]);
    const relativePath = path.relative(root, filename);
    if (fileStat.size > 400 * 1024) {
      errors.push(`${relativePath} exceeds the 400 KB image limit.`);
    }
    if (!imageMatchesExtension(filename, bytes)) {
      errors.push(`${relativePath} content does not match its image extension.`);
    }
  }

  if (
    !Array.isArray(gallery) ||
    gallery.some(
      (image) =>
        typeof image.alt !== "string" ||
        image.alt.trim().length === 0
    )
  ) {
    errors.push("Every src/data/gallery.json entry must have non-empty alt text.");
  }

  const siteUrl = process.env.SITE_URL?.trim();
  if (!siteUrl) {
    errors.push("Set SITE_URL to the public production origin.");
  } else {
    try {
      const parsedSiteUrl = new URL(siteUrl);
      if (parsedSiteUrl.protocol !== "https:") {
        errors.push("SITE_URL must use HTTPS.");
      }
    } catch {
      errors.push("SITE_URL must be a valid absolute URL.");
    }
  }

  if (errors.length) {
    console.error("Launch check failed:");
    for (const error of errors) console.error(`- ${error}`);
    process.exitCode = 1;
  } else {
    console.log("Launch check passed.");
  }
}

main().catch((error: unknown) => {
  console.error("Launch check could not complete:", error);
  process.exitCode = 1;
});
