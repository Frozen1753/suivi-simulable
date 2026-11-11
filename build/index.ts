import mdx, { type Options as MdxOptions } from "@mdx-js/rollup";
import babel from "@rolldown/plugin-babel";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import path from "node:path";
import rehypeMdxCodeProps from "rehype-mdx-code-props";
import rehypeMdxImportMedia from "rehype-mdx-import-media";
import remarkDirective from "remark-directive";
import remarkDirectiveRehype from "remark-directive-rehype";
import remarkGfm from "remark-gfm";
import { visualizer } from "rollup-plugin-visualizer";
import type { PluginOption, UserConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import svgr from "vite-plugin-svgr";
import { loadAssetConfig, shouldInlineAsset } from "./assets/rules.ts";
import { assetsServerPlugin } from "./assets/server.ts";
import { exportServerPlugin } from "./export/server.ts";
import { inlineFaviconPlugin } from "./favicon/plugin.ts";
import remarkFigures from "./mdx/remark-figures.ts";
import remarkHeadingNumbers from "./mdx/remark-heading-numbers.ts";
import { mermaidPlugin, remarkMermaidCollect } from "./mermaid/plugin.ts";
import { currentBuildMode } from "./modes.ts";
import { shikiPlugin } from "./shiki/plugin.ts";
import { shikiThemesServerPlugin } from "./shiki/themes-server.ts";
import { themeServerPlugin } from "./theme/server.ts";

/**
 * The whole Vite configuration of Report Maker. vite.config.ts only calls this.
 * Build mode comes from REPORT_BUILD_MODE (see build/modes.ts).
 */
export function reportMaker(): UserConfig {
  const buildMode = currentBuildMode();
  const assetConfig = loadAssetConfig();

  // Shared by mdx() and shikiPlugin(): the report is parsed by both.
  const remarkPlugins: MdxOptions["remarkPlugins"] = [
    remarkGfm,
    remarkHeadingNumbers,
    remarkFigures,
    remarkDirective,
    remarkDirectiveRehype,
    remarkMermaidCollect,
  ];

  return {
    base: buildMode === "folder" ? "/" : "./",

    resolve: { alias: { "report-maker": path.resolve(process.cwd(), "src/core/mdx.ts") } },

    plugins: [
      // Must run before @vitejs/plugin-react transforms the JSX MDX compiles down to.
      {
        enforce: "pre",
        ...mdx({ remarkPlugins, rehypePlugins: [rehypeMdxCodeProps, rehypeMdxImportMedia] }),
      },
      shikiPlugin({ remarkPlugins }),

      react({ include: /\.(jsx|js|mdx|md|tsx|ts)$/ }),

      svgr(),

      // Dev-only endpoints for the panels (all `apply: "serve"`).
      exportServerPlugin(),
      themeServerPlugin(),
      assetsServerPlugin(),
      shikiThemesServerPlugin(),
      mermaidPlugin(),

      buildMode !== "folder" && inlineFaviconPlugin(),

      // Full single-file mode: let the plugin apply its recommended config
      // (it force-inlines every JS/CSS/asset into one HTML — see its source).
      buildMode === "singlefile" && viteSingleFile(),

      // Hybrid mode: we still want JS/CSS inlined into one HTML, but NOT its
      // blanket "inline every asset" behavior, so we disable the recommended
      // config and set assetsInlineLimit ourselves below instead.
      buildMode === "hybrid" && viteSingleFile({ useRecommendedBuildConfig: false }),

      babel({ presets: [reactCompilerPreset()] }),
    ].filter(Boolean) as PluginOption[],

    build: {
      outDir: `dist/${buildMode}`,
      cssCodeSplit: buildMode === "folder",
      assetsDir: buildMode === "folder" ? "assets" : "",
      chunkSizeWarningLimit: buildMode === "folder" ? undefined : 100_000_000,
      assetsInlineLimit:
        buildMode === "hybrid"
          ? (filePath: string, content: Buffer) =>
            shouldInlineAsset(filePath, content, assetConfig)
          : undefined, // folder: Vite's default 4kb threshold · singlefile: forced true by the plugin
      minify: "terser",
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
        format: {
          comments: false,
        },
      },
      rolldownOptions: {
        plugins: [
          visualizer({
            filename: "stats.html",
            open: true,
            gzipSize: true,
            brotliSize: true,
          }),
        ],
      },
    },
  };
}
