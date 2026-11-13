import "../components/home/home.css";

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import type { ReactNode } from "react";
import { DemoTabs } from "../components/demo/demo-tabs";
import { LazyCode } from "../components/demo/lazy-code";
import { FlavourSwitch } from "../components/flavour/flavour-switch";
import { InlineFlavouredPreview } from "../components/home/inline-preview";
import { InstallCommand } from "../components/home/install-command";
import {
  baseUiVersion,
  componentFamilies,
  componentLabel,
  dualFlavourExampleCount,
  foundationModules,
  loadCatalog,
  loadPrimitiveLinks,
  primitiveCount,
  uiSdkVersion,
} from "../components/home/registry-data";
import { releaseHref, releaseLabel } from "../components/home/release";
import { HomeSurface } from "../components/home/surface/surface";
import { JsonLd } from "../components/json-ld";
import { LAYER_FRAME_LG, LAYER_TOOLBAR, LAYER_WINDOW } from "../components/layer-frame";
import { InstallCommand as FlavouredInstall } from "../components/mdx/install-command";
import { type Flavour, FLAVOURS } from "../lib/flavour";
import { pageMetadata, RootUrlTags } from "../lib/metadata";
import { requirePageMeta } from "../lib/page-meta";
import { PACKAGE_MANAGER_RUNNERS, packageManagerCommands } from "../lib/package-manager";
import { PRO_LAUNCH } from "../lib/pro-pricing";
import { installCommand } from "../lib/registry";
import { hasOverlay, uiSdkAvailable } from "../lib/ui-sdk-examples";
import { buttonVariants } from "@/registry/base/ui/button";
import { LayerCard, LayerCardHeader, LayerCardPanel } from "@/registry/base/ui/layer-card";
import Combobox13 from "@/components/combobox/combobox-13";

// The home stays on the site's 300 s ISR window, like /blocks and /pro: the Blocks row reads the Pro manifest.
export const revalidate = 300;

/** The gallery example the flavour section shows: no UI SDK overlay, so its source is the same in both. */
const EXAMPLE = { slug: "combobox", id: "combobox-13", primitive: "combobox" } as const;
const EXAMPLE_FILE = `${EXAMPLE.slug}/${EXAMPLE.id}.tsx`;

const ROW = "l-row px-4 sm:px-8";
// The D display type: big, medium weight, tight. A heading's second clause is muted.
const DISPLAY = "font-[510] tracking-[-0.022em] text-balance";
const MUTED = "text-muted-foreground";
const H2_BLOCK = `${DISPLAY} max-w-[44rem] text-[1.75rem] leading-[1.15] sm:text-[2.25rem]`;
const QUIET_LINK =
  "inline-flex w-fit items-center gap-1.5 rounded-sm text-sm font-medium underline decoration-foreground/30 underline-offset-[5px] hover:decoration-foreground focus-visible:focus-ring";
const CODE = "font-mono text-[0.8125rem] text-foreground/90";
const TABLE_CODE = "font-mono text-xs whitespace-nowrap";

