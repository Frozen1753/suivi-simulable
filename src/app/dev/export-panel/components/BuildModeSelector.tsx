import type { ReportBuildMode } from "../../../../core/types/build-mode";
import { Panel } from "../../panel/Panel";
import styles from "../ExportPanel.module.css";

const MODES: {
  value: ReportBuildMode;
  label: string;
  description: string;
}[] = [
    {
      value: "folder",
      label: "Folder",
      description: "index.html et un dossier assets/ séparé.",
    },
    {
      value: "singlefile",
      label: "Single file",
      description: "Le HTML contient le JS, le CSS et tous les médias intégrés.",
    },
    {
      value: "hybrid",
      label: "Hybrid",
      description: "Un seul HTML pour le JS/CSS ; les médias exclus restent dans assets/.",
    },
  ];

interface Props {
  value: ReportBuildMode;
  onChange: (value: ReportBuildMode) => void;
}

export function BuildModeSelector({ value, onChange }: Props) {
  return (
    <Panel.Section legend="Build mode">
      <div className={styles.modeGrid}>
        {MODES.map((mode) => (
          <label
            key={mode.value}
            className={`${styles.modeOption} ${value === mode.value ? styles.modeOptionSelected : ""
              }`}
          >
            <input
              type="radio"
              name="report-export-mode"
              value={mode.value}
              checked={value === mode.value}
              onChange={() => onChange(mode.value)}
            />

            <span className={styles.modeContent}>
              <strong>{mode.label}</strong>
              <small>{mode.description}</small>
            </span>
          </label>
        ))}
      </div>
    </Panel.Section>
  );
}