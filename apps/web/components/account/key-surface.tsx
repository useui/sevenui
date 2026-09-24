"use client";

import { LockIcon } from "lucide-react";
import { Fragment, type ReactNode } from "react";
import { Logomark } from "../logomark";
import { CopyButton } from "../pro/copy-button";
import { cx } from "../../lib/cx";
import type { LicenseRow } from "./types";

export const SURFACE =
  "overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-[0_1px_2px_color-mix(in_oklch,var(--foreground)_5%,transparent),0_20px_40px_-24px_color-mix(in_oklch,var(--foreground)_24%,transparent)] dark:shadow-none";

/** A key split on "-": separators sit quieter, and a line only breaks between segments. */
export function KeyText({ value, className }: { value: string; className?: string }) {
  const parts = value.split("-");
  return (
    <span className={cx("font-mono tracking-[0.02em] tabular-nums", className)}>
      {parts.map((part, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: segments are positional
        <Fragment key={i}>
          {i > 0 ? <span className="px-[0.08em] text-muted-foreground">-</span> : null}
          {i > 0 ? <wbr /> : null}
          <span className={cx("whitespace-nowrap", part.includes("•") && "text-muted-foreground")}>{part}</span>
        </Fragment>
      ))}
    </span>
  );
}

function Frame({
  children,
  terms,
  badge,
  className,
  label,
}: {
  children: ReactNode;
  terms: ReactNode;
  badge?: ReactNode;
  className?: string;
  label?: string;
}) {
  return (
    <article aria-label={label} className={cx(SURFACE, className)}>
      <header className="flex items-center justify-between gap-4 border-b border-border px-5 py-3">
        <span className="flex items-center gap-2 text-sm font-medium">
          <Logomark className="size-4" />
          SevenUI Pro
        </span>
        <span className="text-xs text-muted-foreground">{badge ?? "Lifetime · per developer"}</span>
      </header>
      {children}
      <dl className="grid grid-cols-2 gap-px border-t border-border bg-border text-sm sm:grid-cols-4">{terms}</dl>
    </article>
  );
}

function Term({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5 bg-card px-5 py-3">
      <dt className="text-xs text-muted-foreground">{term}</dt>
      <dd className="truncate font-medium">{children}</dd>
    </div>
  );
}

/** The license key as an object: masked key, one copy control, the terms it carries. */
export function KeySurface({
  license,
  licensedTo,
  index,
  total,
  footer,
}: {
  license: LicenseRow;
  licensedTo: string;
  index: number;
  total: number;
  footer?: ReactNode;
}) {
  const several = total > 1;
  return (
    <Frame
      badge={several ? <span className="tabular-nums">Key {index + 1} of {total}</span> : undefined}
      label={several ? `SevenUI Pro license ${index + 1} of ${total}` : "SevenUI Pro license"}
      terms={
        <>
          <Term term="Licensed to">{licensedTo}</Term>
          <Term term="Term">Lifetime</Term>
          <Term term="Seats">1 developer</Term>
          <Term term="Projects">Unlimited</Term>
        </>
      }
    >
      <div className="px-5 pt-5 pb-6">
        <p className="text-xs text-muted-foreground">License key</p>
        <div className="mt-2 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          <KeyText className="min-w-0 flex-1 py-1 text-[1.0625rem] text-foreground sm:text-[1.3125rem]" value={license.displayKey} />
          <CopyButton className="h-9 shrink-0 px-3" label="license key" showText value={license.key} variant="outline" />
        </div>
        {footer}
      </div>
    </Frame>
  );
}

/** The same object before a key exists for this visitor: same shape, nothing to copy. */
export function LockedKey({ caption }: { caption: string }) {
  const blank = <span className="inline-block h-3 w-16 rounded-sm bg-foreground/10" />;
  return (
    <figure aria-label={caption} className="m-0" role="img">
      <Frame
        className="select-none"
        terms={
          <>
            <Term term="Licensed to">{blank}</Term>
            <Term term="Term">Lifetime</Term>
            <Term term="Seats">1 developer</Term>
            <Term term="Projects">Unlimited</Term>
          </>
        }
      >
        <div className="px-5 pt-5 pb-6">
          <p className="text-xs text-muted-foreground">License key</p>
          <div className="mt-2 flex items-center gap-3">
            <KeyText className="min-w-0 flex-1 py-1 text-[1.0625rem] text-muted-foreground sm:text-[1.3125rem]" value="SEVENUI-••••-••••-••••" />
            <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-dashed border-foreground/25 text-muted-foreground">
              <LockIcon aria-hidden className="size-4" />
            </span>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">{caption}</p>
        </div>
      </Frame>
    </figure>
  );
}

export function KeySkeleton() {
  return (
    <div aria-hidden className={cx(SURFACE, "animate-pulse motion-reduce:animate-none")}>
      <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
        <div className="h-3.5 w-24 rounded-sm bg-muted" />
        <div className="h-3 w-28 rounded-sm bg-muted" />
      </div>
      <div className="px-5 pt-5 pb-6">
        <div className="h-3 w-16 rounded-sm bg-muted" />
        <div className="mt-3 flex items-center gap-3">
          <div className="h-7 flex-1 rounded-md bg-muted" />
          <div className="h-9 w-20 rounded-lg bg-muted" />
        </div>
      </div>
      <div className="h-[3.75rem] border-t border-border" />
    </div>
  );
}
