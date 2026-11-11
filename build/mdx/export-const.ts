import { valueToEstree } from 'estree-util-value-to-estree';

/** `export const <name> = <value>` as an MDX ESM node, ready for `tree.children.unshift(...)`. */
export function exportConst(name: string, value: unknown) {
    return {
        type: 'mdxjsEsm',
        value: '',
        data: {
            estree: {
                type: 'Program',
                sourceType: 'module',
                body: [
                    {
                        type: 'ExportNamedDeclaration',
                        specifiers: [],
                        source: null,
                        declaration: {
                            type: 'VariableDeclaration',
                            kind: 'const',
                            declarations: [
                                {
                                    type: 'VariableDeclarator',
                                    id: { type: 'Identifier', name },
                                    init: valueToEstree(value),
                                },
                            ],
                        },
                    },
                ],
            },
        },
    } as never;
}
