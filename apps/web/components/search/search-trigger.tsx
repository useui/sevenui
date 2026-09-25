"use client";

import { SearchIcon } from "lucide-react";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";

const SearchCommandDialog = dynamic(() => import("./command-dialog"), {
  ssr: false,
});

const STRING_SEARCH = "Search";

const DEFAULT_SHORTCUT = "⌘K";
const CONTROL_SHORTCUT = "Ctrl K";

export function SearchTrigger() {
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
        className="inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        onClick={openPalette}
        type="button"
      >
        <SearchIcon aria-hidden="true" className="shrink-0" size={16} />
        {/* <span className="grow shrink-0 basis-0 text-start max-xl:hidden">{STRING_SEARCH}</span>
        <kbd className="shrink-0 font-mono text-[0.7rem] max-xl:hidden">{shortcut}</kbd> */}
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
