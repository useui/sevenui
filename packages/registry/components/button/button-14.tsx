"use client";

import { ArrowUp, ChevronDown } from "lucide-react";
import * as React from "react";

import { Button } from "@/registry/base/ui/button";
import { Spinner } from "@/registry/base/ui/spinner";

const releases = [
  { version: "4.2.1", date: "Sep 22", summary: "Fixes duplicate webhooks on retried payments." },
  { version: "4.2.0", date: "Sep 15", summary: "Adds saved filters to the invoices table." },
  { version: "4.1.3", date: "Sep 4", summary: "Speeds up CSV exports for large workspaces." },
  { version: "4.1.2", date: "Aug 28", summary: "Restores keyboard focus after closing dialogs." },
  { version: "4.1.1", date: "Aug 21", summary: "Corrects tax rounding for Swiss francs." },
  { version: "4.1.0", date: "Aug 12", summary: "Introduces usage-based pricing plans." },
  { version: "4.0.2", date: "Jul 30", summary: "Fixes timezone drift in scheduled reports." },
  { version: "4.0.1", date: "Jul 24", summary: "Hardens SSO session renewal." },
  { version: "4.0.0", date: "Jul 16", summary: "New billing engine and redesigned dashboard." },
  { version: "3.9.4", date: "Jun 27", summary: "Final maintenance release of the 3.x line." },
];

const pageSize = 3;

export default function Button14() {
  const [visible, setVisible] = React.useState(pageSize);
  const [loading, setLoading] = React.useState(false);
  const itemRefs = React.useRef<(HTMLAnchorElement | null)[]>([]);
  const focusIndex = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (!loading) return;
    const timeout = setTimeout(() => {
      setVisible((count) => Math.min(count + pageSize, releases.length));
      setLoading(false);
    }, 700);
    return () => clearTimeout(timeout);
  }, [loading]);

  const remaining = releases.length - visible;
  const nextBatch = Math.min(pageSize, remaining);

  return (
    <section
      aria-labelledby="button-14-title"
      className="w-full max-w-md rounded-xl border bg-card text-card-foreground"
    >
      <h3 id="button-14-title" className="border-b px-4 py-3 font-medium">
        Release notes
      </h3>
      <ul className="divide-y">
        {releases.slice(0, visible).map((release, index) => (
          <li key={release.version}>
            <a
              ref={(node) => {
                itemRefs.current[index] = node;
                // Move focus to the first newly loaded entry so keyboard users keep their place.
                if (node && focusIndex.current === index) {
                  focusIndex.current = null;
                  node.focus();
                }
              }}
              href={`#v${release.version}`}
              className="flex flex-col gap-0.5 px-4 py-3 outline-none hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset"
            >
              <span className="flex items-baseline justify-between gap-3 text-sm">
                <span className="font-medium tabular-nums">v{release.version}</span>
                <span className="text-xs text-muted-foreground">{release.date}</span>
              </span>
              <span className="text-sm text-muted-foreground">{release.summary}</span>
            </a>
          </li>
        ))}
      </ul>
      <div className="border-t p-3">
        {remaining > 0 ? (
          <Button
            variant="ghost"
            className="w-full"
            disabled={loading}
            focusableWhenDisabled
            onClick={() => {
              focusIndex.current = visible;
              setLoading(true);
            }}
          >
            {loading ? (
              <Spinner data-icon="inline-start" aria-hidden="true" role="presentation" />
            ) : (
              <ChevronDown data-icon="inline-start" aria-hidden="true" />
            )}
            {loading ? "Loading releases…" : `Show ${nextBatch} older releases`}
            {!loading && (
              <span className="text-muted-foreground tabular-nums">
                ({remaining} left)
              </span>
            )}
          </Button>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-2 px-1">
            <p className="text-xs text-muted-foreground">
              That is every release since 3.9.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => itemRefs.current[0]?.focus()}
            >
              <ArrowUp data-icon="inline-start" aria-hidden="true" />
              Back to latest
            </Button>
          </div>
        )}
      </div>
      <p aria-live="polite" className="sr-only">
        {`Showing ${visible} of ${releases.length} releases.`}
      </p>
    </section>
  );
}
