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

const uiCount = registry.items.filter((item) => item.type === "registry:ui").length;

const initCommands = packageManagerCommands((pm) => `${PACKAGE_MANAGER_RUNNERS[pm]} shadcn@latest init`);
const buttonCommands = packageManagerCommands((pm) => installCommand("button", pm));

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

export async function generateMetadata(): Promise<Metadata> {
  const meta = await requirePageMeta("/", "app/page.tsx");
  return pageMetadata("/", meta.title, meta.description);
}

export default async function Home() {
  const primitivesHref = resolvePrimitivesHref(await getNavTree());
  if (!primitivesHref) {
    throw new Error("app/page.tsx: nav tree has no Primitives group with a resolvable href");
  }

  return (
    <main id="content">
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
      <RootUrlTags />
      <JsonLd route="/" />
    </main>
  );
}
