import type { Root } from 'mdast';
import type { MdxJsxFlowElement } from 'mdast-util-mdx-jsx';
import { toString as mdastToString } from 'mdast-util-to-string';
import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';
import type { FigureEntry } from '../../src/core/types/mdx-exports.ts';
import { exportConst } from './export-const.ts';

export interface RemarkFiguresOptions {
    /** Nom du composant MDX (default: "Figure") */
    componentName?: string;
    /** Nom de l'export injecté dans le module MDX compilé (default: "figures") */
    exportName?: string;
}

/**
 * Pour chaque <Figure> :
 *   1. lui injecte les props `id` ("figure-3") et `number` ("3")
 *   2. remonte les <Figure.Media|Caption|Lightbox> écrits sur une ligne
 *      (enveloppés dans un <p> par MDX) au niveau flow
 *   3. exporte `figures` pour construire la liste des figures
 */
const remarkFigures: Plugin<[RemarkFiguresOptions?], Root> = (options = {}) => {
    const { componentName = 'Figure', exportName = 'figures' } = options;
    const partPrefix = `${componentName}.`;
    const captionName = `${componentName}.Caption`;

    return (tree, file) => {
        const figures: FigureEntry[] = [];

        visit(tree, 'mdxJsxFlowElement', (node: MdxJsxFlowElement) => {
            if (node.name !== componentName) return;

            node.children = node.children.map((child) => {
                if (child.type !== 'paragraph' || child.children.length !== 1) return child;
                const [only] = child.children;
                if (only.type === 'mdxJsxTextElement' && only.name?.startsWith(partPrefix)) {
                    return { ...only, type: 'mdxJsxFlowElement' } as never;
                }
                return child;
            });

            const number = String(figures.length + 1);
            const id = `figure-${number}`;
            const caption = node.children.find(
                (child) => child.type === 'mdxJsxFlowElement' && child.name === captionName,
            );

            node.attributes.push(
                { type: 'mdxJsxAttribute', name: 'id', value: id },
                { type: 'mdxJsxAttribute', name: 'number', value: number },
            );

            figures.push({ id, number, caption: caption ? mdastToString(caption).trim() : '' });
        });

        tree.children.unshift(exportConst(exportName, figures));
        file.data.figures = figures;
    };
};

export default remarkFigures;