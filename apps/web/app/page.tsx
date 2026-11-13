import "../components/home/home.css";

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import type { ReactNode } from "react";
import { FlavourSwitch } from "../components/flavour/flavour-switch";
import { InstallCommand } from "../components/home/install-command";
import { baseUiVersion, componentLabel, loadCatalog, primitiveCount, uiSdkVersion } from "../components/home/registry-data";
import { releaseHref, releaseLabel } from "../components/home/release";
import { HomeSurface } from "../components/home/surface/surface";
import { JsonLd } from "../components/json-ld";
import { LAYER_FRAME_LG, LAYER_TOOLBAR, LAYER_WINDOW } from "../components/layer-frame";
import { pageMetadata, RootUrlTags } from "../lib/metadata";
import { requirePageMeta } from "../lib/page-meta";
import { PACKAGE_MANAGER_RUNNERS, packageManagerCommands } from "../lib/package-manager";
import { PRO_LAUNCH } from "../lib/pro-pricing";
import { installCommand } from "../lib/registry";
import { buttonVariants } from "@/registry/base/ui/button";
import { LayerCard, LayerCardHeader, LayerCardPanel } from "@/registry/base/ui/layer-card";

// The home stays on the site's 300 s ISR window, like /blocks and /pro: the Blocks row reads the Pro manifest.
export const revalidate = 300;

// One rhythm for the whole page: every section gets the same generous band, every header the same shape,
// and nothing sits in a box unless it is the product itself.
const ROW = "l-row px-4 sm:px-8";
const SECTION = `${ROW} py-24 sm:py-28 lg:py-32`;
const DISPLAY = "font-[510] tracking-[-0.03em] text-balance";
const MUTED = "text-muted-foreground";
const H2 = `${DISPLAY} text-[2.25rem] leading-[1.05] sm:text-[3rem] lg:text-[3.5rem]`;
const LEAD = "text-[1.0625rem] leading-relaxed text-pretty text-muted-foreground sm:text-xl sm:leading-relaxed";
const QUIET_LINK =
  "inline-flex w-fit items-center gap-1.5 rounded-sm text-[0.9375rem] font-medium underline decoration-foreground/30 underline-offset-[5px] hover:decoration-foreground focus-visible:focus-ring";
