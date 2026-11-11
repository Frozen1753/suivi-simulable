import { spawn } from "node:child_process";
import fs from "node:fs";
import type { Plugin } from "vite";
import type { ReportBuildMode } from "../modes.ts";
import { PATHS, resolvePath } from "../paths.ts";

export type { ReportBuildMode };

export interface ExportRequestBody {
  mode: ReportBuildMode;
  excludeExtensions?: string[];
  maxImageWidth?: number;
  maxAssetSizeMb?: number;
  excludeFiles?: string[];
}

function nonNegativeNumber(
  value: unknown,
  fallback: number,
): number {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, value)
    : fallback;
}

export function exportServerPlugin(): Plugin {
  return {
    name: "report-maker:export-server",
    apply: "serve",

    configureServer(server) {
      server.middlewares.use("/api/export", (req, res) => {
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.end("Method not allowed");
          return;
        }

        let body = "";

        req.on("data", (chunk) => {
          body += chunk;
        });

        req.on("end", () => {
          let payload: ExportRequestBody;

          try {
            payload = JSON.parse(body || "{}") as ExportRequestBody;
          } catch {
            res.statusCode = 400;
            res.end("Invalid JSON body");
            return;
          }

          const mode = payload.mode ?? "folder";

          if (!["folder", "singlefile", "hybrid"].includes(mode)) {
            res.statusCode = 400;
            res.end("Invalid build mode");
            return;
          }

          const configPath = resolvePath("assetsConfig");

          fs.writeFileSync(
            configPath,
            JSON.stringify(
              {
                excludeExtensions: Array.isArray(
                  payload.excludeExtensions,
                )
                  ? payload.excludeExtensions.filter(
                    (value) => typeof value === "string",
                  )
                  : [".mp4", ".mov", ".webm", ".gif"],

                maxImageWidth: nonNegativeNumber(
                  payload.maxImageWidth,
                  3000,
                ),

                maxAssetSizeMb: nonNegativeNumber(
                  payload.maxAssetSizeMb,
                  5,
                ),

                excludeFiles: Array.isArray(payload.excludeFiles)
                  ? payload.excludeFiles.filter(
                    (value) => typeof value === "string",
                  )
                  : [],
              },
              null,
              2,
            ),
          );

          const child = spawn(
            "node",
            [PATHS.buildScript, mode],
            {
              cwd: process.cwd(),
              shell: true,
            },
          );

          let log = "";

          child.stdout.on("data", (data) => {
            log += data.toString();
          });

          child.stderr.on("data", (data) => {
            log += data.toString();
          });

          child.on("error", (error) => {
            res.statusCode = 500;
            res.setHeader(
              "Content-Type",
              "application/json",
            );

            res.end(
              JSON.stringify({
                ok: false,
                log: `${log}${error.message}`,
                outDir: `dist/${mode}`,
              }),
            );
          });

          child.on("close", (code) => {
            if (res.writableEnded) return;

            res.setHeader(
              "Content-Type",
              "application/json",
            );

            res.end(
              JSON.stringify({
                ok: code === 0,
                log,
                outDir: `dist/${mode}`,
              }),
            );
          });
        });
      });
    },
  };
}