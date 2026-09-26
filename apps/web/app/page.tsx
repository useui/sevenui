import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { InstallCommand } from "../components/home/install-command";
import { Slogan } from "../components/home/slogan";
import {
  componentCount,
  loadCatalog,
  primitiveCount,
} from "../components/home/registry-data";
import { JsonLd } from "../components/json-ld";
import { Story } from "../components/home/pull-back/story";
import { getNavTree, resolvePrimitivesHref } from "../lib/docs/nav";
import { pageMetadata, RootUrlTags } from "../lib/metadata";
import { requirePageMeta } from "../lib/page-meta";
import { packageManagerCommands } from "../lib/package-manager";
import { installCommand } from "../lib/registry";
import { buttonVariants } from "@/registry/base/ui/button";
import { PRO_LAUNCH } from "../lib/pro-pricing";

// The Pro manifest is read at render time; match its 300 s ISR window.
export const revalidate = 300;

const buttonCommands = packageManagerCommands((pm) =>
  installCommand("button", pm),
);

const SECTION = "l-row px-6 py-20 sm:px-8 sm:py-28";
const H2 =
  "text-3xl font-semibold tracking-[-0.035em] text-balance sm:text-[2.5rem] sm:leading-[1.1]";
const LEAD = "leading-relaxed text-pretty text-muted-foreground";
const QUIET_LINK =
  "inline-flex items-center gap-1.5 text-sm font-medium text-foreground underline decoration-foreground/30 underline-offset-[5px] transition-colors hover:decoration-foreground";

export async function generateMetadata(): Promise<Metadata> {
  const meta = await requirePageMeta("/", "app/page.tsx");
  return pageMetadata("/", meta.title, meta.description);
}

export default async function Home() {
  const primitivesHref = resolvePrimitivesHref(await getNavTree());
  if (!primitivesHref) {
    throw new Error(
      "app/page.tsx: nav tree has no Primitives group with a resolvable href",
    );
  }

  const catalog = await loadCatalog();

  const sizes = [
    {
      name: "Primitive",
      terms: `${primitiveCount} · free, MIT`,
      commands: packageManagerCommands((pm) => installCommand("switch", pm)),
      href: "/docs/components/switch",
      linkLabel: "Switch docs",
    },
    {
      name: "Component",
      terms: `${componentCount} · free`,
      commands: packageManagerCommands((pm) => installCommand("component/switch-12", pm)),
      href: "/components",
      linkLabel: "Browse components",
    },
    {
      name: "Block",
      terms: `${catalog.blockCount} · Pro`,
      commands: packageManagerCommands((pm) => installCommand("pro/account-02", pm)),
      href: "/blocks",
      linkLabel: "Browse Blocks",
    },
  ];

  const doors = [
    { href: "/docs", label: "Read the installation guide", note: "Two minutes, one command" },
    { href: primitivesHref, label: "Browse the primitives", note: `${primitiveCount} single parts` },
    { href: "/components", label: "Browse free components", note: `${componentCount} composed examples` },
    { href: "/blocks", label: "See Pro Blocks", note: `${catalog.blockCount} finished sections and pages` },
  ];

  return (
    <main className="sv-page" id="content">
      {/* Hero: what it is, the slogan, one sentence, one command. */}
      <section aria-labelledby="home-title" className="border-b border-border">
        <div className="l-row px-6 pt-20 pb-16 sm:px-8 sm:pt-28 sm:pb-24">
          <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
            {/* The heading says what the site is; the animated slogan below is display type, kept out of the
                heading so its rolling words don't become part of the page's title text. */}
            <h1 className="text-sm font-medium text-muted-foreground sm:text-base" id="home-title">
              Base UI components for shadcn/ui
            </h1>
            <p className="mt-4 text-[clamp(2.75rem,7vw,4.75rem)] leading-[1.02] font-semibold tracking-[-0.045em] text-balance">
              <Slogan />
            </p>
            <p className={`${LEAD} mt-6 max-w-[48ch] text-lg sm:text-xl`}>
              <span className="tabular-nums">{primitiveCount}</span> accessible React primitives built on
              Base UI, composed into <span className="tabular-nums">{componentCount}</span> free components
              and <span className="tabular-nums">{catalog.blockCount}</span> Pro Blocks. The shadcn CLI copies
              the source into your repo.
            </p>
            <div className="mt-10 flex w-full max-w-[40rem] flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <InstallCommand
                className="min-w-0 flex-1 text-left"
                commands={buttonCommands}
                label="button install command"
              />
              <Link
                className={buttonVariants({
                  size: "lg",
                  className: "h-11 shrink-0 px-5",
                })}
                href="/docs"
              >
                Get started
                <ArrowRightIcon aria-hidden="true" data-icon="inline-end" />
              </Link>
            </div>
            <Link className={`${QUIET_LINK} mt-6 text-muted-foreground`} href="/pro">
              <span className="tabular-nums">
                {`${catalog.blockCount} Pro Blocks, ${PRO_LAUNCH} once`}
              </span>
              <ArrowRightIcon aria-hidden="true" className="size-3.5" />
            </Link>
          </div>
        </div>
      </section>

      <Story
        blockCount={catalog.blockCount}
        categoryCount={catalog.categoryCount}
        componentCount={componentCount}
        primitiveCount={primitiveCount}
        primitivesHref={primitivesHref}
      />

      <section aria-labelledby="commands-title" className="border-b border-border">
        <div className={SECTION}>
          <h2 className={H2} id="commands-title">
            Same command at every size.
          </h2>
          <p className={`${LEAD} mt-4 max-w-[52ch]`}>
            A switch, a card, or a whole page. Each one arrives through the shadcn CLI as source in your repo,
            styled by the theme you already have.
          </p>
          <ul className="mt-10 divide-y divide-border border-y border-border">
            {sizes.map((size) => (
              <li
                className="grid grid-cols-1 gap-x-6 gap-y-3 py-5 md:grid-cols-[11rem_minmax(0,1fr)_auto] md:items-center"
                key={size.name}
              >
                <span className="font-semibold">
                  {size.name}
                  <span className="block text-[0.8125rem] font-normal text-muted-foreground">{size.terms}</span>
                </span>
                <InstallCommand className="min-w-0" commands={size.commands} label={`${size.name} install command`} />
                <Link className={QUIET_LINK} href={size.href}>
                  {size.linkLabel}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="start-title" className="border-b border-border">
        <div className={SECTION}>
          <h2 className={H2} id="start-title">
            Start at any size.
          </h2>
          <ul className="mt-10 divide-y divide-border border-y border-border">
            {doors.map((door) => (
              <li key={door.href}>
                <Link
                  className="group flex justify-between gap-4 py-5 text-lg font-medium focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
                  href={door.href}
                >
                  <span className="group-hover:underline group-hover:underline-offset-4">{door.label}</span>
                  <span className="text-right text-[0.9375rem] font-normal text-muted-foreground">{door.note}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <RootUrlTags />
      <JsonLd route="/" />
    </main>
  );
}
