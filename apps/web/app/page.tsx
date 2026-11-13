import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { InstallCommand } from "../components/home/install-command";
import { ProductFrame } from "../components/home/product-frame";
import { componentCount, primitiveCount } from "../components/home/registry-data";
import { CAPTION, SizeFigures } from "../components/home/size-figures";
import { JsonLd } from "../components/json-ld";
import { pageMetadata, RootUrlTags } from "../lib/metadata";
import { requirePageMeta } from "../lib/page-meta";
import { packageManagerCommands } from "../lib/package-manager";
import { PRO_LAUNCH } from "../lib/pro-pricing";
import { installCommand } from "../lib/registry";
import { buttonVariants } from "@/registry/base/ui/button";

// The home stays on the site's 300 s ISR window, like /blocks and /pro.
export const revalidate = 300;

const buttonCommands = packageManagerCommands((pm) => installCommand("button", pm));

/** "900+": the free component count, rounded down to the hundred so the copy does not churn. */
const componentLabel = `${Math.floor(componentCount / 100) * 100}+`;

const ROW = "l-row px-6 sm:px-8";
// The D display type: big, light, tight. The second clause is muted.
const DISPLAY = "font-[510] tracking-[-0.022em] text-balance";
const MUTED = "text-muted-foreground";
const QUIET_LINK =
  "inline-flex w-fit items-center gap-1.5 text-sm font-medium underline decoration-foreground/25 underline-offset-[5px] hover:decoration-foreground";

const AGENT_LEVELS = [
  {
    fig: "Level 1 — Set up",
    title: "Set up the project",
    body: (
      <>
        <code>shadcn init --base base</code>, then add with <code>--overwrite</code>, so a non-interactive shell
        never stalls on a prompt.
      </>
    ),
    href: "/docs/installation",
    label: "Installation guide",
  },
  {
    fig: "Level 2 — Choose",
    title: "Choose the right part",
    body: (
      <>
        <code>/llms.txt</code> lists every primitive, component and block with its page, so an agent reads the
        index instead of guessing names.
      </>
    ),
    href: "/llms.txt",
    label: "Read llms.txt",
  },
  {
    fig: "Level 3 — Compose",
    title: "Compose a page",
    body: <>Components and blocks are working compositions. An agent starts from one and edits it to fit.</>,
    href: "/components",
    label: "Browse components",
  },
];

export async function generateMetadata(): Promise<Metadata> {
  const meta = await requirePageMeta("/", "app/page.tsx");
  return pageMetadata("/", meta.title, meta.description);
}

