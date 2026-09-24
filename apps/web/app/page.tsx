import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRightIcon } from "lucide-react";
import { BillingApp } from "../components/home/billing-app";
import { InstallCommand } from "../components/home/install-command";
import {
  componentCount,
  dependenciesOf,
  loadCatalog,
  partInfo,
  primitiveCount,
  primitiveNames,
  sourceOf,
} from "../components/home/registry-data";
import { TierPath } from "../components/home/tier-path";
import { JsonLd } from "../components/json-ld";
import { BlockCover } from "../components/pro/block-cover";
import { CodeFile } from "../components/pro/code-file";
import { getNavTree, resolvePrimitivesHref } from "../lib/docs/nav";
import { pageMetadata, RootUrlTags } from "../lib/metadata";
import { requirePageMeta } from "../lib/page-meta";
import { packageManagerCommands } from "../lib/package-manager";
import { installCommand } from "../lib/registry";
import Card03 from "@/components/card/card-03";
import { buttonVariants } from "@/registry/base/ui/button";

// The Pro manifest is read at render time; match its 300 s ISR window.
export const revalidate = 300;

const buttonCommands = packageManagerCommands((pm) => installCommand("button", pm));
const switchCommands = packageManagerCommands((pm) => installCommand("switch", pm));
const cardCommands = packageManagerCommands((pm) => installCommand("component/card-03", pm));

/** Every primitive the billing screen is built from, in DOM order. */
const BILLING_PARTS = [
  "kbd",
  "avatar",
  "breadcrumb",
  "dropdown-menu",
  "button",
  "card",
  "badge",
  "meter",
  "tooltip",
  "separator",
  "slider",
  "input",
  "select",
  "checkbox",
  "switch",
  "tabs",
  "table",
] as const;

/** The primitives card-03 imports; they are bold in the list above it. */
const IN_HAND = new Set(["button", "card", "avatar"]);
const billOfMaterials = [
  { part: "card", uses: "Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter" },
  { part: "avatar", uses: "Avatar, AvatarFallback — once per member" },
  { part: "button", uses: 'Button variant="outline" — the same file the command above installs' },
];

const FEATURED_CATEGORY = "dashboard";
const RANGE = ["hero", "pricing", "ai-chat", "product-detail"];

const H2 = "text-3xl font-semibold tracking-[-0.035em] text-balance sm:text-4xl";
const LEAD = "max-w-[62ch] leading-relaxed text-pretty text-muted-foreground";
const QUIET_LINK =
  "inline-flex items-center gap-1.5 text-sm font-medium text-foreground underline decoration-foreground/30 underline-offset-[5px] transition-colors hover:decoration-foreground";

export async function generateMetadata(): Promise<Metadata> {
  const meta = await requirePageMeta("/", "app/page.tsx");
  return pageMetadata("/", meta.title, meta.description);
}

