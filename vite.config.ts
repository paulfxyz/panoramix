import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { createHash } from "node:crypto";
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

const commit = (() => { try { return execSync("git rev-parse --short=10 HEAD", { stdio: ["ignore", "pipe", "ignore"] }).toString().trim(); } catch { return "dev"; } })();
const catalogSha = createHash("sha256").update(readFileSync(path.resolve(import.meta.dirname, "client/public/catalog.json"))).digest("hex");

export default defineConfig({
  plugins: [react()],
  define: {
    __COMMIT__: JSON.stringify(commit),
    __CATALOG_SHA__: JSON.stringify(catalogSha),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString().slice(0, 10)),
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  base: "./",
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
