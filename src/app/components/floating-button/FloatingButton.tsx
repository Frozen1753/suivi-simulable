import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./FloatingButton.module.css";

type FloatingButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "surface";
};

export function FloatingButton({
  variant = "primary",
  type = "button",
  className = "",
  ...rest
}: FloatingButtonProps) {
  return (
    <button
      type={type}
      className={`${styles.button} ${variant === "surface" ? styles.surface : ""} ${className}`}
      {...rest}
    />
  );
}

export function FloatingButtons({ children }: { children: ReactNode }) {
  return <div className={styles.stack}>{children}</div>;
}
