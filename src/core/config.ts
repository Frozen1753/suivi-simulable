import type { ReactNode } from "react";

export type CoverMedia = {
  content: ReactNode;
  href?: string;
  ariaLabel?: string;
};

export type Author = {
  firstName?: string;
  lastName?: string;
  alias?: string;
  href?: string;
};

export type ReportConfig = {
  /** Browser tab title, and the default title of the header and of the cover page. */
  title: string;
  header?: {
    title?: string;
    logo?: ReactNode;
    logoAlt?: string;
  };
  cover?: {
    title?: string;
    media?: CoverMedia;
    /** Defaults to today's date. */
    date?: string;
    authors?: Author[];
    affiliations?: string[];
  };
};

/** Identity helper: autocompletion and type-checking for report/report.config.tsx. */
export function defineReport(config: ReportConfig): ReportConfig {
  return config;
}
