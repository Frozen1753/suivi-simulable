import { Search } from "lucide-react";
import { Panel } from "../../panel/Panel";
import styles from "../ExportPanel.module.css";

export interface AssetItem {
  path: string;
  size: number;
}

interface Props {
  extensions: readonly string[];
  excludedExtensions: Set<string>;
  onToggleExtension: (extension: string) => void;

  maxImageWidth: number;
  onMaxImageWidthChange: (value: number) => void;

  maxAssetSizeMb: number;
  onMaxAssetSizeMbChange: (value: number) => void;

  assets: AssetItem[];
  totalAssets: number;

  nameFilter: string;
  onNameFilterChange: (value: string) => void;

  minimumSizeMb: number;
  onMinimumSizeMbChange: (value: number) => void;

  excludedFiles: Set<string>;
  onToggleFile: (file: string) => void;

  loading: boolean;
  error: string | null;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(0)} Ko`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} Mo`;
}

export function HybridAssetOptions({
  extensions,
  excludedExtensions,
  onToggleExtension,
  maxImageWidth,
  onMaxImageWidthChange,
  maxAssetSizeMb,
  onMaxAssetSizeMbChange,
  assets,
  totalAssets,
  nameFilter,
  onNameFilterChange,
  minimumSizeMb,
  onMinimumSizeMbChange,
  excludedFiles,
  onToggleFile,
  loading,
  error,
}: Props) {
  return (
    <Panel.Section legend="Hybrid · règles des assets">
      <div className={styles.fieldGroup}>
        <span className={styles.fieldLabel}>
          Toujours garder ces formats à l’extérieur
        </span>

        <div className={styles.chipList}>
          {extensions.map((extension) => (
            <label key={extension} className={styles.chip}>
              <input
                type="checkbox"
                checked={excludedExtensions.has(extension)}
                onChange={() => onToggleExtension(extension)}
              />
              <span>{extension}</span>
            </label>
          ))}
        </div>

        <p className={styles.helpText}>
          Les formats cochés ne seront jamais intégrés au HTML,
          quelle que soit leur taille.
        </p>
      </div>

      <div className={styles.thresholdGrid}>
        <label className={styles.thresholdField}>
          <span className={styles.fieldLabel}>
            Largeur maximale des images
          </span>

          <span className={styles.inputWithUnit}>
            <input
              type="number"
              min={0}
              step={100}
              value={maxImageWidth}
              onChange={(event) =>
                onMaxImageWidthChange(
                  Math.max(0, Number(event.target.value) || 0),
                )
              }
            />
            <span>px</span>
          </span>

          <small>
            Les images plus larges restent dans assets/.
          </small>
        </label>

        <label className={styles.thresholdField}>
          <span className={styles.fieldLabel}>
            Poids maximal à intégrer
          </span>

          <span className={styles.inputWithUnit}>
            <input
              type="number"
              min={0}
              step={1}
              value={maxAssetSizeMb}
              onChange={(event) =>
                onMaxAssetSizeMbChange(
                  Math.max(0, Number(event.target.value) || 0),
                )
              }
            />
            <span>Mo</span>
          </span>

          <small>
            Tout asset plus lourd reste externe. 0 Mo désactive
            l’intégration des fichiers non vides.
          </small>
        </label>
      </div>

      <div className={styles.assetBrowser}>
        <div className={styles.assetBrowserHeader}>
          <div>
            <span className={styles.fieldLabel}>
              Exclusion fichier par fichier
            </span>

            <p className={styles.helpText}>
              Coche un fichier pour le laisser dans assets/,
              indépendamment des règles ci-dessus.
            </p>
          </div>

          <span className={styles.assetCount}>{totalAssets}</span>
        </div>

        <label className={styles.searchField}>
          <Search size={16} aria-hidden="true" />

          <input
            type="search"
            value={nameFilter}
            onChange={(event) =>
              onNameFilterChange(event.target.value)
            }
            placeholder="Rechercher par nom ou chemin…"
            aria-label="Filtrer les assets par nom"
          />
        </label>

        <label className={styles.sizeFilter}>
          <span>Afficher les fichiers d’au moins</span>

          <select
            value={minimumSizeMb}
            onChange={(event) =>
              onMinimumSizeMbChange(Number(event.target.value))
            }
          >
            <option value={0}>Toutes les tailles</option>
            <option value={1}>1 Mo</option>
            <option value={5}>5 Mo</option>
            <option value={10}>10 Mo</option>
            <option value={25}>25 Mo</option>
          </select>
        </label>

        {error ? (
          <p className={styles.errorMessage}>{error}</p>
        ) : loading ? (
          <p className={styles.emptyState}>Chargement des assets…</p>
        ) : assets.length > 0 ? (
          <div className={styles.assetList}>
            {assets.map((asset) => (
              <label key={asset.path} className={styles.assetRow}>
                <input
                  type="checkbox"
                  checked={excludedFiles.has(asset.path)}
                  onChange={() => onToggleFile(asset.path)}
                />

                <span
                  className={styles.assetPath}
                  title={asset.path}
                >
                  {asset.path}
                </span>

                <small className={styles.assetSize}>
                  {formatSize(asset.size)}
                </small>

                {excludedFiles.has(asset.path) && (
                  <small className={styles.externalTag}>
                    Externe
                  </small>
                )}
              </label>
            ))}
          </div>
        ) : (
          <p className={styles.emptyState}>
            {totalAssets === 0
              ? "Aucun asset compatible détecté dans assets/."
              : "Aucun fichier ne correspond à ces filtres."}
          </p>
        )}

        <p className={styles.helpText}>
          {assets.length} fichier(s) affiché(s) sur {totalAssets}.
          La liste est triée du plus lourd au plus léger.
        </p>
      </div>
    </Panel.Section>
  );
}