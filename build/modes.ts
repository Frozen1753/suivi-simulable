import { BUILD_MODES, isBuildMode, type ReportBuildMode } from "../src/core/types/build-mode.ts";

export { BUILD_MODES, isBuildMode, type ReportBuildMode };

/** Set by build/build-report.mjs (see package.json "build:*" scripts). */
export function currentBuildMode(): ReportBuildMode {
  const mode = process.env.REPORT_BUILD_MODE ?? "folder";
  if (!isBuildMode(mode)) {
    throw new Error(`Unknown REPORT_BUILD_MODE "${mode}". Use one of: ${BUILD_MODES.join(", ")}`);
  }
  return mode;
}
