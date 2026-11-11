declare module '*.mdx' {
  import type { ComponentType } from 'react';
  import type { FigureEntry } from '../utils/mdx-plugins/remark-figures';
  import type { TocEntry } from '../utils/mdx-plugins/remark-heading-numbers';

  export const toc: TocEntry[];
  export const figures: FigureEntry[];

  const MDXComponent: ComponentType<Record<string, unknown>>;
  export default MDXComponent;
}
