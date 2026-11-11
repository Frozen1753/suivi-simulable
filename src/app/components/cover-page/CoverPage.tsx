import type { Author, CoverMedia } from "../../../core/config";
import styles from "./CoverPage.module.css";

type CoverPageProps = {
  title?: string;
  coverMedia?: CoverMedia;
  date?: string;
  authors?: Author[];
  affiliations?: string[];
};

export function CoverPage({
  title = "My report",
  coverMedia,
  date = new Date().toLocaleDateString(navigator.languages, {
    dateStyle: "long",
  }),
  authors = [],
  affiliations = [],
}: CoverPageProps) {
  return (
    <section className={styles["cover-page"]} aria-labelledby="cover-title">
      <h1 id="cover-title">{title}</h1>

      {coverMedia && (
        <div className={styles["cover-media"]}>
          {coverMedia.href ? (
            <a
              href={coverMedia.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={coverMedia.ariaLabel}
            >
              {coverMedia.content}
            </a>
          ) : (
            coverMedia.content
          )}
        </div>
      )}

      <div className={styles["cover-authors"]}>
        <time className={styles["info-line"]} dateTime={date}>
          {date}
        </time>

        {authors.map((author, index) => {
          const fullName = [author.firstName, author.lastName]
            .filter(Boolean)
            .join(" ");

          const displayName = author.alias
            ? `${fullName} (${author.alias})`
            : fullName;

          if (!displayName) return null;

          return (
            <div
              className={`${styles["info-line"]} ${styles.authors}`}
              key={author.href ?? index}
            >
              {author.href ? (
                <a href={author.href} target="_blank" rel="noopener noreferrer">
                  {displayName}
                </a>
              ) : (
                displayName
              )}
            </div>
          );
        })}

        {affiliations.map((affiliation, index) => (
          <div className={styles["info-line"]} key={`${affiliation}-${index}`}>
            {affiliation}
          </div>
        ))}
      </div>
    </section>
  );
}
