import { useCallback, useState, type ReactNode } from "react";
import { createSlot, readSlots } from "../../utils/components/slots";
import styles from "./Figure.module.css";
import { Lightbox as FigureLightbox } from "./lightbox/Lightbox";

export type FigureProps = {
  id?: string;
  number?: string;
  children: ReactNode;
  lightbox?: boolean;
  className?: string;
};

export type FigurePartProps = {
  children: ReactNode;
};

const Media = createSlot<FigurePartProps>("Figure.Media");
const Caption = createSlot<FigurePartProps>("Figure.Caption");
const Lightbox = createSlot<FigurePartProps>("Figure.Lightbox");

function FigureRoot({
  children,
  id,
  number,
  lightbox = false,
  className = "",
}: FigureProps) {
  const label = number ? `Figure ${number}` : "Figure";
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  const slots = readSlots(
    children,
    [Media, Caption, Lightbox] as const,
    "Figure",
  );

  const media = slots.find((s) => s.slot === Media)?.props.children;
  const caption = slots.find((s) => s.slot === Caption)?.props.children;
  const lightboxContent = slots.find((s) => s.slot === Lightbox)?.props.children;

  if (media === undefined) {
    console.warn("Figure requires a <Figure.Media> child.");
    return null;
  }

  const hasLightbox = lightbox || lightboxContent !== undefined;

  return (
    <>
      <figure
        id={id}
        className={`${styles.figure} ${hasLightbox ? styles.clickable : ""} ${className}`}
        onClick={hasLightbox ? () => setOpen(true) : undefined}
      >
        <div className={styles.media}>{media}</div>

        <figcaption className={styles.figcaption}>
          <span className={styles.label}>{label}</span>
          {caption && <span>{caption}</span>}
        </figcaption>
      </figure>

      {open && (
        <FigureLightbox label={label} onClose={close}>
          {lightboxContent ?? media}
        </FigureLightbox>
      )}
    </>
  );
}

export const Figure = Object.assign(FigureRoot, { Media, Caption, Lightbox });