import fs from "node:fs";
import type { Plugin } from "vite";
import { PATHS, resolvePath } from "../paths.ts";

/** SVG -> data: URI, escaping only what must be (smaller than encodeURIComponent). */
export function svgToDataUri(svg: string): string {
  const encoded = svg
    .replace(/<metadata[\s\S]*?<\/metadata>/g, "") // editors/AI tools embed provenance blobs here: dead weight
    .replace(/\s+/g, " ")
    .replace(/"/g, "'")
    .replace(/%/g, "%25")
    .replace(/#/g, "%23")
    .replace(/</g, "%3C")
    .replace(/>/g, "%3E")
    .trim();
  return `data:image/svg+xml,${encoded}`;
}

/**
 * The favicon is referenced by index.html, which Vite handles as a separate
 * asset: in singlefile/hybrid builds it would end up next to index.html as
 * favicon-<hash>.svg. This inlines it in the <link> instead.
 * Only meant for builds that must produce a single HTML file.
 */
export function inlineFaviconPlugin(): Plugin {
  return {
    name: "report-maker:inline-favicon",
    apply: "build",
    transformIndexHtml: {
      order: "pre",
      handler(html) {
        const href = `href="/${PATHS.favicon}"`;
        if (!html.includes(href)) return html;
        const svg = fs.readFileSync(resolvePath("favicon"), "utf-8");
        return html.replace(href, `href="${svgToDataUri(svg)}"`);
      },
    },
  };
}
