import { CodeFile } from "./code-file";

export const REGISTRY_SNIPPET = `"registries": {
  "@sevenui": {
    "url": "https://sevenui.dev/r/{name}.json",
    "headers": { "Authorization": "Bearer \${SEVENUI_PRO_KEY}" }
  }
}`;

export const EXAMPLE_BLOCK = "dashboard-01";

export type SetupSnippet = "env" | "registry" | "install";

/** The code each step shows, so a server caller can highlight exactly what the steps render. */
export function setupSnippets({ displayKey, block = EXAMPLE_BLOCK }: { displayKey?: string; block?: string } = {}) {
  return {
    env: { code: `SEVENUI_PRO_KEY=${displayKey ?? "<your key>"}`, lang: "dotenv" },
    registry: { code: REGISTRY_SNIPPET, lang: "json" },
    install: { code: `npx shadcn@latest add @sevenui/pro/${block}`, lang: "bash" },
  } as const satisfies Record<SetupSnippet, { code: string; lang: string }>;
}

/**
 * The three real setup steps for a Pro key. With `licenseKey`, the .env copy
 * carries the full key while the page only ever shows `displayKey`.
 */
export function SetupSteps({
  licenseKey,
  displayKey,
  block = EXAMPLE_BLOCK,
  headingLevel = "h3",
  highlighted,
}: {
  licenseKey?: string;
  displayKey?: string;
  block?: string;
  headingLevel?: "h2" | "h3";
  /** Server-highlighted HTML per snippet (see `setupSnippets`); the account page renders them plain. */
  highlighted?: Partial<Record<SetupSnippet, string>>;
}) {
  const Heading = headingLevel;
  const snippets = setupSnippets({ displayKey, block });
  const steps = [
    {
      title: "Put the key in your environment",
      body: "Add it to .env or your host's secret settings. Keep it out of committed files; anyone holding it installs as you.",
      file: (
        <CodeFile
          code={snippets.env.code}
          copyLabel={licenseKey ? ".env line with your full key" : ".env line"}
          copyValue={`SEVENUI_PRO_KEY=${licenseKey ?? "<your key>"}`}
          html={highlighted?.env}
          name=".env"
          note="never committed"
        />
      ),
    },
    {
      title: "Send the key with @sevenui",
      body: "Give the @sevenui registry an Authorization header in components.json, once. The CLI then sends your key with every @sevenui install, so set SEVENUI_PRO_KEY wherever you run it.",
      file: (
        <CodeFile
          code={snippets.registry.code}
          copyLabel="registry config"
          html={highlighted?.registry}
          name="components.json"
        />
      ),
    },
    {
      title: "Add any Block by name",
      body: "The same CLI as the free tiers. The source lands in your repo.",
      file: (
        <CodeFile code={snippets.install.code} copyLabel="install command" html={highlighted?.install} name="terminal" />
      ),
    },
  ];

  return (
    <ol className="flex flex-col gap-8">
      {steps.map((step, index) => (
        <li className="grid grid-cols-[1.75rem_minmax(0,1fr)] gap-x-3" key={step.title}>
          <span
            aria-hidden
            className="mt-px grid size-6 place-items-center rounded-full border border-border text-xs text-muted-foreground tabular-nums"
          >
            {index + 1}
          </span>
          <div className="min-w-0">
            <Heading className="text-[0.9375rem] font-medium tracking-[-0.01em]">
              <span className="sr-only">Step {index + 1}: </span>
              {step.title}
            </Heading>
            <p className="mt-1 text-sm leading-relaxed text-pretty text-muted-foreground">{step.body}</p>
            <div className="mt-3">{step.file}</div>
          </div>
        </li>
      ))}
    </ol>
  );
}
