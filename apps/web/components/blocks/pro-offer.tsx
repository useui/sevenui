import Link from "next/link";
import { LayerCard } from "@/registry/base/ui/layer-card";
import { PRO_LAUNCH, PRO_REGULAR } from "../../lib/pro-pricing";

export function ProOffer() {
  return (
    // No panel inside, so the LayerCard renders as a single raised surface.
    <LayerCard className="mt-8 [--layer-card-radius:1rem]">
      <div className="flex flex-wrap items-center justify-between gap-x-10 gap-y-4">
        <p className="max-w-xl text-pretty text-sm text-muted-foreground">
          Every block here is <span className="font-medium text-foreground">Pro</span>.
          One purchase, yours forever —
          <span className="font-medium text-foreground">{PRO_LAUNCH} at launch</span> instead of{" "}
          {PRO_REGULAR}.{" "}
          <Link className="underline underline-offset-4 hover:text-foreground" href="/docs/installation#pro-blocks">
            How to install
          </Link>
        </p>
        <Link
          className="inline-flex h-10 shrink-0 items-center rounded-lg bg-primary px-6 font-medium text-primary-foreground text-sm transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          href="/pro"
        >
          Get Pro — {PRO_LAUNCH}
        </Link>
      </div>
    </LayerCard>
  );
}