const CODE = "font-mono text-[0.8125rem]";

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
  const catalog = await loadCatalog();

  return (
    <main className="sv-page" id="content">
      {/* 1 — The arrival: one line of promise, and the product running right under it. */}
      <section aria-labelledby="home-title">
        <div className={`${ROW} flex flex-col items-center pt-14 text-center sm:pt-20 lg:pt-24`}>
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
            className={`${DISPLAY} mt-8 text-[2.75rem] leading-[1.02] sm:text-[4rem] sm:leading-[1] lg:text-[4.75rem]`}
            id="home-title"
          >
            Own every primitive. <span className={`${MUTED} block`}>Choose the foundation.</span>
          </h1>

          <p className={`${LEAD} mt-6 max-w-[40rem]`}>
            <span className="tabular-nums">{primitiveCount}</span> accessible primitives for shadcn/ui, installed as
            source. <span className="sm:block">One API, on Base UI or UI SDK.</span>
          </p>

          <div className="mt-10 flex w-full max-w-[40rem] flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <InstallCommand className="sm:flex-1" label="button install command" {...flavouredCommands("button")} />
            <Link className={buttonVariants({ className: "h-10 rounded-[10px] px-5" })} href="/components">
              Browse components
            </Link>
          </div>
        </div>

        <div className={`${ROW} pt-14 sm:pt-16`}>
          <figure aria-labelledby="surface-caption" className="m-0" data-nosnippet data-home-surface>
            <LayerCard className={LAYER_FRAME_LG}>
              <LayerCardHeader className={`${LAYER_TOOLBAR} justify-between ps-3`}>
                <span aria-hidden="true" className="flex min-w-0 items-center gap-2 text-[0.8125rem] font-[510]">
                  <span className="grid size-5 shrink-0 place-items-center rounded-[6px] bg-foreground text-[0.6875rem] font-semibold text-background">
                    A
                  </span>
                  <span className="truncate">
                    Acme <span className="font-normal text-muted-foreground">/ releases</span>
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
                  <span aria-hidden="true" className="hidden sm:inline">
                    Running on
                  </span>
                  {/* The page's one real flavour control, right next to what it changes. */}
                  <FlavourSwitch />
                </span>
              </LayerCardHeader>
              <LayerCardPanel className={`${LAYER_WINDOW} min-h-[25rem]`}>
                <HomeSurface />
              </LayerCardPanel>
            </LayerCard>
            <figcaption className="mx-auto mt-5 max-w-[40rem] text-center text-sm text-pretty text-muted-foreground" id="surface-caption">
              Live, not a screenshot. Every control is a SevenUI primitive; the data is made up.
            </figcaption>
          </figure>
        </div>
      </section>

      {/* 2 — The signature: the two foundations side by side, following the same switch. */}
      <section aria-labelledby="flavours-title" className="scroll-mt-20" id="flavours">
        <div className={`${SECTION} flex flex-col items-center text-center`}>
          <h2 className={H2} id="flavours-title">
            Same code. <span className={MUTED}>Two foundations.</span>
          </h2>
          <p className={`${LEAD} mt-5 max-w-[40rem] text-balance`}>One switch, and every preview and command on this site follows.</p>

          <FlavourSwitch
            className="mt-10 rounded-xl p-1 text-[0.9375rem] [&_.flavour-switch-option]:rounded-[9px] [&_.flavour-switch-option]:px-5 [&_.flavour-switch-option]:py-2"
            mirror
          />

          <div className="mt-10 grid w-full max-w-[44rem] grid-cols-1 gap-3 text-left sm:grid-cols-2">
            <Foundation
              className="home-col-base-ui"
              library={`@base-ui/react ${baseUiVersion}`}
              name="Base UI"
              needs="Your shadcn project, as it is"
              status="Stable, the default"
            />
            <Foundation
              className="home-col-ui-sdk"
              library={`@ui-sdk/react ${uiSdkVersion}, pinned`}
              name="UI SDK"
              needs="React 19, and one CSS layer line"
              status="Beta, from Vercel Labs"
            />
          </div>

          <Link className={`${QUIET_LINK} mt-10`} href="/docs/installation#choose-a-flavour">
            How to choose
            <ArrowRightIcon aria-hidden="true" className="size-3.5" />
          </Link>
        </div>
      </section>

      {/* 3 — The three sizes, as an index: a name, a line, a way in. */}
      <section aria-labelledby="tiers-title">
        <div className={SECTION}>
          <header className="flex flex-col items-center text-center">
            <h2 className={H2} id="tiers-title">
              Parts. Patterns. <span className={MUTED}>Pages.</span>
            </h2>
            <p className={`${LEAD} mt-5 max-w-[32rem]`}>All of it installs with the shadcn CLI you already use.</p>
          </header>

          <div className="mx-auto mt-16 max-w-[60rem] sm:mt-20">
            <Tier
              href="/docs/components"
              id="primitives"
              linkLabel={`Browse ${primitiveCount} primitives`}
              line="From a button to a date picker, in both foundations."
              terms={`${primitiveCount} · free, MIT`}
              title="Primitives"
            />
            <Tier
              href="/components"
              id="components"
              linkLabel={`Browse ${componentLabel} components`}
              line="The primitives, composed into screens you can copy."
              terms={`${componentLabel} · free, MIT`}
              title="Components"
            />
            <Tier
              extra={
                <Link className={`${QUIET_LINK} text-muted-foreground`} href="/pro">
                  <span className="tabular-nums">{`Get Pro for ${PRO_LAUNCH}, once`}</span>
                </Link>
              }
              href="/blocks"
              id="blocks"
              linkLabel="Browse blocks"
              line="Whole sections and pages. Built on Base UI only."
              terms={`Pro · ${catalog.blockCount} ${catalog.blockCount === 1 ? "block" : "blocks"}`}
              title="Blocks"
            />
          </div>
        </div>
      </section>

      {/* 4 — Why it is safe to adopt: three things the repo can back. */}
      <section aria-labelledby="adopt-title">
        <div className={SECTION}>
          <header className="flex flex-col items-center text-center">
            <h2 className={H2} id="adopt-title">
              Already speaks <span className="whitespace-nowrap">shadcn/ui.</span>
            </h2>
          </header>
          <ul className="mx-auto mt-16 grid max-w-[60rem] grid-cols-1 gap-x-12 gap-y-12 sm:mt-20 lg:grid-cols-3">
            <Fact title="The source is yours.">
              Every primitive lands as a file in your project. No package to upgrade around.
            </Fact>
            <Fact link={{ href: "/docs/theming", label: "Theming" }} title="Your theme carries over.">
              The same CSS variables, the same <code className={CODE}>@/components/ui</code> imports, the same CLI.
            </Fact>
            <Fact title="Tested on both.">
              Every primitive has its own tests, run once on Base UI and once on UI SDK.
            </Fact>
          </ul>
        </div>
      </section>

      {/* 5 — The way in. Inset like the footer below it, so the page ends on two framed surfaces, not a band. */}
      <section aria-labelledby="start-title" className="mx-3 rounded-3xl bg-surface-tray sm:mx-4">
        <div className={`${SECTION} flex flex-col items-center text-center`}>
          <h2 className={H2} id="start-title">
            Two commands. <span className={MUTED}>Then it&apos;s yours.</span>
          </h2>
          <ol className="mt-12 grid w-full max-w-[40rem] grid-cols-1 gap-6 text-left">
            <li className="flex flex-col gap-2.5">
              <span className="text-sm font-medium">Set up shadcn on Base UI</span>
              <InstallCommand
                commands={packageManagerCommands((pm) => `${PACKAGE_MANAGER_RUNNERS[pm]} shadcn@latest init --base base`)}
                label="init command"
                wrap
              />
            </li>
            <li className="flex flex-col gap-2.5">
              <span className="text-sm font-medium">Add primitives</span>
              <InstallCommand label="add command" wrap {...flavouredCommands("button dialog", "--overwrite")} />
              <span className="flavour-only-ui-sdk text-[0.8125rem] leading-relaxed text-muted-foreground">
                On UI SDK, also add <code className={CODE}>@layer ui-sdk;</code> above your Tailwind import.{" "}
                <Link className="underline underline-offset-4 hover:text-foreground focus-visible:focus-ring" href="/docs/installation#set-up-a-ui-sdk-project">
                  UI SDK setup
                </Link>
              </span>
            </li>
          </ol>
          <div className="mt-12 flex flex-wrap justify-center gap-x-8 gap-y-3">
            <Link className={QUIET_LINK} href="/docs/installation">
              Installation guide
              <ArrowRightIcon aria-hidden="true" className="size-3.5" />
            </Link>
            <Link className={QUIET_LINK} href="/docs">
              Read the docs
            </Link>
          </div>
        </div>
      </section>
      <RootUrlTags />
      <JsonLd route="/" />
    </main>
  );
}

