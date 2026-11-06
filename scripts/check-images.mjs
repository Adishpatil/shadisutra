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
const missingSlots = slots.filter(({ path: source }) =>
  !existsSync(path.join(projectRoot, "public", source.replace(/^\/+/, "")))
);

const graphicsPath = path.join(projectRoot, "src", "data", "graphics.ts");
const graphicsRegistry = readFileSync(graphicsPath, "utf8");
const graphics = [];
let currentGraphic = "";
for (const line of graphicsRegistry.split(/\r?\n/)) {
  const graphic = line.match(/^  (?:"([^"]+)"|([A-Za-z0-9_-]+)): \{$/);
  if (graphic) currentGraphic = graphic[1] ?? graphic[2];
  const source = line.match(/\bpath:\s*"([^"]+)"/);
  if (source) graphics.push({ name: currentGraphic, path: source[1] });
}
const missingGraphics = graphics.filter(({ path: source }) =>
  !existsSync(path.join(projectRoot, "public", source.replace(/^\/+/, "")))
);

if (missingSlots.length === 0) {
  console.log(`All ${slots.length} image slot files exist.`);
} else {
  console.log(`Missing image slot files (${missingSlots.length}/${slots.length}):`);
  for (const slot of missingSlots) console.log(`- ${slot.name}: ${slot.path}`);
}

if (missingGraphics.length === 0) {
  console.log(`All ${graphics.length} line-art asset files exist.`);
} else {
  console.log(
    `Missing line-art asset files (${missingGraphics.length}/${graphics.length}):`
  );
  for (const graphic of missingGraphics) {
    console.log(`- ${graphic.name}: ${graphic.path}`);
  }
}

if (missingSlots.length > 0 || missingGraphics.length > 0) {
  process.exitCode = 1;
}
