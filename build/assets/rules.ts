import { imageSize } from "image-size";
import fs from "node:fs";
import path from "node:path";
import { KNOWN_EXTENSIONS } from "../../src/core/types/extensions.ts";
import { resolvePath } from "../paths.ts";

export interface AssetExclusionConfig {
  excludeExtensions: string[];
  maxImageWidth: number;
  maxAssetSizeMb: number;
  excludeFiles: string[];
}

const CONFIG_PATH = resolvePath("assetsConfig");

export const DEFAULT_ASSET_CONFIG: AssetExclusionConfig = {
  excludeExtensions: [...KNOWN_EXTENSIONS],
  maxImageWidth: 3000,
  maxAssetSizeMb: 5,
  excludeFiles: [],
};

function normalizeConfig(
  user: Partial<AssetExclusionConfig>,
): AssetExclusionConfig {
  return {
    excludeExtensions: Array.isArray(user.excludeExtensions)
      ? user.excludeExtensions.filter(
        (value): value is string => typeof value === "string",
      )
      : DEFAULT_ASSET_CONFIG.excludeExtensions,

    maxImageWidth:
      typeof user.maxImageWidth === "number" &&
        Number.isFinite(user.maxImageWidth)
        ? Math.max(0, user.maxImageWidth)
        : DEFAULT_ASSET_CONFIG.maxImageWidth,

    maxAssetSizeMb:
      typeof user.maxAssetSizeMb === "number" &&
        Number.isFinite(user.maxAssetSizeMb)
        ? Math.max(0, user.maxAssetSizeMb)
        : DEFAULT_ASSET_CONFIG.maxAssetSizeMb,

    excludeFiles: Array.isArray(user.excludeFiles)
      ? user.excludeFiles.filter(
        (value): value is string => typeof value === "string",
      )
      : DEFAULT_ASSET_CONFIG.excludeFiles,
  };
}

export function loadAssetConfig(): AssetExclusionConfig {
  if (!fs.existsSync(CONFIG_PATH)) {
    return DEFAULT_ASSET_CONFIG;
  }

  try {
    const user = JSON.parse(
      fs.readFileSync(CONFIG_PATH, "utf-8"),
    ) as Partial<AssetExclusionConfig>;

    return normalizeConfig(user);
  } catch {
    console.warn(
      "[report-maker] Could not parse report.assets.config.json — using defaults.",
    );

    return DEFAULT_ASSET_CONFIG;
  }
}

export function shouldInlineAsset(
  filePath: string,
  content: Buffer,
  config: AssetExclusionConfig,
): boolean {
  const ext = path.extname(filePath).toLowerCase();

  if (config.excludeFiles.some((file) => filePath.endsWith(file))) {
    return false;
  }

  if (config.excludeExtensions.includes(ext)) {
    return false;
  }

  const maxBytes = config.maxAssetSizeMb * 1024 * 1024;

  if (content.byteLength > maxBytes) {
    return false;
  }

  if ([".png", ".jpg", ".jpeg", ".webp"].includes(ext)) {
    try {
      const { width } = imageSize(content);

      if (width && width > config.maxImageWidth) {
        return false;
      }
    } catch {
      // Si les dimensions sont illisibles, la limite de poids reste appliquée.
    }
  }

  return true;
}