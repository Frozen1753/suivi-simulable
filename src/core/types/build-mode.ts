/**
 *   folder     -> normal Vite build, assets emitted to dist/folder/assets/
 *   singlefile -> everything (JS, CSS, every asset) inlined into one dist/singlefile/index.html
 *   hybrid     -> JS/CSS inlined into one HTML, but assets matching
 *                 report/assets.config.json stay external in dist/hybrid/assets/
 *
 * No Node or browser API in here: the export panel (browser) and the build (Node) both import it.
 */
export const BUILD_MODES = ["folder", "singlefile", "hybrid"] as const;

export type ReportBuildMode = (typeof BUILD_MODES)[number];

export function isBuildMode(value: unknown): value is ReportBuildMode {
  return (BUILD_MODES as readonly unknown[]).includes(value);
}
