"use client";

import { Check, Link2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/registry/base/ui/tooltip";
import { useAnnounce } from "../announcer";
import { InstallControl } from "../blocks/install-control";
import { ThemeCustomizer } from "../customizer/theme-customizer";
import { TOOLBAR_ICON } from "../toolbar-classes";

const COPIED_MS = 1600;

/** The gallery's slice of the block toolbar: theme, permalink, install. */
export function ExampleActions({ id, title }: { id: string; title: string }) {
  const announce = useAnnounce();
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(`${location.origin}${location.pathname}#${id}`);
      announce(`Copied a link to ${title}.`);
    } catch {
      // Clipboard unavailable (permissions/insecure context); nothing to undo.
      announce("Copy failed — the clipboard is unavailable.");
      return;
    }
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), COPIED_MS);
  }

  return (
    <>
      <Tooltip>
        <TooltipTrigger
          closeOnClick={false}
          render={
            <button className={`${TOOLBAR_ICON} hidden @md/toolbar:inline-flex`} onClick={() => void copyLink()} type="button">
              <span className="sr-only">{`Copy a link to ${title}`}</span>
              <Link2 aria-hidden="true" className={copied ? "hidden size-4" : "size-4"} strokeWidth={1.5} />
              <Check aria-hidden="true" className={copied ? "size-4" : "hidden size-4"} strokeWidth={1.5} />
            </button>
          }
        />
        <TooltipContent>{copied ? "Copied" : "Copy link to this example"}</TooltipContent>
      </Tooltip>
      <InstallControl item={`component/${id}`} title={title} />
      <ThemeCustomizer />
    </>
  );
}
