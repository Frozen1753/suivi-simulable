import { useEffect } from "react";
import { CoverPage } from "./components/cover-page/CoverPage";
import { ExportPanel } from "./dev/export-panel/ExportPanel";
import { FloatingButtons } from "./components/floating-button";
import { Header } from "./components/header/Header";
import { ThemePanel } from "./dev/theme-panel/ThemePanel";
import { ThemeToggle } from "./components/theme-toggle/ThemeToggle";
import { ListOfFigures } from "../core/components/toc/ListOfFigures";
import { TableOfContent } from "../core/components/toc/TableOfContent";
import { TopButton } from "./components/top-button/TopButton";
import { mdxComponents } from "./overrides";
import config from "../../report/report.config";
import Report, { figures, toc } from "../../report/report.mdx";

export default function App() {
  const { title, header, cover } = config;

  useEffect(() => {
    document.title = title;
  }, [title]);

  return (
    <div>
      <Header
        title={header?.title ?? title}
        logo={header?.logo}
        logoAlt={header?.logoAlt}
      />
      <main>
        <CoverPage
          title={cover?.title ?? title}
          coverMedia={cover?.media}
          date={cover?.date}
          authors={cover?.authors}
          affiliations={cover?.affiliations}
        />

        <TableOfContent items={toc} />
        <ListOfFigures items={figures} />

        <div>
          <Report components={mdxComponents} />
        </div>
      </main>

      <TopButton />
      <FloatingButtons>
        <ThemeToggle />
        {import.meta.env.DEV && (
          <>
            <ExportPanel />
            <ThemePanel />
          </>
        )}
      </FloatingButtons>
    </div>
  );
}
