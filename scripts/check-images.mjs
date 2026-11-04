import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const registryPath = path.join(projectRoot, "src", "data", "images.ts");
const registry = readFileSync(registryPath, "utf8");
const slots = [...registry.matchAll(/\b(?:src|mobileSrc):\s*"([^"]+)"/g)]
  .map((match) => match[1]);
const missing = slots.filter((source) =>
  !existsSync(path.join(projectRoot, "public", source.replace(/^\/+/, "")))
);

if (missing.length === 0) {
  console.log(`All ${slots.length} image slot files exist.`);
} else {
  console.log("Missing image slot files:");
  for (const source of missing) console.log(`- ${source}`);
  process.exitCode = 1;
}
