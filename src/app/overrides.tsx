import { Children, type ComponentProps, type ReactElement, type ReactNode } from "react";
import {
  Callout,
  Code,
  GlossaryProvider,
  GlossaryTerm,
  Link,
  Mermaid,
  Separator,
  type CalloutProps,
  type GlossaryTermProps,
  type LinkProps,
  type SeparatorProps,
} from "../core/components";
import { terms } from "../../report/custom/glossary";

function Pre({ children, ...meta }: ComponentProps<"pre">) {
  const child = Children.only(children) as ReactElement<{
    className?: string;
    children?: string;
  }>;
  const lang = /language-(\S+)/.exec(child.props.className ?? "")?.[1];
  return (
    <Code type="bloc" lang={lang} {...meta}>
      {(child.props.children ?? "").trimEnd()}
    </Code>
  );
}

function PreOrMermaid({
  children,
  ...props
}: {
  children?: ReactElement<{ className?: string; children?: string }>;
}) {
  const isMermaid = children?.props?.className?.includes("language-mermaid");
  if (isMermaid)
    return <Mermaid chart={String(children?.props?.children ?? "")} />;
  return <Pre {...props}>{children}</Pre>;
}

function Wrapper({ children }: { children?: ReactNode }) {
  return <GlossaryProvider terms={terms}>{children}</GlossaryProvider>;
}

export const mdxComponents = {
  wrapper: Wrapper,
  pre: PreOrMermaid,
  code: (props: any) => <Code type="inline" {...props} />,
  hr: () => <Separator />,
  separator: (props: SeparatorProps) => <Separator {...props} />,
  callout: (props: CalloutProps) => <Callout {...props} />,
  term: (props: GlossaryTermProps) => <GlossaryTerm {...props} />,
  a: ({ href, ...props }: ComponentProps<"a">) =>
    href ? <Link href={href} {...props} /> : <a {...props} />,
  link: (props: LinkProps) => <Link {...props} />
};