/** Both flavours' commands for one item, per package manager. */
function flavouredCommands(item: string, flags = "") {
  return {
    commands: packageManagerCommands((pm) => installCommand(item, pm, "base-ui", true, flags)),
    uiSdkCommands: packageManagerCommands((pm) => installCommand(item, pm, "ui-sdk", true, flags)),
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const meta = await requirePageMeta("/", "app/page.tsx");
  return pageMetadata("/", meta.title, meta.description);
}

export default async function Home() {
  const [catalog, primitives, ...foundations] = await Promise.all([
    loadCatalog(),
    loadPrimitiveLinks(),
    ...FLAVOURS.map((flavour) => foundationModules(EXAMPLE.primitive, flavour)),
  ]);
  const foundation = Object.fromEntries(FLAVOURS.map((flavour, i) => [flavour, foundations[i]])) as Record<Flavour, string[]>;
  const covers = catalog.groups
    .flatMap((group) => group.categories.map((category) => ({ group, category })))
    .filter(({ category }) => category.cover)
    .slice(0, 3);
  const firstBlock = catalog.groups.flatMap((group) => group.items)[0];

  return (
    <main className="sv-page" id="content">
      {/* 1 — The proposition, and the product doing its job right under it. */}
      <section aria-labelledby="home-title">
        <div className={`${ROW} pt-12 sm:pt-16`}>
          <Link
            className="inline-flex max-w-full items-center gap-2 rounded-full bg-surface-tray py-1 pr-3 pl-1 text-[0.8125rem] text-foreground/85 hover:text-foreground focus-visible:focus-ring"
            href={releaseHref}
          >
            <span className="rounded-full bg-surface-raised px-2 py-0.5 text-[0.6875rem] font-medium text-foreground tabular-nums shadow-docs-panel">
              {releaseLabel}
            </span>
            <span className="truncate">Every primitive now also runs on UI SDK</span>
            <ArrowRightIcon aria-hidden="true" className="size-3.5 shrink-0 text-muted-foreground" />
          </Link>

          <h1
            className={`${DISPLAY} mt-7 max-w-[15ch] text-[2.375rem] leading-[1.05] sm:max-w-[19ch] sm:text-[3.25rem] sm:leading-[1.03] lg:max-w-[22ch] lg:text-[3.75rem]`}
            id="home-title"
          >
            Primitives for shadcn/ui, on Base UI or UI SDK. <span className={MUTED}>One API, and the source is yours.</span>
          </h1>

          <p className="mt-6 max-w-[36rem] text-base leading-relaxed text-pretty text-muted-foreground sm:text-[1.0625rem]">
            <span className="tabular-nums">{primitiveCount}</span> accessible primitives you install as source with the
            shadcn CLI, themed by the CSS variables you already have. Composed into{" "}
            <span className="tabular-nums">{componentLabel}</span> free components, and into Pro blocks built on Base
            UI.
          </p>

          <div className="mt-8 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center">
            <InstallCommand className="sm:w-[31rem]" label="button install command" {...flavouredCommands("button")} />
            <div className="flex gap-2.5">
              <Link className={buttonVariants({ className: "h-10 flex-1 rounded-[10px] px-4 sm:flex-none" })} href="/components">
                Browse components
              </Link>
              <Link
                className={buttonVariants({ variant: "outline", className: "h-10 flex-1 rounded-[10px] px-4 sm:flex-none" })}
                href="/docs"
              >
                Read the docs
              </Link>
            </div>
          </div>
        </div>

        <div className={`${ROW} pt-10 pb-20 sm:pt-14 sm:pb-28`}>
          <figure aria-labelledby="surface-caption" className="m-0" data-nosnippet data-home-surface>
            <LayerCard className={LAYER_FRAME_LG}>
              <LayerCardHeader className={`${LAYER_TOOLBAR} justify-between px-3`}>
                <span aria-hidden="true" className="flex min-w-0 items-center gap-2 text-[0.8125rem] font-[510]">
                  <span className="grid size-5 shrink-0 place-items-center rounded-[6px] bg-foreground text-[0.6875rem] font-semibold text-background">
                    A
                  </span>
                  <span className="truncate">
                    Acme <span className="font-normal text-muted-foreground">/ storefront / releases</span>
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
                  <span aria-hidden="true" className="hidden sm:inline">
                    Running on
                  </span>
                  <FlavourSwitch mirror />
                </span>
              </LayerCardHeader>
              <LayerCardPanel className={`${LAYER_WINDOW} min-h-[25rem]`}>
                <HomeSurface />
              </LayerCardPanel>
            </LayerCard>
            <figcaption className="mt-4 max-w-[46rem] text-[0.8125rem] leading-relaxed text-pretty text-muted-foreground" id="surface-caption">
              A working release planner built only from SevenUI primitives: tabs, combobox, select, dropdown menu,
              dialog, popover, calendar, switch and toast. The team and its releases are made up; every control is
              real.{" "}
              <a className="underline decoration-foreground/30 underline-offset-4 hover:text-foreground focus-visible:focus-ring" href="#flavours">
                Run it on the other flavour
              </a>
            </figcaption>
          </figure>
        </div>
      </section>

      {/* 2 — The signature: one example, switched between foundations in place. */}
      <section aria-labelledby="flavours-title" className="scroll-mt-20 border-t border-hairline" id="flavours">
        <div className={`${ROW} py-16 sm:py-24`}>
          <div className={H2_BLOCK}>
            <h2 className="inline tracking-[inherit]" id="flavours-title">
              Same code, two foundations.
            </h2>{" "}
            <span className={MUTED}>
              Pick Base UI or UI SDK, and the preview, the source and the command follow.
            </span>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,25rem)_minmax(0,1fr)] lg:gap-12">
            <div className="flex min-w-0 flex-col gap-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-medium" id="flavour-switch-label">
                  Flavour for this site
                </span>
                <FlavourSwitch className="text-[0.8125rem]" />
              </div>

              <table className="w-full border-collapse text-left text-[0.8125rem]">
                <caption className="sr-only">Base UI and UI SDK compared</caption>
                <thead>
                  <tr>
                    <td className="w-[5rem]" />
                    <th className="home-col-base-ui rounded-t-lg px-3 pt-2.5 pb-2 font-medium" scope="col">
                      Base UI
                    </th>
                    <th className="home-col-ui-sdk rounded-t-lg px-3 pt-2.5 pb-2 font-medium" scope="col">
                      UI SDK
                    </th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground [&_th]:py-2 [&_th]:pr-3 [&_th]:align-top [&_th]:font-normal [&_td]:px-3 [&_td]:py-2 [&_td]:align-top [&_tr]:border-t [&_tr]:border-hairline">
                  <tr>
                    <th scope="row">Status</th>
                    <td className="home-col-base-ui">Stable, the default</td>
                    <td className="home-col-ui-sdk">Beta, from Vercel Labs</td>
                  </tr>
                  <tr>
                    <th scope="row">Library</th>
                    <td className="home-col-base-ui">
                      <code className={TABLE_CODE}>@base-ui/react</code>{" "}
                      <span className="block tabular-nums">{baseUiVersion}</span>
                    </td>
                    <td className="home-col-ui-sdk">
                      <code className={TABLE_CODE}>@ui-sdk/react</code>{" "}
                      <span className="block tabular-nums">{uiSdkVersion}, pinned</span>
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">Needs</th>
                    <td className="home-col-base-ui">Your shadcn project, as it is</td>
                    <td className="home-col-ui-sdk">React 19, and one CSS layer line</td>
                  </tr>
                  <tr>
                    <th scope="row">Install</th>
                    <td className="home-col-base-ui">
                      <code className={TABLE_CODE}>@sevenui/</code>
                      <code className={`${TABLE_CODE} block`}>&lt;name&gt;</code>
                    </td>
                    <td className="home-col-ui-sdk">
                      <code className={TABLE_CODE}>@sevenui/ui-sdk/</code>
                      <code className={`${TABLE_CODE} block`}>&lt;name&gt;</code>
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">Pro blocks</th>
                    <td className="home-col-base-ui rounded-b-lg">Built on Base UI</td>
                    <td className="home-col-ui-sdk rounded-b-lg">None: blocks are Base UI only</td>
                  </tr>
                </tbody>
              </table>

              <p className="text-sm leading-relaxed text-pretty text-muted-foreground">
                <span className="tabular-nums">{dualFlavourExampleCount.toLocaleString("en-US")}</span> demos and gallery
                examples are published in both flavours. Some behaviour differs on UI SDK, and each primitive&apos;s page
                lists how.
              </p>
              <Link className={QUIET_LINK} href="/docs/installation#choose-a-flavour">
                How to choose a flavour
                <ArrowRightIcon aria-hidden="true" className="size-3.5" />
              </Link>
            </div>

            <div className="flex min-w-0 flex-col gap-4">
              <DemoTabs
                actions={
                  // A wrapper hides it on phones: `hidden` on the link itself loses to QUIET_LINK's `inline-flex`.
                  <span className="mr-2 hidden sm:block">
                    <Link className={`${QUIET_LINK} text-[0.8125rem] whitespace-nowrap`} href={`/components/${EXAMPLE.slug}#${EXAMPLE.id}`}>
                      See it in the gallery
                    </Link>
                  </span>
                }
                code={
                  <LazyCode
                    id={EXAMPLE.id}
                    src={`/components/${EXAMPLE.slug}/code/${EXAMPLE.id}`}
                    uiSdkSrc={
                      hasOverlay("components", EXAMPLE_FILE) ? `/components/${EXAMPLE.slug}/code/${EXAMPLE.id}/ui-sdk` : undefined
                    }
                  />
                }
                flavoured
                label="Deploy source picker"
                preview={
                  <div className="flex min-h-[25rem] items-center justify-center bg-background p-4 sm:p-8">
                    <InlineFlavouredPreview
                      available={uiSdkAvailable("components", EXAMPLE_FILE)}
                      folder={`components/${EXAMPLE.slug}`}
                      name={EXAMPLE.id}
                    >
                      <Combobox13 />
                    </InlineFlavouredPreview>
                  </div>
                }
              />
              <FlavouredInstall item={`component/${EXAMPLE.id}`} />
              <p className="text-[0.8125rem] leading-relaxed text-pretty text-muted-foreground">
                The example&apos;s file is the same in both flavours. What changes is underneath it:{" "}
                <span className="flavour-only-base-ui">
                  <code className={CODE}>components/ui/combobox.tsx</code> imports{" "}
                  <code className={CODE}>{foundation["base-ui"].join(", ")}</code>.
                </span>
                <span className="flavour-only-ui-sdk">
                  <code className={CODE}>components/ui/combobox.tsx</code> imports{" "}
                  <code className={CODE}>{foundation["ui-sdk"].join(", ")}</code>.
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3 — The three tiers, each with what it actually holds. */}
      <section aria-labelledby="tiers-title" className="border-t border-hairline">
        <div className={`${ROW} py-16 sm:py-24`}>
          <div className={H2_BLOCK}>
            <h2 className="inline tracking-[inherit]" id="tiers-title">
              Start with a part, a pattern or a page.
            </h2>{" "}
            <span className={MUTED}>The same registry and the same command at every size.</span>
          </div>

          <div className="mt-12 flex flex-col">
            <Tier
              command={<InstallCommand label="dialog install command" wrap {...flavouredCommands("dialog")} />}
              id="primitives"
              link={{ href: "/docs/components", label: `Browse ${primitiveCount} primitives` }}
              summary="The installable units, from a button to a date picker. Each one in both flavours, each with keyboard support and its own tests."
              terms={`${primitiveCount} · free, MIT`}
              title="Primitives"
            >
              <ul className="columns-2 gap-x-6 text-[0.8125rem] sm:columns-3 xl:columns-4">
                {primitives.map((primitive) => (
                  <li className="break-inside-avoid" key={primitive.href}>
                    <Link
                      className="inline-block rounded-sm py-1 text-muted-foreground hover:text-foreground hover:underline focus-visible:focus-ring"
                      href={primitive.href}
                    >
                      {primitive.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </Tier>

            <Tier
              command={<InstallCommand label="component install command" wrap {...flavouredCommands(`component/${EXAMPLE.id}`)} />}
              id="components"
              link={{ href: "/components", label: `Browse ${componentLabel} components` }}
              summary="Copy-and-go compositions of the primitives for the screens you build every week. Also in both flavours."
              terms={`${componentLabel} · free, MIT`}
              title="Components"
            >
              <ul className="grid grid-cols-1 gap-x-8 text-[0.8125rem] sm:grid-cols-2">
                {componentFamilies.map((family) => (
                  <li key={family.id}>
                    <Link
                      className="flex items-baseline justify-between gap-4 rounded-sm border-b border-hairline py-2 hover:text-foreground focus-visible:focus-ring"
                      href={`/components#${family.id}`}
                    >
                      <span className="text-foreground">{family.label}</span>
                      <span className="text-muted-foreground tabular-nums">{family.count}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Tier>

            <Tier
              command={
                firstBlock ? (
                  <InstallCommand
                    commands={packageManagerCommands((pm) => installCommand(`pro/${firstBlock.name}`, pm, "base-ui", false))}
                    label="block install command"
                    wrap
                  />
                ) : null
              }
              id="blocks"
              link={{ href: "/blocks", label: "Browse Pro blocks" }}
              secondLink={{ href: "/pro", label: `Get Pro for ${PRO_LAUNCH}, once` }}
              summary={`Full sections and pages: ${catalog.blockCount} blocks in ${catalog.categoryCount} categories. Built on Base UI only, and installed with a Pro license key.`}
              terms="Pro · Base UI"
              title="Blocks"
            >
              <ul className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {covers.map(({ group, category }) => (
                  <li key={category.id}>
                    <Link
                      className="group flex flex-col gap-2 rounded-xl focus-visible:focus-ring"
                      href={`/blocks/${group.id}/${category.id}`}
                    >
                      <span className="block aspect-video overflow-hidden rounded-xl bg-surface-tray shadow-[inset_0_0_0_1px_var(--hairline)]">
                        <img
                          alt=""
                          className={`h-full w-full object-cover ${category.cover?.darkSrc ? "dark:hidden" : ""}`}
                          decoding="async"
                          height={360}
                          loading="lazy"
                          src={category.cover?.src}
                          width={640}
                        />
                        {category.cover?.darkSrc && (
                          <img
                            alt=""
                            className="hidden h-full w-full object-cover dark:block"
                            decoding="async"
                            height={360}
                            loading="lazy"
                            src={category.cover.darkSrc}
                            width={640}
                          />
                        )}
                      </span>
                      <span className="flex items-baseline justify-between gap-3 text-[0.8125rem]">
                        <span className="font-medium group-hover:underline">{category.label}</span>
                        <span className="text-muted-foreground tabular-nums">
                          {category.items.length === 1 ? "1 block" : `${category.items.length} blocks`}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Tier>
          </div>
        </div>
      </section>

      {/* 4 — Why it is safe to adopt: only what the repo can back. */}
      <section aria-labelledby="adopt-title" className="border-t border-hairline">
        <div className={`${ROW} py-16 sm:py-24`}>
          <div className={H2_BLOCK}>
            <h2 className="inline tracking-[inherit]" id="adopt-title">
              Nothing to depend on but your own files.
            </h2>{" "}
            <span className={MUTED}>And the headless library under them.</span>
          </div>
          <ul className="mt-12 grid grid-cols-1 gap-x-12 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            <Fact title="The source is yours">
              Each primitive lands as a file under your <code className={CODE}>ui</code> alias. Read it, change it,
              keep it: there is no SevenUI package to upgrade around.
            </Fact>
            <Fact link={{ href: "/docs/theming", label: "Theming" }} title="A drop-in for shadcn/ui">
              The same CSS variables, the same <code className={CODE}>@/components/ui</code> imports, the same CLI. A
              shadcn theme you already have carries over.
            </Fact>
            <Fact title="Tested in both flavours">
              Each of the <span className="tabular-nums">{primitiveCount}</span> primitives has its own test file, and the
              suite runs once on Base UI and once on UI SDK.
            </Fact>
            <Fact title="Keyboard and screen readers">
              Focus management and ARIA come from the headless library. SevenUI adds a visible offset focus ring and
              tests that every control has an accessible name.
            </Fact>
            <Fact link={{ href: "/components", label: "Open the gallery" }} title="Your theme, previewed">
              The theme customizer on the gallery and the docs shows every preview in another theme, base colour and
              radius before you install anything.
            </Fact>
            <Fact link={{ href: "/llms.txt", label: "Read llms.txt", plain: true }} title="Readable by agents">
              <code className={CODE}>/llms.txt</code> indexes every primitive, component and block, and every docs page
              has a Markdown copy at the same address plus <code className={CODE}>.md</code>.
            </Fact>
          </ul>
        </div>
      </section>

      {/* 5 — The way in. */}
      <section aria-labelledby="start-title" className="border-t border-hairline bg-surface-tray">
        <div className={`${ROW} py-16 sm:py-24`}>
          <div className={H2_BLOCK}>
            <h2 className="inline tracking-[inherit]" id="start-title">
              Start with two commands.
            </h2>{" "}
            <span className={MUTED}>In the flavour and package manager you picked.</span>
          </div>
          <ol className="mt-10 grid max-w-[44rem] grid-cols-1 gap-6">
            <li className="flex flex-col gap-2.5">
              <span className="text-sm font-medium">1. Set up shadcn with the Base UI base</span>
              <InstallCommand
                commands={packageManagerCommands((pm) => `${PACKAGE_MANAGER_RUNNERS[pm]} shadcn@latest init --base base`)}
                label="init command"
                wrap
              />
            </li>
            <li className="flex flex-col gap-2.5">
              <span className="text-sm font-medium">2. Add primitives over the starter files</span>
              <InstallCommand label="add command" wrap {...flavouredCommands("button dialog", "--overwrite")} />
              <span className="flavour-only-ui-sdk text-[0.8125rem] leading-relaxed text-muted-foreground">
                On UI SDK, also declare <code className={CODE}>@layer ui-sdk;</code> above your Tailwind import and pin
                UI SDK exactly.{" "}
                <Link className="underline underline-offset-4 hover:text-foreground focus-visible:focus-ring" href="/docs/installation#set-up-a-ui-sdk-project">
                  The UI SDK setup
                </Link>
              </span>
            </li>
          </ol>
          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3">
            <Link className={QUIET_LINK} href="/docs/installation">
              Installation guide
            </Link>
            <Link className={QUIET_LINK} href="/docs">
              Read the docs
            </Link>
            <Link className={QUIET_LINK} href="/pro">
              <span className="tabular-nums">{`Get Pro for ${PRO_LAUNCH}, once`}</span>
              <ArrowRightIcon aria-hidden="true" className="size-3.5" />
            </Link>
          </div>
        </div>
      </section>
      <RootUrlTags />
      <JsonLd route="/" />
    </main>
  );
}

type TierLink = { href: string; label: string };

function Tier({
  id,
  title,
  terms,
  summary,
  command,
  link,
  secondLink,
  children,
}: {
  id: string;
  title: string;
  terms: string;
  summary: string;
  command: ReactNode;
  link: TierLink;
  secondLink?: TierLink;
  children: ReactNode;
}) {
  return (
    <div
      className="grid grid-cols-1 gap-8 border-t border-hairline py-10 first:border-t-0 first:pt-0 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-14"
      data-tier={id}
    >
      <div className="flex min-w-0 flex-col">
        <h3 className="text-xl font-[510] tracking-[-0.015em]">{title}</h3>
        <p className="mt-1 text-[0.8125rem] text-muted-foreground tabular-nums">{terms}</p>
        <p className="mt-3 text-sm leading-relaxed text-pretty text-muted-foreground">{summary}</p>
        {command && <div className="mt-5">{command}</div>}
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
          <Link className={QUIET_LINK} href={link.href}>
            {link.label}
            <ArrowRightIcon aria-hidden="true" className="size-3.5" />
          </Link>
          {secondLink && (
            <Link className={QUIET_LINK} href={secondLink.href}>
              <span className="tabular-nums">{secondLink.label}</span>
            </Link>
          )}
        </div>
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function Fact({
  title,
  link,
  children,
}: {
  title: string;
  link?: TierLink & { plain?: boolean };
  children: ReactNode;
}) {
  return (
    <li className="flex flex-col">
      <h3 className="text-[0.9375rem] font-[510] tracking-[-0.01em]">{title}</h3>
      <p className="mt-2 max-w-[38ch] text-sm leading-relaxed text-pretty text-muted-foreground">{children}</p>
      {link &&
        (link.plain ? (
          <a className={`${QUIET_LINK} mt-3`} href={link.href}>
            {link.label}
          </a>
        ) : (
          <Link className={`${QUIET_LINK} mt-3`} href={link.href}>
            {link.label}
          </Link>
        ))}
    </li>
  );
}
