import { createContext, useContext, type ReactNode } from 'react';
import { normalize } from '../../utils/string/normalize';
import { Term } from './Term';

export type GlossaryEntries = Record<string, ReactNode>;

export type GlossaryTermProps = {
    id?: string;
    children?: ReactNode;
};

const GlossaryContext = createContext<ReadonlyMap<string, ReactNode>>(new Map());

export function GlossaryProvider({
    terms,
    children,
}: {
    terms: GlossaryEntries;
    children: ReactNode;
}) {
    const map = new Map(
        Object.entries(terms).map(([word, tooltip]) => [normalize(word), tooltip]),
    );
    return <GlossaryContext.Provider value={map}>{children}</GlossaryContext.Provider>;
}

export function GlossaryTerm({ id, children }: GlossaryTermProps) {
    const entries = useContext(GlossaryContext);
    const key = id ?? (typeof children === 'string' ? children : undefined);
    const tooltip = key === undefined ? undefined : entries.get(normalize(key));

    if (tooltip === undefined) {
        console.error(`unknown term: ${key ?? '(no id and non-text label)'}`);
        return <b>UNKNOWN_TERM</b>;
    }
    return <Term tooltip={tooltip}>{children ?? key}</Term>;
}