"use client";

import { Badge } from "@/registry/base/ui/badge";
import { Logomark } from "../logomark";
import { CopyButton } from "../pro/copy-button";
import { EXAMPLE_BLOCK, REGISTRY_SNIPPET } from "../pro/setup-steps";
import { cx } from "../../lib/cx";
import { KeyText, SURFACE } from "./key-surface";
import type { LicenseRow } from "./types";

/** What a teammate needs to start installing with one key. */
function teammateSetup(license: LicenseRow) {
  return [
    "SevenUI Pro — your license key",
    "",
    "1. Add it to .env (never commit it):",
    `SEVENUI_PRO_KEY=${license.key}`,
    "",
    "2. Add the key header to @sevenui in components.json:",
    REGISTRY_SNIPPET,
    "",
    "3. Install any Block:",
    `npx shadcn@latest add @sevenui/pro/${EXAMPLE_BLOCK}`,
  ].join("\n");
}

export function keyName(index: number) {
  return `Key ${index + 1}`;
}

/** Every key on the account as one ledger: one row per developer seat. */
export function KeyLedger({
  rows,
  activeKey,
}: {
  rows: LicenseRow[];
  activeKey: string;
}) {
  return (
    <section aria-labelledby="ledger-title" className={SURFACE}>
      <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-border px-5 py-3">
        <h2 className="flex items-center gap-2 text-sm font-medium" id="ledger-title">
          <Logomark className="size-4" />
          SevenUI Pro keys
          <span className="text-muted-foreground tabular-nums">{rows.length}</span>
        </h2>
        <p className="text-xs text-muted-foreground">One key per developer</p>
      </header>
      <div
        aria-hidden
        className="hidden grid-cols-[2rem_minmax(0,1fr)_auto] gap-x-5 border-b border-border bg-muted/40 px-5 py-2 text-xs text-muted-foreground lg:grid"
      >
        <span>#</span>
        <span>License key</span>
        <span className="sr-only">Actions</span>
      </div>
      <ol className="divide-y divide-border">
        {rows.map((license, index) => {
          const active = license.key === activeKey;
          return (
            <li
              className={cx(
                "grid grid-cols-[2rem_minmax(0,1fr)] items-center gap-x-4 gap-y-3 px-5 py-4 transition-colors lg:grid-cols-[2rem_minmax(0,1fr)_auto] lg:gap-x-5",
                active && "bg-muted/30",
              )}
              key={license.key}
            >
              <span className="self-center text-sm text-muted-foreground tabular-nums">{index + 1}</span>
              <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 lg:col-start-auto">
                <KeyText className="text-[0.9375rem] text-foreground" value={license.displayKey} />
                {active ? (
                  <Badge className="shrink-0" variant="secondary">
                    In the setup below
                  </Badge>
                ) : null}
              </div>
              <div className="col-start-2 grid grid-cols-2 gap-2 lg:col-start-auto lg:flex lg:items-center">
                <CopyButton
                  className="h-8 w-full justify-center px-2.5 lg:w-auto"
                  label={`key ${index + 1}`}
                  showText
                  text="Copy key"
                  value={license.key}
                  variant="outline"
                />
                <CopyButton
                  className="h-8 w-full justify-center px-2.5 lg:w-auto"
                  label={`setup for key ${index + 1}`}
                  showText
                  text="Copy setup"
                  value={teammateSetup(license)}
                  variant="outline"
                />
              </div>
            </li>
          );
        })}
      </ol>
      <p className="border-t border-border px-5 py-3 text-xs leading-relaxed text-muted-foreground">
        &ldquo;Copy setup&rdquo; copies the full key with the three setup steps, ready to send to the developer
        who uses it.
      </p>
    </section>
  );
}
