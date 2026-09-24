"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useDrawer } from "./drawer-context";
import { getClerkIfLikelySignedIn } from "../lib/clerk";
import { Logomark } from "./logomark";
import { SearchTrigger } from "./search/search-trigger";
import { currentTabForRoute, getSiteTabs } from "../lib/site-tabs";
import { site } from "../lib/site";
import { ThemeToggle } from "./theme-toggle";

const iconButton =
  "inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground";

export function SiteHeader({ primitivesHref }: { primitivesHref: string }) {
  const pathname = usePathname();
  const tabs = getSiteTabs(primitivesHref);
  const activeTabHref = currentTabForRoute(pathname, tabs);
  const { setOpen } = useDrawer();
  const repoUrl = `https://github.com/${site.github.owner}/${site.github.repo}`;
  const [signedInName, setSignedInName] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function syncAuthControl() {
      try {
        const clerk = await getClerkIfLikelySignedIn();
        if (!clerk || cancelled) return;
        const name = clerk.user?.firstName || (clerk.user ? "Account" : null);
        if (!name || cancelled) return; // signed out after all — leave "Sign in"
        setSignedInName(name);
      } catch (e) {
        console.error("header:", e);
      }
    }
    syncAuthControl();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-2 border-b sm:gap-3 bg-background/90 px-4 backdrop-blur md:px-6">
      <button
        aria-label="Toggle navigation"
        className={`${iconButton} lg:hidden`}
        onClick={() => setOpen(true)}
        type="button"
      >
        <Menu aria-hidden="true" size={20} />
      </button>
      <Link
        className="inline-flex shrink-0 items-center gap-2 font-semibold text-base text-foreground"
        href="/"
      >
        <Logomark className="h-5 w-auto shrink-0" />
        {/* Below 360px only the mark fits next to the header controls; the name stays for screen readers. */}
        <span className="max-[359px]:sr-only">{site.name}</span>
      </Link>
      <nav aria-label="Sections" className="hidden gap-1 lg:flex">
        {tabs.map((tab) => (
          <Link
            aria-current={tab.href === activeTabHref ? "page" : undefined}
            className="shrink-0 whitespace-nowrap rounded-full px-2 py-1.5 xl:px-3 font-medium text-muted-foreground text-sm transition-colors hover:bg-muted hover:text-foreground aria-[current=page]:text-foreground"
            href={tab.href}
            key={tab.href}
          >
            {tab.label}
          </Link>
        ))}
      </nav>
      <div className="flex-1" />
      <SearchTrigger />
      <div className="flex shrink-0 items-center gap-2">
        <a
          aria-label="GitHub repository"
          className={`${iconButton} max-sm:hidden`}
          href={repoUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          <GithubMark />
        </a>
        <ThemeToggle />
        <Link
          aria-label={signedInName ?? undefined}
          className="group inline-flex max-w-32 shrink-0 items-center justify-center whitespace-nowrap rounded-full px-3 py-1.5 font-medium text-muted-foreground text-sm uppercase transition-colors hover:bg-muted hover:text-foreground data-[signed-in]:max-sm:size-9 data-[signed-in]:max-sm:bg-muted data-[signed-in]:max-sm:px-0 data-[signed-in]:max-sm:text-foreground"
          data-signed-in={signedInName ? "" : undefined}
          href="/account"
          id="auth-control"
        >
          <span className="hidden group-data-[signed-in]:max-sm:inline" data-auth-initial>
            {signedInName?.slice(0, 1) ?? ""}
          </span>
          <span
            className="min-w-0 truncate normal-case group-data-[signed-in]:max-sm:hidden"
            data-auth-label
          >
            {signedInName ?? "Sign in"}
          </span>
        </Link>
      </div>
    </header>
  );
}

function GithubMark() {
  return (
    <svg aria-hidden="true" fill="currentColor" height="18" viewBox="0 0 16 16" width="18" xmlns="http://www.w3.org/2000/svg">
      <path
        clipRule="evenodd"
        d="M8 0C3.58 0 0 3.58 0 8C0 11.54 2.29 14.53 5.47 15.59C5.87 15.66 6.02 15.42 6.02 15.21C6.02 15.02 6.01 14.39 6.01 13.72C4 14.09 3.48 13.23 3.32 12.78C3.23 12.55 2.84 11.84 2.5 11.65C2.22 11.5 1.82 11.13 2.49 11.12C3.12 11.11 3.57 11.7 3.72 11.94C4.44 13.15 5.59 12.81 6.05 12.6C6.12 12.08 6.33 11.73 6.56 11.53C4.78 11.33 2.92 10.64 2.92 7.58C2.92 6.71 3.23 5.99 3.74 5.43C3.66 5.23 3.38 4.41 3.82 3.31C3.82 3.31 4.49 3.1 6.02 4.13C6.66 3.95 7.34 3.86 8.02 3.86C8.7 3.86 9.38 3.95 10.02 4.13C11.55 3.09 12.22 3.31 12.22 3.31C12.66 4.41 12.38 5.23 12.3 5.43C12.81 5.99 13.12 6.7 13.12 7.58C13.12 10.65 11.25 11.33 9.47 11.53C9.76 11.78 10.01 12.26 10.01 13.01C10.01 14.08 10 14.94 10 15.21C10 15.42 10.15 15.67 10.55 15.59C13.71 14.53 16 11.53 16 8C16 3.58 12.42 0 8 0Z"
        fillRule="evenodd"
      />
    </svg>
  );
}
