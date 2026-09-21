import type { Metadata } from "next";
import Link from "next/link";
import { ComponentWall } from "../components/component-wall";
import CopyCommand from "../components/copy-command";
import { JsonLd } from "../components/json-ld";
import { LandingRuler } from "../components/landing-ruler";
import LandingShowcase from "../components/landing-showcase";
import { Logomark } from "../components/logomark";
import { getNavTree, resolvePrimitivesHref } from "../lib/docs/nav";
import { PACKAGE_MANAGER_RUNNERS, type PackageManager, packageManagerCommands } from "../lib/package-manager";
import { pageMetadata, RootUrlTags } from "../lib/metadata";
import { requirePageMeta } from "../lib/page-meta";
import { installCommand } from "../lib/registry";
import registry from "../../../packages/registry/registry.json";

// Ported from `legacy-pages/index.astro`, class-for-class: `/` is one of the
// two surfaces §17 holds near pixel parity (both were hand-tuned in dedicated
// efforts), so nothing here is simplified, re-ordered, or swapped for a
// registry primitive.
//
// The page is drawn as an exposed design canvas: a 72rem column framed by
// continuous 1px rails, full-width section separators, crop marks at the rail
// intersections, and a decorative ruler outside the left rail. The rails come
// from each row's sm-only inline borders (rows stack, so the lines read as
// continuous); crop marks are the ::before/::after of `.l-marks` rows. Those
// rules live in `app/globals.css` rather than here — Task 4.3's legal pages
// draw the same canvas.
//
// Everything the Astro page took from Blume's `PageLayout` — header, theme,
// drawer, footer, skip link, fonts, analytics — now comes from
// `app/layout.tsx` instead, so this file is the page body and nothing else.
// The one piece of that chrome this page still shapes is the FOOTER: `/` has
// its own framed variant, which `components/site-footer.tsx` draws off the
// pathname.

const uiCount = registry.items.filter((item) => item.type === "registry:ui").length;

// Step 1's command has no registry item to name — it is the bare `shadcn
// init` invocation — so its four dialects are built from the runner prefixes
// directly. Steps 2 and the hero go through `installCommand(item, pm)`, the
// single source of truth for registry install commands.
const initCommands = packageManagerCommands((pm) => `${PACKAGE_MANAGER_RUNNERS[pm]} shadcn@latest init`);
const buttonCommands = packageManagerCommands((pm) => installCommand("button", pm));

// One shape for all three steps, because they are not all the same: steps 1
// and 2 render a `<CopyCommand>` and carry the four dialects of a CLI call;
// step 3 renders a plain `<code>` with an import statement, which no package
// manager varies. The source draws exactly this distinction with its
// `step.command ? … : …` branch — this type is what lets the same branch
// typecheck over one array.
type InstallStep = {
  title: string;
  body: string;
  commands?: Record<PackageManager, string>;
  code?: string;
};

const installSteps: InstallStep[] = [
  {
    title: "1. Initialize",
    body: "Set up shadcn in your project if you have not already. Existing shadcn projects skip this step.",
    commands: initCommands,
  },
  {
    title: "2. Add primitives",
    body: "Install any part from the registry. Source lands in your components directory, ready to edit.",
    commands: buttonCommands,
  },
  {
    title: "3. Use them",
    body: "Import from your own codebase. The source is yours now — restyle or rewrite anything.",
    code: 'import { Button } from "@/components/ui/button"',
  },
];

const whyColumns = [
  {
    title: "Base UI, exclusively",
    body: "Every part is a Base UI primitive underneath — accessible, unstyled, and maintained by the Radix team's successors at MUI. No mixed foundations, no wrappers around wrappers.",
  },
  {
    title: "The shadcn workflow",
    body: "Primitives are distributed as source through the shadcn registry and use the same CSS variables, so they drop into an existing shadcn project without touching your theme.",
  },
  {
    title: "Source, not a dependency",
    body: "The CLI copies code into your repo. There is no runtime dependency on SevenUI and nothing to pin — MIT licensed, yours to keep.",
  },
];

// `/` is the site's one bare `<title>` (§15.8): `requirePageMeta("/", …)`
// answers `{ title: site.name, … }` and `pageMetadata`'s call to `pageTitle`
// returns that unchanged, so the tab reads `SevenUI` rather than
// `SevenUI — SevenUI`. `pageMetadata` also names `/`'s own `/og/index.png`
// card (task-9.2b) and builds the full `og:*`/`twitter:*` set every other
// route now gets from the same function (§16.8).
//
// This now reads `requirePageMeta`, not a hand-written lookup-then-throw:
// this route's shape was identical to what `requirePageMeta` already does,
// and `lib/page-meta.ts`'s own docstring named this file as a non-adopter
// only because it sat outside Task 4.2's file list — not because its shape
// differs. See that docstring for the routes that DO still have a
// principled reason to stay off it.
export async function generateMetadata(): Promise<Metadata> {
  const meta = await requirePageMeta("/", "app/page.tsx");
  return pageMetadata("/", meta.title, meta.description);
}

