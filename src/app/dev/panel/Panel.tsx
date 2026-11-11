import { X } from "lucide-react";
import { useEffect, useId, type ButtonHTMLAttributes, type ReactNode } from "react";
import styles from "./Panel.module.css";

interface PanelProps {
  isOpen: boolean;
  onClose: () => void;
  /** Panel name, rendered as the <h2> and used as the dialog's accessible name. */
  title: string;
  /** Extra header content, rendered between the title and the close button. */
  headerActions?: ReactNode;
  /** Footer content, typically <Panel.Button>s. */
  footer: ReactNode;
  /** Any CSS length. Defaults to 30rem. */
  maxWidth?: string;
  children: ReactNode;
}

/**
 * Modal shell shared by every floating panel: backdrop, header, scrollable
 * body and footer. It owns open/close behaviour (backdrop click, Escape) and
 * dialog semantics; callers own the content and the actions.
 */
function PanelRoot({
  isOpen,
  onClose,
  title,
  headerActions,
  footer,
  maxWidth,
  children,
}: PanelProps) {
  const titleId = useId();

  // Listen on document: a keydown handler on the backdrop <div> only fires
  // when focus is inside it, which is not the case after opening the modal
  // with a mouse click.
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    // The backdrop click is a pointer shortcut; keyboard users close via
    // Escape or the close button, hence role="presentation".
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events
    <div
      className={styles.overlay}
      role="presentation"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        style={{ maxWidth: maxWidth ?? "30rem" }}
      >
        <header className={styles.header}>
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          {headerActions}
          <button
            type="button"
            className={styles.close}
            onClick={onClose}
            aria-label="Close"
          >
            <X />
          </button>
        </header>

        <div className={styles.body}>{children}</div>

        <footer className={styles.footer}>{footer}</footer>
      </div>
    </div>
  );
}

/** Bordered group of related fields, with an uppercase legend. */
function PanelSection({ legend, children }: { legend: string; children: ReactNode }) {
  return (
    <fieldset className={styles.section}>
      <legend>{legend}</legend>
      {children}
    </fieldset>
  );
}

type PanelButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

function PanelButton({
  variant = "primary",
  type = "button",
  className = "",
  ...rest
}: PanelButtonProps) {
  return (
    <button
      type={type}
      className={`${styles.button} ${variant === "primary" ? styles.primary : styles.secondary} ${className}`}
      {...rest}
    />
  );
}

export const Panel = Object.assign(PanelRoot, {
  Section: PanelSection,
  Button: PanelButton,
});
