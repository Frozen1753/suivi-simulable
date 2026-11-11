export const SUPPORTED_ASSET_EXTENSIONS = [
    // Images
    ".png", ".jpg", ".jpeg", ".webp", ".avif",
    ".gif", ".svg", ".bmp", ".tif", ".tiff", ".ico",

    // Vidéos
    ".mp4", ".m4v", ".mov", ".webm", ".ogv", ".avi", ".mkv",

    // Audio
    ".mp3", ".m4a", ".aac", ".wav", ".ogg", ".opus", ".flac",

    // Polices
    ".woff", ".woff2", ".ttf", ".otf",

    // Documents
    ".pdf",
] as const;

export const KNOWN_EXTENSIONS = [
    ".gif",
    ".mp4", ".m4v", ".mov", ".webm", ".ogv", ".avi", ".mkv",
    ".mp3", ".m4a", ".aac", ".wav", ".ogg", ".opus", ".flac",
] as const;