function Foundation({
  name,
  status,
  library,
  needs,
  className,
}: {
  name: string;
  status: string;
  library: string;
  needs: string;
  className: string;
}) {
  return (
    <div className={`${className} flex flex-col gap-1 rounded-2xl px-7 py-6 text-muted-foreground`}>
      <h3 className="text-xl font-[510] tracking-[-0.015em]">{name}</h3>
      <p className="text-[0.9375rem]">{status}</p>
      <p className="mt-3 font-mono text-[0.8125rem] tabular-nums">{library}</p>
      <p className="text-[0.8125rem]">{needs}</p>
    </div>
  );
}

function Tier({
  id,
  title,
  terms,
  line,
  href,
  linkLabel,
  extra,
}: {
  id: string;
  title: string;
  terms: string;
  line: string;
  href: string;
  linkLabel: string;
  extra?: ReactNode;
}) {
  return (
    <div
      className="grid grid-cols-1 gap-x-10 gap-y-3 border-t border-hairline py-8 last:border-b sm:py-10 lg:grid-cols-[13rem_minmax(0,1fr)_auto] lg:items-baseline"
      data-tier={id}
    >
      <h3 className="text-[1.75rem] leading-tight font-[510] tracking-[-0.022em] sm:text-[2rem]">{title}</h3>
      <div className="flex flex-col gap-1">
        <p className="text-base text-pretty sm:text-[1.0625rem]">{line}</p>
        <p className="text-sm text-muted-foreground tabular-nums">{terms}</p>
      </div>
      <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2 lg:mt-0 lg:flex-col lg:items-end">
        <Link className={QUIET_LINK} href={href}>
          {linkLabel}
          <ArrowRightIcon aria-hidden="true" className="size-3.5" />
        </Link>
        {extra}
      </div>
    </div>
  );
}

function Fact({ title, link, children }: { title: string; link?: { href: string; label: string }; children: ReactNode }) {
  return (
    <li className="flex flex-col">
      <h3 className="text-lg font-[510] tracking-[-0.01em]">{title}</h3>
      <p className="mt-2 max-w-[40ch] text-[0.9375rem] leading-relaxed text-pretty text-muted-foreground">{children}</p>
      {link && (
        <Link className={`${QUIET_LINK} mt-3 text-sm`} href={link.href}>
          {link.label}
        </Link>
      )}
    </li>
  );
}
