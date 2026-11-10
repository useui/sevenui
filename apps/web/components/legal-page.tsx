import type { ReactNode } from "react";
import { PageOpening, UpdatedChip } from "./page-opening";

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <section>
      <PageOpening meta={<UpdatedChip updated={updated} />} title={title} />
      <div className="l-row">
        <article className="legal mx-auto max-w-[68ch] px-6 pt-6 pb-14 sm:px-10">
          <h1>{title}</h1>
          {children}
        </article>
      </div>
    </section>
  );
}
