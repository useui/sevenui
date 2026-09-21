import type { ReactNode } from "react";
import { LandingRuler } from "./landing-ruler";

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <div className="relative">
      <LandingRuler />

      <section className="border-b border-border">
        <div className="l-row l-marks flex items-center justify-between gap-4 border-b border-border px-6 py-3 font-mono text-xs text-muted-foreground">
          <span>{title}</span>
          <span className="text-end">Last updated {updated}</span>
        </div>
        <div className="l-row">
          <article className="legal max-w-[68ch] px-6 py-14 sm:px-10">
            <h1>{title}</h1>
            {children}
          </article>
        </div>
      </section>
    </div>
  );
}
