import { ArrowUp } from "lucide-react";
import { FloatingButton } from "../floating-button";
import styles from "./TopButton.module.css";

function topFunction() {
  document.body.scrollTop = 0; // Safari
  document.documentElement.scrollTop = 0; // Chrome, Firefox, IE and Opera
}

export function TopButton() {
  return (
    <FloatingButton
      variant="surface"
      className={styles.top}
      onClick={topFunction}
      aria-label="Back to top"
      title="Back to top"
    >
      <ArrowUp />
    </FloatingButton>
  );
}
