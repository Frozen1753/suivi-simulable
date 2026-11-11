import type { ElementType } from "react";

/**
 * Extra MDX components, usable in report.mdx WITHOUT an import. A name that
 * already exists (`a`, `pre`, `Callout`...) replaces the built-in one.
 *
 * You usually don't need this: to use your own component, import it at the top
 * of report.mdx (`import MyChart from "./custom/MyChart"`).
 */
export const components: Record<string, ElementType> = {};
