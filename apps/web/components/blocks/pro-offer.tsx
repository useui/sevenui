import Link from "next/link";
import { PRO_LAUNCH, PRO_REGULAR } from "../../lib/pro-pricing";

export function ProOffer() {
  return (
    <div className="border-b border-border bg-muted/30 px-6 py-5 lg:px-10">
      <div className="flex flex-wrap items-center justify-between gap-x-10 gap-y-4">
        <p className="max-w-xl text-pretty text-sm text-muted-foreground">
          Every block here is <span className="font-medium text-foreground">Pro</span>.
          One purchase, yours forever —
          <span className="font-medium text-foreground">{PRO_LAUNCH} at launch</span> instead of{" "}
          {PRO_REGULAR}.
        </p>
        <Link
          className="inline-flex h-10 shrink-0 items-center rounded-lg bg-primary px-6 font-medium text-primary-foreground text-sm transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          href="/pro"
        >
          Get Pro — {PRO_LAUNCH}
        </Link>
      </div>
    </div>
  );
}
