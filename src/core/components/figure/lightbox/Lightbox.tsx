import styles from "./Lightbox.module.css";

import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { ZoomPan } from "./zoom-pan/ZoomPan";

type LightboxProps = {
    label: string;
    onClose: () => void;
    children: ReactNode;
};

export function Lightbox({ label, onClose, children }: LightboxProps) {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    return (
        <div
            className={styles.overlay}
            role="dialog"
            aria-modal="true"
            aria-label={label}
            onClick={onClose}
        >
            <div
                className={styles.content}
                onClick={(event) => event.stopPropagation()}
            >
                <ZoomPan>{children}</ZoomPan>

                <button
                    type="button"
                    className={styles.close}
                    onClick={onClose}
                    aria-label="Close figure"
                >
                    <X />
                </button>
            </div>
        </div>
    );
}