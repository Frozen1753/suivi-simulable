import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

import styles from "./Collapsible.module.css";

type CollapsibleProps = {
  title?: string;
  open?: boolean;
  children: ReactNode;
};

export function Collapsible({
  title = "Voir plus d'informations",
  open = false,
  children,
}: CollapsibleProps) {
  return (
    <details className={styles.collapsible} open={open}>
      <summary className={styles["collapsible-summary"]}>
        <span className={styles["collapsible-chevron"]} aria-hidden="true">
          <ChevronRight size={18} strokeWidth={2.25} />
        </span>
        <span>{title}</span>
      </summary>

      <div className={styles["collapsible-content"]}>{children}</div>
    </details>
  );
}
