"use client";

import { SearchIcon } from "lucide-react";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";

const SearchCommandDialog = dynamic(() => import("./command-dialog"), {
  ssr: false,
});

const STRING_SEARCH = "Quick search";

const DEFAULT_SHORTCUT = "⌘K";
const CONTROL_SHORTCUT = "Ctrl K";

type Variant = "pill";

const VARIANT_CLASSES: Record<Variant, string> = {
  // The header: an icon on phones, a "Quick search ⌘K" pill from md up. Four header entries leave it room at lg.
  pill: "size-9 justify-center rounded-[10px] md:h-9 md:w-52 md:justify-start md:gap-2 md:rounded-full md:bg-muted md:ps-3 md:pe-1.5",
};

export function SearchTrigger({ variant = "pill" }: { variant?: Variant }) {
  const [open, setOpen] = useState(false);
  const [everOpened, setEverOpened] = useState(false);
  const [shortcut, setShortcut] = useState(DEFAULT_SHORTCUT);

  const openPalette = useCallback(() => {
    setEverOpened(true);
    setOpen(true);
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (
        (event.key === "k" || event.key === "K") &&
        (event.metaKey || event.ctrlKey) &&
        !event.shiftKey &&
        !event.altKey
      ) {
        event.preventDefault();
        setEverOpened(true);
        setOpen((previous) => !previous);
      } else if (event.key === "/" && !isField(event.target)) {
        event.preventDefault();
        openPalette();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [openPalette]);

  useEffect(() => {
    if (!isApplePlatform()) setShortcut(CONTROL_SHORTCUT);
  }, []);

  return (
    <>
      <button
        aria-label={STRING_SEARCH}
        className={`inline-flex shrink-0 cursor-pointer items-center text-muted-foreground transition-colors hover:bg-muted hover:text-foreground ${VARIANT_CLASSES[variant]}`}
        onClick={openPalette}
        type="button"
      >
        <SearchIcon aria-hidden="true" className="shrink-0" size={16} />
        <span
          className={`grow text-start font-normal text-sm ${variant === "pill" ? "max-md:hidden" : ""}`}
        >
          {STRING_SEARCH}
        </span>
        <kbd
          className={`shrink-0 rounded-md bg-foreground/10 px-1.5 py-px font-medium font-sans text-muted-foreground text-xs ${
            variant === "pill" ? "max-md:hidden" : ""
          }`}
        >
          {shortcut}
        </kbd>
      </button>
      {everOpened && <SearchCommandDialog onOpenChange={setOpen} open={open} />}
    </>
  );
}

function isField(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.isContentEditable
  );
}

function isApplePlatform(): boolean {
  return /mac|iphone|ipad|ipod/iu.test(navigator.platform);
}
