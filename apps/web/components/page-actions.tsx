import Link from "next/link";
import type { ReactNode } from "react";
import { site } from "../lib/site";

const BASE =
  "inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg px-3.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring [&_svg]:size-4 [&_svg]:shrink-0";

const VARIANTS = {
  primary: `${BASE} bg-primary text-primary-foreground hover:bg-primary/90`,
  outline: `${BASE} border border-border bg-background text-foreground hover:bg-muted`,
} as const;

export function ActionLink({
  href,
  variant = "outline",
  children,
}: {
  href: string;
  variant?: keyof typeof VARIANTS;
  children: ReactNode;
}) {
  return (
    <Link className={VARIANTS[variant]} href={href}>
      {children}
    </Link>
  );
}

function XMark() {
  return (
    <svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

/** A plain intent link: no script, no tracking, and it works before hydration. */
export function ShareOnX({ route, text }: { route: string; text: string }) {
  const intent = new URL("https://x.com/intent/post");
  intent.searchParams.set("text", text);
  intent.searchParams.set("url", `${site.url}${route}`);

  return (
    <a className={VARIANTS.outline} href={intent.href} rel="noopener noreferrer" target="_blank">
      <XMark />
      Share
      <span className="sr-only"> on X (opens in a new tab)</span>
    </a>
  );
}
