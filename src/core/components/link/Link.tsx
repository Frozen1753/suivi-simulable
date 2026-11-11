import { ExternalLinkIcon, LinkIcon } from "lucide-react";
import type { AnchorHTMLAttributes } from "react";
import styles from "./Link.module.css";

export type LinkProps = Omit<
    AnchorHTMLAttributes<HTMLAnchorElement>,
    "href"
> & {
    href: string;
    icon?: boolean;
};

function isExternalLink(href: string): boolean {
    // mailto:, tel: et javascript: ne sont pas des liens web externes.
    if (!/^https?:\/\//i.test(href)) return false;

    // rendu sans window, SSR, etc., toute URL absolue est externe.
    if (typeof window === "undefined") return true;

    try {
        return new URL(href).origin !== window.location.origin;
    } catch {
        return false;
    }
}

export function Link({ href, children, icon, ...props }: LinkProps) {
    const external = isExternalLink(href);

    return (
        <a
            href={href}
            className={styles.link}
            {...(external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
            {...props}
        >
            {children}
            {icon && (external ? <ExternalLinkIcon /> : <LinkIcon />)}
        </a>
    );
}