export default async function Home() {
  // The same resolution `app/layout.tsx` does for the header, drawer and
  // footer, done again here because a page cannot read a layout's locals.
  // `<ComponentWall>` stays presentational and takes the answer as a prop:
  // `lib/docs` is `server-only`, and keeping the lookup in the one Server
  // Component that owns this route means the wall never has to care where
  // "the primitives index" is.
  //
  // This is Ruling 8 extended to the wall (task-4.1 review, Minor). Both the
  // wall's trailing cell and the footer's "All primitives" link name the same
  // semantic target; before Task 4.1 both were literals, so resolving only
  // one of them created a new inconsistency 60 lines apart. It is
  // href-neutral today — `resolvePrimitivesHref` returns
  // `/docs/components/accordion`, the value both used to hard-code — and the
  // built HTML is asserted against that in task-4.1-report.md.
  const primitivesHref = resolvePrimitivesHref(await getNavTree());
  if (!primitivesHref) {
    throw new Error("app/page.tsx: nav tree has no Primitives group with a resolvable href");
  }

  return (
    <>
      <div className="relative">
        <LandingRuler />

        <section className="border-b border-border">
          <div className="l-row l-marks flex flex-col items-center px-6 pt-20 pb-16 text-center sm:pt-28 sm:pb-24">
            <Logomark className="hero-rise mb-8 h-12 w-auto" />
            <h1 className="hero-rise hero-rise-2 text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
              Base UI primitives.
              <br />
              shadcn workflow.
            </h1>
            <p className="hero-rise hero-rise-3 mt-6 max-w-xl text-lg text-balance text-muted-foreground">
              SevenUI is a registry of accessible React primitives built exclusively on Base UI — installed with the
              CLI you already use.
            </p>
            <div className="hero-rise hero-rise-4 mt-10 flex w-full max-w-lg flex-col items-center gap-3 sm:flex-row">
              <Link
                className="inline-flex h-10 shrink-0 items-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                href="/docs"
              >
                Get started
              </Link>
              <CopyCommand commands={buttonCommands} />
            </div>
          </div>
        </section>

        <section className="border-b border-border">
          <div className="l-row l-marks flex items-center justify-between gap-4 border-b border-border px-6 py-3 font-mono text-xs text-muted-foreground">
            <span>Live from the registry</span>
            <span className="text-end">Click around — every part is real</span>
          </div>
          <div className="l-row">
            <LandingShowcase />
          </div>
        </section>

        <section className="border-b border-border">
          <div className="l-row l-marks border-b border-border px-6 py-10 sm:py-12">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Install in three steps</h2>
            <p className="mt-3 max-w-xl text-muted-foreground">
              No package to depend on, no config to learn. The registry speaks the CLI your project already uses.
            </p>
          </div>
          <div className="l-row">
            <div className="grid divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              {installSteps.map((step) => (
                <div className="flex flex-col gap-4 px-6 py-8" key={step.title}>
                  <h3 className="font-medium">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.body}</p>
                  <div className="mt-auto">
                    {step.commands ? (
                      <CopyCommand commands={step.commands} />
                    ) : (
                      <code className="flex h-[46px] w-full items-center overflow-x-auto rounded-lg border bg-card px-4 font-mono text-sm whitespace-nowrap text-card-foreground shadow-xs">
                        {step.code}
                      </code>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-border">
          <div className="l-row l-marks border-b border-border px-6 py-10 sm:py-12">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Same CLI. Different primitives.</h2>
          </div>
          <div className="l-row">
            <div className="grid divide-y divide-border lg:grid-cols-3 lg:divide-x lg:divide-y-0">
              {whyColumns.map((column) => (
                <div className="flex flex-col gap-3 px-6 py-8" key={column.title}>
                  <h3 className="font-medium">{column.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{column.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-border">
          <div className="l-row l-marks flex flex-wrap items-end justify-between gap-4 border-b border-border px-6 py-10 sm:py-12">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Every primitive in the registry</h2>
              <p className="mt-3 max-w-xl text-muted-foreground">Each cell is one command away from your codebase.</p>
            </div>
            <p className="font-mono text-xs text-muted-foreground">{uiCount} primitives · MIT</p>
          </div>
          <div className="l-row">
            <ComponentWall primitivesHref={primitivesHref} />
          </div>
        </section>
      </div>
      {/*
        `/`'s `og:url` and canonical `<link>` — `pageMetadata` omits both
        fields for this one route, so `RootUrlTags` (exported by
        `lib/metadata.tsx`, which owns the full explanation of why) renders
        them here instead. React hoists a `<meta>`/`<link>` into `<head>`
        from wherever it renders, so its position among these siblings is
        invisible.
      */}
      <RootUrlTags />
      <JsonLd route="/" />
    </>
  );
}
