import type { Metadata } from "next";
import { Fragment, type ReactNode } from "react";
import { badgeVariants } from "@/registry/base/ui/badge";
import { LayerCard } from "@/registry/base/ui/layer-card";
import { JsonLd } from "../../components/json-ld";
import { pageMetadata } from "../../lib/metadata";
import { PageOpening, VersionChip } from "../../components/page-opening";
import { requirePageMeta } from "../../lib/page-meta";
import { RELEASES, type RoadmapStatus, UPCOMING } from "../../lib/roadmap";

const ROUTE = "/roadmap";

const DATE_FORMAT = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "long",
  timeZone: "UTC",
  year: "numeric",
});

const formatDate = (iso: string): string => DATE_FORMAT.format(new Date(`${iso}T00:00:00Z`));

const anchorFor = (version: string): string => `v${version.replaceAll(".", "-")}`;

const STATUS_VARIANT = {
  "In progress": "default",
  Planned: "secondary",
  Exploring: "outline",
} as const satisfies Record<RoadmapStatus, "default" | "secondary" | "outline">;

/** Renders `backticked` spans of a roadmap item as inline code. */
function Inline({ text }: { text: string }) {
  return text.split("`").map((part, index) =>
    // Odd segments sit between a pair of backticks.
    // biome-ignore lint/suspicious/noArrayIndexKey: the segments of one fixed string never reorder
    index % 2 === 1 ? <code key={index}>{part}</code> : <Fragment key={index}>{part}</Fragment>,
  );
}

/** The small mono label that opens each part of the page. */
function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="font-mono text-xs tracking-wide text-muted-foreground uppercase">{children}</p>;
}

export async function generateMetadata(): Promise<Metadata> {
  const meta = await requirePageMeta(ROUTE, "app/roadmap/page.tsx");
  return pageMetadata(ROUTE, meta.title, meta.description);
}

export default async function RoadmapPage() {
  const meta = await requirePageMeta(ROUTE, "app/roadmap/page.tsx");
  const current = RELEASES[0];

  return (
    <main id="content">
      <section>
        <PageOpening meta={current ? <VersionChip version={current.version} /> : null} title={meta.title} />
        <div className="l-row">
          <div className="legal mx-auto max-w-[68ch] px-6 pt-6 pb-14 sm:px-10">
            <h1>{meta.title}</h1>
            <p>{meta.description}</p>

            {UPCOMING.items.length > 0 ? (
              <section aria-labelledby="next-title" className="mt-20 scroll-mt-20" id="next">
                <Eyebrow>Upcoming</Eyebrow>
                {/* `.legal` sets heading margins unlayered, so utilities cannot override them. */}
                <h2 id="next-title" style={{ marginTop: "0.75rem" }}>
                  {UPCOMING.label}
                </h2>
                <p>{UPCOMING.summary}</p>
                <ol className="mt-6 flex flex-col gap-2">
                  {UPCOMING.items.map((item) => (
                    // `.legal li` adds a margin and a dot marker unlayered; the card rows drop both.
                    // A LayerCard with no panel renders as one raised surface.
                    <LayerCard
                      className="block [--layer-card-radius:1rem] before:hidden"
                      key={item.title}
                      render={<li style={{ marginTop: 0 }} />}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                        <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                        <span className={badgeVariants({ variant: STATUS_VARIANT[item.status] })}>{item.status}</span>
                      </div>
                      <p style={{ marginTop: "0.375rem" }}>
                        <Inline text={item.description} />
                      </p>
                    </LayerCard>
                  ))}
                </ol>
              </section>
            ) : null}

            {RELEASES.map((release, index) => (
              <article
                aria-labelledby={`${anchorFor(release.version)}-title`}
                className="mt-20 scroll-mt-20"
                id={anchorFor(release.version)}
                key={release.version}
              >
                <Eyebrow>{index === 0 ? "Current release" : "Earlier release"}</Eyebrow>
                <p className="flex flex-wrap items-center gap-x-3 font-mono text-xs">
                  {/* `.legal` sets link underlines unlayered, so utilities cannot override them. */}
                  <a href={`#${anchorFor(release.version)}`} style={{ textDecoration: "none" }}>
                    v{release.version}
                  </a>
                  <span className="text-muted-foreground">
                    Released <time dateTime={release.date}>{formatDate(release.date)}</time>
                  </span>
                </p>
                <h2 id={`${anchorFor(release.version)}-title`} style={{ marginTop: "0.75rem" }}>
                  {release.title}
                </h2>
                <p>{release.summary}</p>
                {release.sections.map((section) => (
                  <Fragment key={section.heading}>
                    <h3 className="mt-8 text-sm font-semibold text-foreground">{section.heading}</h3>
                    <ul>
                      {section.items.map((item) => (
                        <li key={item}>
                          <Inline text={item} />
                        </li>
                      ))}
                    </ul>
                  </Fragment>
                ))}
              </article>
            ))}
          </div>
        </div>
      </section>
      <JsonLd route={ROUTE} />
    </main>
  );
}
