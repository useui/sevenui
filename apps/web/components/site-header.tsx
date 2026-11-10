"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { useDrawer } from "./drawer-context";
import { Logomark } from "./logomark";
import { SearchTrigger } from "./search/search-trigger";
import type { HeaderNav } from "../lib/site-nav";
import { site } from "../lib/site";
import { ghostButton, SiteActions } from "./site-actions";
import { SiteNavMenu } from "./site-nav-menu";

export function SiteHeader({ nav }: { nav: HeaderNav }) {
  const { setOpen } = useDrawer();

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-2 bg-background/85 px-4 backdrop-blur-md sm:gap-3 md:px-6">
      <button
        aria-label="Toggle navigation"
        className={`${ghostButton} lg:hidden`}
        onClick={() => setOpen(true)}
        type="button"
      >
        <Menu aria-hidden="true" size={20} />
      </button>
      <Link
        className="inline-flex shrink-0 items-center gap-2 font-semibold text-foreground text-lg tracking-[-0.01em]"
        href="/"
      >
        <Logomark className="h-5 w-auto shrink-0" />
        {/* Below 360px only the mark fits next to the header controls; the name stays for screen readers. */}
        <span className="max-[359px]:sr-only">{site.name}</span>
      </Link>
      <SiteNavMenu nav={nav} />
      <div className="flex-1" />
      <SearchTrigger variant="pill" />
      <SiteActions />
    </header>
  );
}