export default function Home() {
  return (
    <main className="sv-page" id="content">
      <section aria-labelledby="home-title">
        <div className={`${ROW} pt-16 pb-12 sm:pt-24 sm:pb-16`}>
          <Link
            className="inline-flex max-w-full items-center gap-2 rounded-full bg-surface-tray py-1 pr-3 pl-1 text-[0.8125rem] text-foreground/85 hover:text-foreground"
            href="/docs"
          >
            <span className="rounded-full bg-surface-raised px-2 py-0.5 text-[0.6875rem] font-medium text-foreground shadow-docs-panel">
              v2
            </span>
            <span className="truncate">Base UI and UI SDK components for shadcn/ui</span>
            <ArrowRightIcon aria-hidden="true" className="size-3.5 shrink-0 text-muted-foreground" />
          </Link>

          <h1
            className={`${DISPLAY} mt-7 max-w-[13ch] text-[2.625rem] leading-[1.04] sm:max-w-[16ch] sm:text-[3.5rem] sm:leading-[1.02] lg:max-w-[21ch] lg:text-[4rem]`}
            id="home-title"
          >
            Interfaces your agents can build. <span className={MUTED}>Quality your users can feel.</span>
          </h1>

          <p className="mt-6 max-w-[34rem] text-base leading-relaxed text-pretty text-muted-foreground sm:text-[1.0625rem]">
            <span className="tabular-nums">{primitiveCount}</span> accessible primitives on Base UI or UI SDK, composed
            into <span className="tabular-nums">{componentLabel}</span> components and into Pro blocks built on Base
            UI. Copy the source, or let your agent assemble it.
          </p>

          <div className="mt-8 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center">
            <InstallCommand className="sm:w-[27.5rem]" commands={buttonCommands} label="button install command" />
            <div className="flex gap-2.5">
              <Link className={buttonVariants({ className: "h-10 flex-1 rounded-[10px] px-4 sm:flex-none" })} href="/components">
                Browse components
              </Link>
              <Link
                className={buttonVariants({
                  variant: "outline",
                  className: "h-10 flex-1 rounded-[10px] px-4 sm:flex-none",
                })}
                href="/docs/installation"
              >
                Connect your agent
              </Link>
            </div>
          </div>

          <p className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.8125rem] text-muted-foreground">
            <span className={CAPTION}>Works with</span>
            <span>Claude Code · Cursor · VS Code · Codex</span>
            <a className="underline decoration-foreground/25 underline-offset-4 hover:text-foreground" href="/llms.txt">
              llms.txt
            </a>
          </p>
        </div>

        <div className={`${ROW} pb-20 sm:pb-28`}>
          <ProductFrame />
        </div>
      </section>

      <section aria-labelledby="sizes-title">
        <div className={`${ROW} py-16 sm:py-24`}>
          <div className={`${DISPLAY} max-w-[46rem] text-[1.75rem] leading-[1.15] sm:text-[2.25rem]`}>
            <h2 className="inline tracking-[inherit]" id="sizes-title">
              One registry, three sizes.
            </h2>{" "}
            <span className={MUTED}>
              A primitive is the switch. A component is the card it sits in. A block is the settings page around
              it. The code is the same at every size, and so is the command.
            </span>
          </div>
          <SizeFigures componentLabel={componentLabel} primitiveCount={primitiveCount} />
        </div>
      </section>

      <section aria-labelledby="agents-title">
        <div className={`${ROW} py-16 sm:py-24`}>
          <div className={`${DISPLAY} max-w-[46rem] text-[1.75rem] leading-[1.15] sm:text-[2.25rem]`}>
            <h2 className="inline tracking-[inherit]" id="agents-title">
              Built for teams and their agents.
            </h2>{" "}
            <span className={MUTED}>
              The registry is plain source and one command, so an agent uses it the way you do.
            </span>
          </div>
          <ol className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-3">
            {AGENT_LEVELS.map((level) => (
              <li
                className="flex flex-col rounded-3xl border border-docs-panel-edge bg-docs-panel p-6 shadow-docs-panel"
                key={level.fig}
              >
                <p className={CAPTION}>{level.fig}</p>
                <h3 className="mt-4 text-[0.9375rem] font-[510] tracking-[-0.01em]">{level.title}</h3>
                <p className="mt-2 max-w-[36ch] flex-1 text-sm leading-relaxed text-pretty text-muted-foreground [&_code]:font-mono [&_code]:text-[0.8125rem] [&_code]:whitespace-nowrap [&_code]:text-foreground/85">
                  {level.body}
                </p>
                {level.href.endsWith(".txt") ? (
                  <a className={`${QUIET_LINK} mt-5`} href={level.href}>
                    {level.label}
                  </a>
                ) : (
                  <Link className={`${QUIET_LINK} mt-5`} href={level.href}>
                    {level.label}
                  </Link>
                )}
              </li>
            ))}
          </ol>
          <p className={`${CAPTION} mt-8 leading-relaxed`}>
            React 19 · Base UI 1.7 or UI SDK beta · Tailwind CSS v4 · shadcn CLI
          </p>
        </div>
      </section>

      <section aria-labelledby="start-title">
        <div className={`${ROW} py-16 sm:py-24`}>
          <div className={`${DISPLAY} max-w-[40rem] text-[1.75rem] leading-[1.15] sm:text-[2.25rem]`}>
            <h2 className="inline tracking-[inherit]" id="start-title">
              Start with one command.
            </h2>{" "}
            <span className={MUTED}>Everything after it is your code.</span>
          </div>
          <InstallCommand className="mt-8 max-w-[26rem]" commands={buttonCommands} label="button install command" />
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3">
            <Link className={QUIET_LINK} href="/docs">
              Read the docs
            </Link>
            <Link className={QUIET_LINK} href="/blocks">
              Browse Pro blocks
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