export default async function Home() {
  const primitivesHref = resolvePrimitivesHref(await getNavTree());
  if (!primitivesHref) {
    throw new Error("app/page.tsx: nav tree has no Primitives group with a resolvable href");
  }

  const catalog = await loadCatalog();
  const categories = catalog.groups.flatMap((group) => group.categories);
  const featured = categories.find((category) => category.id === FEATURED_CATEGORY);
  const featuredItem = featured?.items[0];
  const range = RANGE.map((id) => categories.find((category) => category.id === id)).filter(
    (category) => category !== undefined,
  );
  const switchDeps = dependenciesOf("switch");
  const owned = `# ${installCommand("switch")}
components/ui/switch.tsx    new file, yours to edit
package.json                ${switchDeps.map((dep) => `+ ${dep}`).join("  ")}`;

  const tiers = [
    { href: "#primitive", count: primitiveCount, label: "Primitives", terms: "Free · MIT" },
    { href: "#component", count: componentCount, label: "Components", terms: "Free · copy and go" },
    { href: "#block", count: catalog.blockCount, label: "Blocks", terms: "Pro · $99 once" },
  ];

  return (
    <main className="sv-page" id="content">
      <section aria-labelledby="home-title" className="border-b border-border">
        <div className="l-row px-6 pt-14 pb-12 sm:px-8 sm:pt-20 sm:pb-16 lg:pt-24">
          <div className="grid grid-cols-1 gap-x-14 gap-y-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] lg:items-end">
            <h1
              className="text-[2.5rem] leading-[1.02] font-semibold tracking-[-0.04em] text-balance sm:text-6xl lg:text-[4.25rem]"
              id="home-title"
            >
              Base UI primitives. <span className="sm:block">The shadcn CLI.</span>{" "}
              <span className="sm:block">Your source.</span>
            </h1>
            <div className="grid grid-cols-1 gap-5">
              <p className={`${LEAD} text-lg`}>
                <span className="tabular-nums">{primitiveCount}</span> accessible React primitives, distributed as source
                through the shadcn registry. The CLI copies each file into your repo, on the same CSS variables as
                shadcn/ui. The screen below is made of nothing else.
              </p>
              <InstallCommand commands={buttonCommands} label="button install command" />
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                <Link className={buttonVariants({ size: "lg", className: "h-10 px-5" })} href="/docs">
                  Get started
                  <ArrowRightIcon aria-hidden="true" data-icon="inline-end" />
                </Link>
                <Link className={QUIET_LINK} href="/pro">
                  {`${catalog.blockCount} Pro Blocks, $99 once`}
                </Link>
              </div>
              <TierPath className="mt-3" tiers={tiers} />
            </div>
          </div>

          <div className="mt-12 scroll-mt-20 sm:mt-16" id="billing-demo">
            <BillingApp parts={partInfo(BILLING_PARTS)} />
          </div>
        </div>
      </section>

      <div className="l-row px-6 sm:px-8">
        <div className="relative">
          <div aria-hidden className="absolute top-3 bottom-24 left-[7px] hidden w-px bg-border sm:block">
            <div className="sv-rail-fill absolute inset-0 bg-foreground" />
          </div>

          <Stage id="primitive" top="first">
            <div className="grid grid-cols-1 gap-x-16 gap-y-8 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
              <div>
                <h2 className={H2} id="primitive-title">
                  Primitives are the parts.
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  <span className="tabular-nums">{primitiveCount}</span> in the registry · free, MIT
                </p>
                <p className={`${LEAD} mt-5`}>
                  One install each, one file each. Behavior comes from Base UI; the styling reads shadcn&apos;s tokens,
                  so a primitive sits in your theme the moment it lands. The three in bold build the next tier.
                </p>
                <Link className={`${QUIET_LINK} mt-6`} href={primitivesHref}>
                  Browse the primitives
                  <ArrowRightIcon aria-hidden="true" className="size-4" />
                </Link>
              </div>
              <ul
                aria-label={`All ${primitiveCount} primitives`}
                className="columns-2 gap-x-6 font-mono text-[0.8125rem] leading-6 sm:columns-3 sm:leading-7 xl:columns-4"
              >
                {primitiveNames.map((name) => (
                  <li className="break-inside-avoid" key={name}>
                    <Link
                      className={
                        IN_HAND.has(name)
                          ? "inline-flex items-center gap-2 font-semibold text-foreground underline decoration-foreground/30 underline-offset-4 hover:decoration-foreground"
                          : "text-muted-foreground hover:text-foreground hover:underline"
                      }
                      href={`/docs/components/${name}`}
                    >
                      {IN_HAND.has(name) ? <span aria-hidden className="size-1.5 rounded-full bg-foreground" /> : null}
                      {name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </Stage>

          <Stage id="component">
            <div className="grid grid-cols-1 items-start gap-x-16 gap-y-10 lg:grid-cols-2">
              <div className="lg:order-2 lg:pt-1">
                <h2 className={H2} id="component-title">
                  Components are the assemblies.
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  <span className="tabular-nums">{componentCount}</span> composed examples · free, copy and go
                </p>
                <p className={`${LEAD} mt-5`}>
                  Real usage of the primitives, wired together and ready to paste over. This one is{" "}
                  <span className="font-mono text-[0.9em] text-foreground">card-03</span>, rendered live. The parts list
                  below is its import list.
                </p>
                <dl className="mt-7 divide-y divide-border border-y border-border text-sm">
                  {billOfMaterials.map((row) => (
                    <div className="grid grid-cols-[5rem_minmax(0,1fr)] gap-4 py-3" key={row.part}>
                      <dt className="font-mono text-[0.8125rem] font-semibold text-foreground">{row.part}</dt>
                      <dd className="text-muted-foreground">{row.uses}</dd>
                    </div>
                  ))}
                </dl>
                <InstallCommand className="mt-6" commands={cardCommands} label="card-03 install command" />
                <Link className={`${QUIET_LINK} mt-5`} href="/components">
                  Browse all {componentCount} Components
                  <ArrowRightIcon aria-hidden="true" className="size-4" />
                </Link>
              </div>
              <div className="sv-plate grid place-items-center rounded-xl border border-border px-5 py-12 sm:px-10 sm:py-16 lg:order-1">
                <Card03 />
              </div>
            </div>
          </Stage>

          <Stage id="block" last>
            <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-5">
              <div>
                <h2 className={H2} id="block-title">
                  Blocks are the finished product.
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  <span className="tabular-nums">{catalog.blockCount}</span> Blocks in{" "}
                  <span className="tabular-nums">{catalog.categoryCount}</span> categories · Pro, $99 once
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Link className={buttonVariants({ variant: "outline", size: "lg" })} href="/blocks">
                  See every Block
                </Link>
                <Link className={buttonVariants({ size: "lg" })} href="/pro">
                  Get Pro — $99
                </Link>
              </div>
            </div>

            {featured ? (
              <figure className="mt-10 overflow-hidden rounded-xl border border-border bg-card shadow-[0_1px_2px_color-mix(in_oklch,var(--foreground)_5%,transparent),0_40px_80px_-40px_color-mix(in_oklch,var(--foreground)_28%,transparent)] dark:shadow-none">
                <Link className="block" href={`/blocks/${featured.group}/${featured.id}`}>
                  <BlockCover
                    alt={featuredItem ? `${featuredItem.title}: ${featuredItem.description}` : featured.label}
                    aspect="aspect-video sm:aspect-[16/7.5]"
                    cover={featured.cover}
                  />
                </Link>
                <figcaption className="flex flex-col gap-2 border-t border-border px-5 py-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
                  <p className="max-w-2xl text-sm text-pretty text-muted-foreground">
                    <span className="font-medium text-foreground">{featuredItem?.title ?? featured.label}</span>
                    {featuredItem ? ` — ${featuredItem.description}` : null}
                  </p>
                  <code className="font-mono text-xs break-all text-muted-foreground lg:shrink-0">
                    npx shadcn@latest add @sevenui/pro/{featuredItem?.name ?? "dashboard-01"}
                  </code>
                </figcaption>
              </figure>
            ) : null}

            {range.length > 0 ? (
              <ul aria-label="More Block categories" className="mt-6 grid grid-cols-2 gap-x-5 gap-y-7 lg:grid-cols-4">
                {range.map((category) => (
                  <li key={category.id}>
                    <Link className="group block" href={`/blocks/${category.group}/${category.id}`}>
                      <BlockCover
                        alt=""
                        className="rounded-lg border border-border transition-[border-color] group-hover:border-foreground/40"
                        cover={category.cover}
                      />
                      <span className="mt-2.5 flex items-baseline justify-between gap-3 text-sm">
                        <span className="font-medium group-hover:underline">{category.label}</span>
                        <span className="text-xs text-muted-foreground tabular-nums">
                          {category.items.length} {category.items.length === 1 ? "Block" : "Blocks"}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </Stage>
        </div>
      </div>

      <section aria-labelledby="layers-title" className="border-y border-border">
        <div className="l-row">
          <div className="px-6 pt-16 pb-10 sm:px-8 sm:pt-24 sm:pb-14">
            <h2 className={H2} id="layers-title">
              Who does what when you run the command.
            </h2>
          </div>
          <div className="divide-y divide-border border-t border-border">
            <Layer
              body="Focus management, keyboard interaction, typeahead, ARIA wiring, popups that stay inside the viewport: Base UI does the work, and the file only styles it. Parts with no behavior to manage — a card, a table — stay plain markup."
              code={<CodeFile code={sourceOf("switch")} copyLabel="abridged switch source" name="components/ui/switch.tsx" note="class strings collapsed" />}
              title="Base UI handles behavior."
            />
            <Layer
              body="@sevenui is listed in the shadcn registry index, so the CLI resolves it with nothing to configure: add primitives by name. SevenUI reads the same CSS variables as shadcn/ui, so the theme you already have applies unchanged. No second token set, no config to translate."
              code={<InstallCommand commands={switchCommands} label="switch install command" />}
              title="The shadcn CLI handles delivery."
            />
            <Layer
              body="The file lands in your components folder, and nothing named SevenUI joins your dependencies — only what the file itself imports. Rename a prop, change a class, delete a variant. There is no upstream to stay in sync with."
              code={<CodeFile code={owned} copyLabel="summary" name="what changes in your repo" />}
              title="You own what lands."
            />
          </div>
        </div>
      </section>

      <section aria-labelledby="start-title">
        <div className="l-row flex flex-col gap-8 px-6 py-20 sm:px-8 sm:py-24 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <h2 className="text-4xl font-semibold tracking-[-0.04em] text-balance sm:text-5xl" id="start-title">
              Start with the button.
            </h2>
            <p className={`${LEAD} mt-4`}>
              Add it, open the file it writes, and decide from there. The rest of the registry installs the same way,
              and so do the Pro Blocks.
            </p>
          </div>
          <div className="flex w-full max-w-lg flex-col gap-4">
            <InstallCommand commands={buttonCommands} label="button install command" />
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link className={buttonVariants({ size: "lg", className: "h-10 px-5" })} href="/docs">
                Get started
              </Link>
              <Link className={QUIET_LINK} href="/pro">
                SevenUI Pro — $99 once
              </Link>
            </div>
          </div>
        </div>
      </section>
      <RootUrlTags />
      <JsonLd route="/" />
    </main>
  );
}

/** One stop on the rail. The node sits level with the heading's first line. */
function Stage({ id, children, top, last }: { id: string; children: ReactNode; top?: "first"; last?: boolean }) {
  return (
    <section
      aria-labelledby={`${id}-title`}
      className={`relative scroll-mt-20 sm:pl-14 ${top ? "pt-16 sm:pt-28" : "pt-20 sm:pt-32"} ${last ? "pb-20 sm:pb-32" : ""}`}
      id={id}
    >
      <span
        aria-hidden
        className={`sv-node absolute left-0 hidden size-[15px] rounded-full border border-foreground sm:block ${top ? "sm:top-[calc(7rem+0.7rem)]" : "sm:top-[calc(8rem+0.7rem)]"}`}
      />
      {children}
    </section>
  );
}

function Layer({ title, body, code }: { title: string; body: string; code: ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-6 px-6 py-10 sm:px-8 sm:py-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14">
      <div>
        <h3 className="text-xl font-semibold tracking-[-0.02em]">{title}</h3>
        <p className="mt-3 max-w-[52ch] text-[0.9375rem] leading-relaxed text-pretty text-muted-foreground">{body}</p>
      </div>
      <div className="min-w-0">{code}</div>
    </div>
  );
}
