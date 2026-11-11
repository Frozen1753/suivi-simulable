import type { FigureEntry } from "../../types/mdx-exports";
import styles from "./toc.module.css";

type ListOfFiguresProps = {
    title?: string;
    items: FigureEntry[];
};

export function ListOfFigures({ title = 'Liste des figures', items }: ListOfFiguresProps) {
    if (items.length === 0) return null;

    return (
        <>
            <h1>{title}</h1>

            <nav className={styles.toc} aria-label={title}>
                <ul className={styles.list}>
                    {items.map((item) => (
                        <li key={item.id} className={styles.item}>
                            <div className={styles.row}>
                                <a href={`#${item.id}`} className={styles.link}>
                                    <span className={styles.number}>Figure {item.number} :</span>
                                    {item.caption && <span>{item.caption}</span>}
                                </a>
                            </div>
                        </li>
                    ))}
                </ul>
            </nav>
        </>
    );
}