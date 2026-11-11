import styles from "../ExportPanel.module.css";

interface ExportResult {
  ok: boolean;
  log: string;
  outDir: string;
}

export function ExportFeedback({
  result,
}: {
  result: ExportResult | null;
}) {
  if (!result) return null;

  return (
    <section
      className={`${styles.result} ${result.ok ? styles.success : styles.error
        }`}
      aria-live="polite"
    >
      <strong>
        {result.ok
          ? `Build créé dans ${result.outDir}/`
          : "Échec du build"}
      </strong>

      {result.log && (
        <pre className={styles.log}>{result.log}</pre>
      )}
    </section>
  );
}