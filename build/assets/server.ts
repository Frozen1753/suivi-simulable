import fs from "node:fs";
import path from "node:path";
import type { Plugin } from "vite";
import { SUPPORTED_ASSET_EXTENSIONS } from "../../src/core/types/extensions.ts";
import { resolvePath } from "../paths.ts";

const ASSETS_DIR = resolvePath("assets");

const MATCH_EXT = new Set<string>(SUPPORTED_ASSET_EXTENSIONS);

export interface ListedAsset {
  path: string;
  size: number;
}

function listRecursively(
  dir: string,
  base = "",
): ListedAsset[] {
  if (!fs.existsSync(dir)) return [];

  let out: ListedAsset[] = [];

  for (const entry of fs.readdirSync(dir, {
    withFileTypes: true,
  })) {
    const relativePath = base
      ? `${base}/${entry.name}`
      : entry.name;

    const absolutePath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      out = out.concat(
        listRecursively(absolutePath, relativePath),
      );
    } else if (
      entry.isFile() &&
      MATCH_EXT.has(path.extname(entry.name).toLowerCase())
    ) {
      out.push({
        path: relativePath,
        size: fs.statSync(absolutePath).size,
      });
    }
  }

  return out.sort(
    (a, b) =>
      b.size - a.size || a.path.localeCompare(b.path),
  );
}

export function assetsServerPlugin(): Plugin {
  return {
    name: "report-maker:assets-list",
    apply: "serve",

    configureServer(server) {
      server.middlewares.use("/api/assets", (req, res) => {
        if (req.method !== "GET") {
          res.statusCode = 405;
          res.end("Method not allowed");
          return;
        }

        res.setHeader("Content-Type", "application/json");

        res.end(
          JSON.stringify({
            files: listRecursively(ASSETS_DIR),
          }),
        );
      });
    },
  };
}