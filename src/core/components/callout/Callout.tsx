import {
  InfoIcon,
  Lightbulb,
  MessageCircleWarning,
  SquareExclamationPoint,
  StickyNote,
  TriangleAlert,
} from "lucide-react";
import type { ComponentType, ReactNode } from "react";

import styles from "./Callout.module.css";

type CalloutType =
  "info" | "tip" | "note" | "warning" | "caution" | "important";

export type CalloutProps = {
  type?: CalloutType;
  title?: string;
  children: ReactNode;
};

type CalloutConfig = {
  title: string;
  Icon: ComponentType<{
    size?: number;
    strokeWidth?: number;
    "aria-hidden"?: boolean;
  }>;
};

const CALLOUT_CONFIG: Record<CalloutType, CalloutConfig> = {
  info: {
    title: "Info",
    Icon: InfoIcon,
  },
  tip: {
    title: "Tip",
    Icon: Lightbulb,
  },
  note: {
    title: "Note",
    Icon: StickyNote,
  },
  warning: {
    title: "Warning",
    Icon: TriangleAlert,
  },
  caution: {
    title: "Caution",
    Icon: SquareExclamationPoint,
  },
  important: {
    title: "Important",
    Icon: MessageCircleWarning,
  },
};

const CALLOUT_VARIANT_CLASS: Record<CalloutType, string> = {
  info: styles["callout-info"],
  tip: styles["callout-tip"],
  note: styles["callout-note"],
  warning: styles["callout-warning"],
  caution: styles["callout-caution"],
  important: styles["callout-important"],
};

export function Callout({ type = "note", title, children }: CalloutProps) {
  const { title: defaultTitle, Icon } = CALLOUT_CONFIG[type];
  const isAlert = type === "warning" || type === "caution";

  return (
    <aside
      className={`${styles.callout} ${CALLOUT_VARIANT_CLASS[type]}`}
      role={isAlert ? "alert" : undefined}
    >
      <div className={styles["callout-heading"]}>
        <Icon size={22} strokeWidth={2.25} aria-hidden />

        <div className={styles["callout-title"]}>{title ?? defaultTitle}</div>
      </div>

      <div className={styles["callout-body"]}>{children}</div>
    </aside>
  );
}
