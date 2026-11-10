import { CalendarDays, Mail } from "lucide-react";
import type { ReactNode } from "react";
import { DocsBreadcrumb } from "./docs/breadcrumb";

const chipClass =
  "inline-flex h-[26px] shrink-0 items-center gap-[7px] whitespace-nowrap rounded-full bg-muted px-[11px] font-medium text-muted-foreground text-xs";

/**
 * How the prose pages (roadmap, support, legal, block request) open: the docs breadcrumb on the left and
 * one fact about the page in a soft chip on the right, aligned to the same 68ch column as the text below.
 */
export function PageOpening({ meta, title }: { meta?: ReactNode; title: string }) {
  return (
    <div className="l-row">
      <div className="mx-auto flex max-w-[68ch] flex-wrap items-center justify-between gap-x-4 gap-y-2 px-6 pt-10 sm:px-10">
        <DocsBreadcrumb crumbs={[{ label: "Home", href: "/" }, { label: title }]} />
        {meta}
      </div>
    </div>
  );
}

/** The release a page describes, with a small live dot. */
export function VersionChip({ version }: { version: string }) {
  return (
    <span className={chipClass}>
      <span aria-hidden="true" className="relative size-[7px] rounded-full bg-success">
        <span className="absolute -inset-[3px] rounded-full bg-success/25" />
      </span>
      Current <b className="font-semibold text-foreground tabular-nums">v{version}</b>
    </span>
  );
}

/** When a page's text last changed. `updated` is a date like "September 25, 2026". */
export function UpdatedChip({ updated }: { updated: string }) {
  const date = new Date(`${updated} 12:00 UTC`);
  const valid = !Number.isNaN(date.getTime());
  const short = valid
    ? date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })
    : updated;
  return (
    <span className={chipClass}>
      <CalendarDays aria-hidden="true" className="size-[13px]" />
      Updated{" "}
      <time className="font-semibold text-foreground" dateTime={valid ? date.toISOString().slice(0, 10) : undefined}>
        {short}
      </time>
    </span>
  );
}

/** An address to write to, as a link. */
export function EmailChip({ email }: { email: string }) {
  return (
    <a className={`${chipClass} transition-colors hover:text-foreground`} href={`mailto:${email}`}>
      <Mail aria-hidden="true" className="size-[13px]" />
      <span className="font-semibold text-foreground">{email}</span>
    </a>
  );
}
