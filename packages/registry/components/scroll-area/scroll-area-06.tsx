"use client";

import * as React from "react";
import { ArrowUp } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import { Progress } from "@/registry/base/ui/progress";
import { ScrollArea } from "@/registry/base/ui/scroll-area";

const releases = [
  {
    version: "4.2.0",
    date: "Sep 18, 2026",
    notes: [
      "Saved views now sync across devices and can be pinned to the sidebar.",
      "CSV exports include custom fields and respect the active filters.",
      "Faster dashboard loads: median time to first chart dropped from 1.8 s to 0.9 s.",
    ],
  },
  {
    version: "4.1.3",
    date: "Sep 4, 2026",
    notes: [
      "Fixed a timezone bug that shifted weekly reports by one day for UTC+13 workspaces.",
      "Webhook retries now back off exponentially up to six attempts.",
    ],
  },
  {
    version: "4.1.0",
    date: "Aug 21, 2026",
    notes: [
      "SAML single sign-on is available on the Scale plan.",
      "Audit log entries can be streamed to your own S3 bucket.",
      "Keyboard shortcut sheet opens with the question mark key.",
    ],
  },
  {
    version: "4.0.2",
    date: "Aug 7, 2026",
    notes: [
      "Chart tooltips no longer clip at the right edge of narrow cards.",
      "Improved screen reader labels on the date range picker.",
    ],
  },
  {
    version: "4.0.0",
    date: "Jul 24, 2026",
    notes: [
      "New workspace navigation with collapsible sections.",
      "Dark mode follows your system setting by default.",
      "The legacy v2 reporting API is retired; migrate to v3 endpoints.",
    ],
  },
];

export default function ScrollArea06() {
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const viewport = contentRef.current?.closest<HTMLElement>(
      '[data-slot="scroll-area-viewport"]',
    );
    if (!viewport) return;

    function update() {
      if (!viewport) return;
      const max = viewport.scrollHeight - viewport.clientHeight;
      setProgress(max > 0 ? Math.round((viewport.scrollTop / max) * 100) : 0);
    }

    update();
    viewport.addEventListener("scroll", update, { passive: true });
    return () => viewport.removeEventListener("scroll", update);
  }, []);

  function scrollToTop() {
    const viewport = contentRef.current?.closest<HTMLElement>(
      '[data-slot="scroll-area-viewport"]',
    );
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    viewport?.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    viewport?.focus({ preventScroll: true });
  }

  return (
    <div className="flex w-full max-w-md flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm">
      <div className="flex flex-col gap-3 px-4 pt-4 pb-3">
        <div className="flex items-baseline justify-between gap-2">
          <h3 id="scroll-area-06-title" className="text-sm font-medium">
            Changelog
          </h3>
          <span className="text-xs text-muted-foreground tabular-nums">
            {progress}% read
          </span>
        </div>
        <Progress value={progress} aria-label="Reading progress" />
      </div>
      <div className="group/reader relative border-t">
        <ScrollArea
          role="region"
          aria-labelledby="scroll-area-06-title"
          className="h-80 [&_[data-slot=scroll-area-thumb]]:bg-muted-foreground/40 [&_[data-slot=scroll-area-thumb]]:transition-colors hover:[&_[data-slot=scroll-area-thumb]]:bg-muted-foreground/60"
        >
          <div ref={contentRef} className="flex flex-col gap-6 px-4 py-5">
            {releases.map((release) => (
              <article key={release.version} className="flex flex-col gap-2">
                <header className="flex items-baseline justify-between gap-2">
                  <h4 className="font-mono text-sm font-medium">
                    v{release.version}
                  </h4>
                  <time className="text-xs text-muted-foreground">
                    {release.date}
                  </time>
                </header>
                <ul className="flex list-disc flex-col gap-1.5 pl-4 text-sm leading-relaxed text-muted-foreground marker:text-border">
                  {release.notes.map((note) => (
                    <li key={note} className="text-pretty">
                      {note}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </ScrollArea>
        {/* Edge fades driven by the root's data-overflow-y-* attributes. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-linear-to-b from-card to-transparent opacity-0 transition-opacity duration-200 group-has-[[data-overflow-y-start]]/reader:opacity-100"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-linear-to-t from-card to-transparent opacity-0 transition-opacity duration-200 group-has-[[data-overflow-y-end]]/reader:opacity-100"
        />
        <Button
          variant="secondary"
          size="icon-sm"
          aria-label="Back to top"
          onClick={scrollToTop}
          tabIndex={progress > 10 ? 0 : -1}
          aria-hidden={progress > 10 ? undefined : true}
          className="pointer-events-none absolute right-4 bottom-4 translate-y-2 rounded-full opacity-0 shadow-md transition-[opacity,translate] duration-200 ease-out data-[visible=true]:pointer-events-auto data-[visible=true]:translate-y-0 data-[visible=true]:opacity-100 motion-reduce:transition-none"
          data-visible={progress > 10}
        >
          <ArrowUp aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
