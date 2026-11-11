import styles from "./ZoomPan.module.css";

import type { ReactNode } from 'react';
import { useZoomPan } from './useZoomPan';

interface ZoomPanProps {
  children: ReactNode;
}

export function ZoomPan({ children }: ZoomPanProps) {
  const { containerRef, contentRef, scale, x, y, isZoomed, handlers } = useZoomPan();

  return (
    <div ref={containerRef} className={styles.pan} data-zoomed={isZoomed} {...handlers}>
      <div
        ref={contentRef}
        className={styles.content}
        style={{ transform: `translate(${x}px, ${y}px) scale(${scale})` }}
      >
        {children}
      </div>

      <p className={styles.hint}>
        Scroll or pinch to zoom · drag to pan · double-click to reset
      </p>
    </div>
  );
}
