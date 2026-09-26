import Link from "next/link";
import { InstallCommand } from "../install-command";
import { packageManagerCommands } from "../../../lib/package-manager";
import { PRO_LAUNCH } from "../../../lib/pro-pricing";
import { installCommand } from "../../../lib/registry";
import { ScaleFallback } from "./scale-fallback";
import { Stage } from "./stage";

const H2 = "text-3xl font-semibold tracking-[-0.035em] text-balance sm:text-[2.5rem] sm:leading-[1.1]";
const LEAD = "leading-relaxed text-pretty text-muted-foreground";
const QUIET_LINK =
  "inline-flex items-center gap-1.5 text-sm font-medium text-foreground underline decoration-foreground/30 underline-offset-[5px] transition-colors hover:decoration-foreground";

const commandsFor = (item: string) => packageManagerCommands((pm) => installCommand(item, pm));

export function Story({
  primitiveCount,
  componentCount,
  blockCount,
  categoryCount,
  primitivesHref,
}: {
  primitiveCount: number;
  componentCount: number;
  blockCount: number;
  categoryCount: number;
  primitivesHref: string;
}) {
  const steps = [
    {
      tier: "Primitive · free, MIT",
      title: "Primitive: the switch",
      body: (
        <>
          One file, <code>switch.tsx</code>. Base UI keeps the behavior: the switch role, focus and keyboard.
          You keep the markup and the styles, on the shadcn/ui variables you already have. Flip the Email
          switch; it stays live all the way out.
        </>
      ),
      item: "switch",
      links: [{ href: primitivesHref, label: `Browse all ${primitiveCount} primitives` }],
    },
    {
      tier: "Component · free",
      title: "Component: the public profile card",
      body: (
        <>
          Card, Avatar, Label and Switch, composed into a card that decides what a public profile shows. If
          you turned Email on, it is in the preview now. Copy the component and change it however you like.
        </>
      ),
      item: "component/switch-12",
      links: [{ href: "/components", label: `Browse ${componentCount} free components` }],
    },
    {
      tier: "Block · Pro",
      title: "Block: the account page",
      body: (
        <>
          The same card inside a finished page, with navigation, profile, sessions and a danger zone.{" "}
          {blockCount} Pro Blocks across {categoryCount} categories, installed with the same CLI as the switch.
        </>
      ),
      item: "pro/account-02",
      links: [
        { href: "/blocks/application/account#account-02", label: "Preview the real account block" },
        { href: "/blocks", label: `See all ${blockCount} Pro Blocks` },
        { href: "/pro", label: `Get Pro for ${PRO_LAUNCH}, once` },
      ],
    },
  ];

  return (
    <section aria-labelledby="story-title" className="border-b border-border">
      <div className="l-row px-6 pt-20 sm:px-8 sm:pt-28">
        <div className="grid grid-cols-1 gap-x-16 gap-y-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:items-end">
          <h2 className={H2} id="story-title">
            One registry, three sizes.
          </h2>
          <p className={`${LEAD} max-w-[52ch]`}>
            Follow one switch outward. On its own it is a Primitive. Inside a card it is part of a Component. In
            a finished account page it is part of a Pro Block. The code is the same at every size.
          </p>
        </div>

        <div className="pb-story-grid mt-10 pb-10">
          <div className="pb-stage-col">
            <Stage />
          </div>
          <ol className="pb-steps">
            {steps.map((step, index) => (
              <li className="pb-step" data-step={index + 1} key={step.title}>
                <span className="text-[0.8125rem] font-medium text-muted-foreground">{step.tier}</span>
                <h3 className="mt-1.5 text-2xl font-semibold tracking-[-0.025em]">{step.title}</h3>
                <p className={`${LEAD} mt-3 max-w-[46ch]`}>{step.body}</p>
                <InstallCommand
                  className="mt-5 max-w-[30rem]"
                  commands={commandsFor(step.item)}
                  label={`${step.item} install command`}
                />
                <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
                  {step.links.map((link) => (
                    <Link className={QUIET_LINK} href={link.href} key={link.href}>
                      {link.label}
                    </Link>
                  ))}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
      <ScaleFallback />
    </section>
  );
}
