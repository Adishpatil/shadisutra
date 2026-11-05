import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const registryPath = path.join(projectRoot, "src", "data", "images.ts");
const registry = readFileSync(registryPath, "utf8");
const slots = [];
let currentSlot = "";
for (const line of registry.split(/\r?\n/)) {
  const slot = line.match(/^  ([A-Za-z0-9_]+): \{$/);
  if (slot) currentSlot = slot[1];
  const source = line.match(/\b(src|mobileSrc):\s*"([^"]+)"/);
  if (source) {
    slots.push({
      name: source[1] === "mobileSrc" ? `${currentSlot}.mobileSrc` : currentSlot,
      path: source[2],
    });
  }
}
const missing = slots.filter(({ path: source }) =>
  !existsSync(path.join(projectRoot, "public", source.replace(/^\/+/, "")))
);

if (missing.length === 0) {
  console.log(`All ${slots.length} image slot files exist.`);
} else {
  console.log("Missing image slot files:");
  for (const slot of missing) console.log(`- ${slot.name}: ${slot.path}`);
  process.exitCode = 1;
}
