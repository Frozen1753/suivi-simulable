import { Download } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { ReportBuildMode } from "../../../core/types/build-mode";
import { KNOWN_EXTENSIONS, SUPPORTED_ASSET_EXTENSIONS } from "../../../core/types/extensions";
import { FloatingButton } from "../../components/floating-button";
import { Panel } from "../panel/Panel";
import { BuildModeSelector } from "./components/BuildModeSelector";
import { ExportFeedback } from "./components/ExportFeedback";
import { HybridAssetOptions, type AssetItem } from "./components/HybridAssetOptions";

interface ExportResult {
  ok: boolean;
  log: string;
  outDir: string;
}

function toggleValue<T>(current: Set<T>, value: T): Set<T> {
  const next = new Set(current);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}

export function ExportPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<ReportBuildMode>("hybrid");
  const [excludedExt, setExcludedExt] = useState<Set<string>>(
    new Set(KNOWN_EXTENSIONS),
  );
  const [maxImageWidth, setMaxImageWidth] = useState(3000);
  const [maxAssetSizeMb, setMaxAssetSizeMb] = useState(5);
  const [assetNameFilter, setAssetNameFilter] = useState("");
  const [minimumAssetSizeMb, setMinimumAssetSizeMb] = useState(0);
  const [excludedFiles, setExcludedFiles] = useState<Set<string>>(new Set());
  const [detectedAssets, setDetectedAssets] = useState<AssetItem[]>([]);
  const [assetsLoading, setAssetsLoading] = useState(false);
  const [assetsError, setAssetsError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [result, setResult] = useState<ExportResult | null>(null);

  useEffect(() => {
    let cancelled = false;
    setAssetsLoading(true);

    fetch("/api/assets")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Unable to load assets (${response.status}).`);
        }
        return response.json();
      })
      .then((data: { files?: AssetItem[] }) => {
        if (!cancelled) {
          setDetectedAssets(Array.isArray(data.files) ? data.files : []);
          setAssetsError(null);
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setAssetsError(
            error instanceof Error ? error.message : String(error),
          );
        }
      })
      .finally(() => {
        if (!cancelled) setAssetsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const visibleAssets = useMemo(() => {
    const query = assetNameFilter.trim().toLocaleLowerCase();
    const minBytes = minimumAssetSizeMb * 1024 * 1024;

    return detectedAssets
      .filter((asset) => asset.path.toLocaleLowerCase().includes(query))
      .filter((asset) => asset.size >= minBytes)
      .sort(
        (a, b) =>
          b.size - a.size || a.path.localeCompare(b.path),
      );
  }, [assetNameFilter, detectedAssets, minimumAssetSizeMb]);

  async function handleExport() {
    setIsExporting(true);
    setResult(null);

    try {
      const response = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          excludeExtensions: Array.from(excludedExt),
          maxImageWidth,
          maxAssetSizeMb,
          excludeFiles: Array.from(excludedFiles),
        }),
      });

      if (!response.ok) {
        throw new Error(`Export failed (${response.status}).`);
      }

      setResult((await response.json()) as ExportResult);
    } catch (error) {
      setResult({
        ok: false,
        log: error instanceof Error ? error.message : String(error),
        outDir: "",
      });
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <>
      <FloatingButton
        onClick={() => setIsOpen(true)}
        aria-label="Open export panel"
        title="Export report"
      >
        <Download />
      </FloatingButton>

      <Panel
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Export report"
        maxWidth="46rem"
        footer={
          <>
            <Panel.Button
              variant="secondary"
              onClick={() => setIsOpen(false)}
            >
              Close
            </Panel.Button>

            <Panel.Button
              onClick={handleExport}
              disabled={isExporting}
            >
              {isExporting ? "Building…" : "Export"}
            </Panel.Button>
          </>
        }
      >
        <BuildModeSelector value={mode} onChange={setMode} />

        {mode === "hybrid" && (
          <HybridAssetOptions
            extensions={SUPPORTED_ASSET_EXTENSIONS}
            excludedExtensions={excludedExt}
            onToggleExtension={(extension) =>
              setExcludedExt((current) =>
                toggleValue(current, extension),
              )
            }
            maxImageWidth={maxImageWidth}
            onMaxImageWidthChange={setMaxImageWidth}
            maxAssetSizeMb={maxAssetSizeMb}
            onMaxAssetSizeMbChange={setMaxAssetSizeMb}
            assets={visibleAssets}
            totalAssets={detectedAssets.length}
            nameFilter={assetNameFilter}
            onNameFilterChange={setAssetNameFilter}
            minimumSizeMb={minimumAssetSizeMb}
            onMinimumSizeMbChange={setMinimumAssetSizeMb}
            excludedFiles={excludedFiles}
            onToggleFile={(file) =>
              setExcludedFiles((current) =>
                toggleValue(current, file),
              )
            }
            loading={assetsLoading}
            error={assetsError}
          />
        )}

        <ExportFeedback result={result} />
      </Panel>
    </>
  );
}