import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { InstallCommand } from "../components/home/install-command";
import { Slogan } from "../components/home/slogan";
import {
  componentCount,
  loadCatalog,
  primitiveCount,
  sourceOf,
} from "../components/home/registry-data";
import { JsonLd } from "../components/json-ld";
import { CodeFile } from "../components/pro/code-file";
import { getNavTree, resolvePrimitivesHref } from "../lib/docs/nav";
import { pageMetadata, RootUrlTags } from "../lib/metadata";
import { requirePageMeta } from "../lib/page-meta";
import { highlightLines } from "../lib/shiki";
import { packageManagerCommands } from "../lib/package-manager";
import { installCommand } from "../lib/registry";
import { buttonVariants } from "@/registry/base/ui/button";

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

  const tiers = [
    {
      count: primitiveCount,
      name: "Primitives",
      body: "Single parts, one file each. Behavior from Base UI, styling on the shadcn/ui CSS variables you already have.",
      terms: "Free · MIT",
      href: primitivesHref,
    },
    {
      count: componentCount,
      name: "Components",
      body: "Primitives composed into real interface: cards, forms, settings. Copy one and adapt it.",
      terms: "Free",
      href: "/components",
    },
    {
      count: catalog.blockCount,
      name: "Blocks",
      body: `Finished sections and pages across ${catalog.categoryCount} categories, installed with the same CLI.`,
      terms: "Pro · $99 once",
      href: "/blocks",
    },
  ];

  return (
    <main className="sv-page" id="content">
      {/* Hero: the slogan, one sentence, one command. */}
      <section aria-labelledby="home-title" className="border-b border-border">
        <div className="l-row px-6 pt-20 pb-16 sm:px-8 sm:pt-28 sm:pb-24">
          <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
            <h1
              className="text-[clamp(2.75rem,7vw,4.75rem)] leading-[1.02] font-semibold tracking-[-0.045em] text-balance"
              id="home-title"
            >
              <Slogan />
            </h1>
            <p className={`${LEAD} mt-6 max-w-[48ch] text-lg sm:text-xl`}>
              <span className="tabular-nums">{primitiveCount}</span> accessible
              React primitives built on Base UI. The shadcn CLI copies the
              source into your repo, and from there it&apos;s yours.
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
                {`${catalog.blockCount} Pro Blocks, $99 once`}
              </span>
              <ArrowRightIcon aria-hidden="true" className="size-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* The three tiers, as one ruled list instead of a stats row. */}
      <section aria-labelledby="tiers-title" className="border-b border-border">
        <div className={SECTION}>
          <div className="grid grid-cols-1 gap-x-16 gap-y-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:items-end">
            <h2 className={H2} id="tiers-title">
              One registry, three sizes.
            </h2>
            <p className={`${LEAD} max-w-[52ch]`}>
              Start free with the parts and the assemblies. Go Pro when you want
              the finished page. Everything installs the same way and lands as
              source.
            </p>
          </div>

          <ul className="mt-12 divide-y divide-border border-y border-border sm:mt-16">
            {tiers.map((tier) => (
              <li key={tier.name}>
                <Link
                  className="group grid grid-cols-[4.5rem_minmax(0,1fr)] items-baseline gap-x-5 gap-y-2 py-7 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring sm:grid-cols-[8rem_minmax(0,1fr)_auto] sm:gap-x-8 sm:py-9"
                  href={tier.href}
                >
                  <span className="text-4xl font-semibold tracking-[-0.04em] tabular-nums sm:text-5xl">
                    {tier.count}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-lg font-semibold tracking-[-0.02em] group-hover:underline group-hover:decoration-foreground/40 group-hover:underline-offset-4 sm:text-xl">
                      {tier.name}
                    </span>
                    <span className="mt-1.5 block max-w-[56ch] text-[0.9375rem] leading-relaxed text-pretty text-muted-foreground">
                      {tier.body}
                    </span>
                  </span>
                  <span className="col-start-2 flex items-center gap-2 text-sm font-medium whitespace-nowrap sm:col-start-3">
                    {tier.terms}
                    <ArrowRightIcon
                      aria-hidden="true"
                      className="size-4 text-muted-foreground transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1 group-hover:text-foreground motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
                    />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Ownership: what the command actually does, shown with the real file. */}
      <section aria-labelledby="own-title" className="border-b border-border">
        <div
          className={`${SECTION} grid grid-cols-1 items-start gap-x-16 gap-y-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]`}
        >
          <div>
            <h2 className={H2} id="own-title">
              The file is yours.
            </h2>
            <dl className="mt-10 grid grid-cols-1 gap-8">
              <div>
                <dt className="font-semibold">Base UI handles behavior.</dt>
                <dd className={`${LEAD} mt-1.5 text-[0.9375rem]`}>
                  Focus, keyboard, ARIA and positioning come from Base UI. The
                  file only styles it.
                </dd>
              </div>
              <div>
                <dt className="font-semibold">The shadcn CLI delivers it.</dt>
                <dd className={`${LEAD} mt-1.5 text-[0.9375rem]`}>
                  @sevenui is in the shadcn registry index: nothing to
                  configure, and your existing theme applies unchanged.
                </dd>
              </div>
              <div>
                <dt className="font-semibold">Nothing to stay in sync with.</dt>
                <dd className={`${LEAD} mt-1.5 text-[0.9375rem]`}>
                  No SevenUI package joins your dependencies. Rename a prop,
                  delete a variant — there is no upstream.
                </dd>
              </div>
            </dl>
          </div>
          <CodeFile
            code={sourceOf("switch")}
            copyLabel="abridged switch source"
            html={await highlightLines(sourceOf("switch"), "tsx")}
            name="components/ui/switch.tsx"
          />
        </div>
      </section>
      <RootUrlTags />
      <JsonLd route="/" />
    </main>
  );
}
