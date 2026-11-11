import styles from "./Separator.module.css";

export type SeparatorProps = {
  label?: string;
};

export function Separator({ label }: SeparatorProps) {
  if (!label) {
    return <hr className={styles.separator} />;
  }

  return (
    <div className={styles["separator-labeled"]} role="separator">
      <span className={styles["separator-line"]} />
      <span className={styles["separator-label"]}>{label}</span>
      <span className={styles["separator-line"]} />
    </div>
  );
}