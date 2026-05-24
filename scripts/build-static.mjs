import { cp, mkdir, rm } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();
const distDir = resolve(root, "dist");

const entriesToCopy = [
  "index.html",
  "styles.css",
  "script.js",
  "pngwing.com.png",
  "design-elements"
];

await rm(distDir, { recursive: true, force: true });
await mkdir(distDir, { recursive: true });

for (const entry of entriesToCopy) {
  const src = resolve(root, entry);
  const dst = resolve(distDir, entry);
  await cp(src, dst, { recursive: true });
}

console.log("Built static site to dist/");