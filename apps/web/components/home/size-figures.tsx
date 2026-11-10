import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import type { ReactNode } from "react";
import { LayerCard, LayerCardHeader, LayerCardPanel, LayerCardTitle } from "@/registry/base/ui/layer-card";
import { Switch } from "@/registry/base/ui/switch";
import { packageManagerCommands } from "../../lib/package-manager";
import { installCommand } from "../../lib/registry";
import { InstallCommand } from "./install-command";

export const CAPTION = "font-mono text-[0.6875rem] tracking-[0.04em] text-muted-foreground uppercase";

type Size = {
  fig: string;
  name: string;
  terms: string;
  body: string;
  item: string;
  href: string;
  linkLabel: string;
  render: ReactNode;
};

/** The three FIG cards under "One registry, three sizes": a real render, the terms, the command. */
export function SizeFigures({
  primitiveCount,
  componentLabel,
}: {
  primitiveCount: number;
  componentLabel: string;
}) {
  const sizes: Size[] = [
    {
      fig: "Fig 0.1",
      name: "Primitive",
      terms: `${primitiveCount} · free, MIT`,
      body: "Accessible building blocks on Base UI. Every state and every keyboard path, tested.",
      item: "switch",
      href: "/docs/components",
      linkLabel: `Browse ${primitiveCount} primitives`,
      render: <PrimitiveRender />,
    },
    {
      fig: "Fig 0.2",
      name: "Component",
      terms: `${componentLabel} · free, MIT`,
      body: "Copy-and-go compositions of the primitives, for the screens you build every week.",
      item: "component/switch-12",
      href: "/components",
      linkLabel: `Browse ${componentLabel} components`,
      render: <ComponentRender />,
    },
    {
      fig: "Fig 0.3",
      name: "Block",
      terms: "Pro",
      body: "Full sections and pages. Installed by you, or by your agent with a license key.",
      item: "pro/account-02",
      href: "/blocks",
      linkLabel: "Browse Pro blocks",
      render: <BlockRender />,
    },
  ];

  return (
    <ul className="mt-14 grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-8">
      {sizes.map((size) => (
        <li
          className="flex min-w-0 flex-col"
          data-size-card={size.name.toLowerCase()}
          key={size.name}
        >
          <p className={CAPTION}>
            {size.fig} — {size.name}
          </p>
          <div className="mt-5 grid h-44 place-items-center overflow-hidden rounded-3xl bg-surface-tray">
            {size.render}
          </div>
          <h3 className="mt-6 text-[0.9375rem] font-[510] tracking-[-0.01em]">{size.name}</h3>
          <p className="mt-0.5 text-[0.8125rem] text-muted-foreground tabular-nums">{size.terms}</p>
          <p className="mt-3 max-w-[34ch] text-sm leading-relaxed text-pretty text-muted-foreground">{size.body}</p>
          <InstallCommand
            className="mt-5"
            commands={packageManagerCommands((pm) => installCommand(size.item, pm))}
            label={`${size.name.toLowerCase()} install command`}
            wrap
          />
          <Link
            className="mt-4 inline-flex w-fit items-center gap-1.5 text-sm font-medium underline decoration-foreground/25 underline-offset-[5px] hover:decoration-foreground"
            href={size.href}
          >
            {size.linkLabel}
            <ArrowRightIcon aria-hidden="true" className="size-3.5" />
          </Link>
        </li>
      ))}
    </ul>
  );
}

function PrimitiveRender() {
  return (
    <div className="flex items-center gap-3 text-sm">
      <Switch aria-labelledby="fig-primitive-label" defaultChecked />
      <span id="fig-primitive-label">Email</span>
    </div>
  );
}

function ComponentRender({ idPrefix = "fig-component" }: { idPrefix?: string }) {
  return (
    <LayerCard className="w-[15.5rem]" size="xs">
      <LayerCardHeader>
        <LayerCardTitle className="text-[0.8125rem]">Notifications</LayerCardTitle>
      </LayerCardHeader>
      <LayerCardPanel className="flex flex-col gap-2.5 text-[0.8125rem]">
        <span className="flex items-center justify-between gap-3">
          <span id={`${idPrefix}-email`}>Email</span>
          <Switch aria-labelledby={`${idPrefix}-email`} defaultChecked size="sm" />
        </span>
        <span className="flex items-center justify-between gap-3">
          <span id={`${idPrefix}-updates`}>Product updates</span>
          <Switch aria-labelledby={`${idPrefix}-updates`} size="sm" />
        </span>
      </LayerCardPanel>
    </LayerCard>
  );
}

/** The same card inside a page, drawn at full size and scaled down. Decorative, so hidden and inert. */
function BlockRender() {
  return (
    <div aria-hidden="true" className="h-[8.75rem] w-[17.5rem]" inert>
      <div className="grid h-[17.5rem] w-[35rem] origin-top-left scale-50 grid-cols-[8.5rem_minmax(0,1fr)] overflow-hidden rounded-2xl border border-hairline-strong bg-surface-panel text-sm shadow-raised">
        <div className="flex flex-col gap-0.5 border-r border-hairline p-3 text-muted-foreground">
          <span className="mb-2 flex items-center gap-2 px-1 font-[510] text-foreground">
            <span className="grid size-5 place-items-center rounded-[6px] bg-foreground text-[0.6875rem] font-semibold text-background">
              A
            </span>
            Acme
          </span>
          {["Profile", "Notifications", "Security", "Billing"].map((label) => (
            <span
              className={
                label === "Notifications"
                  ? "rounded-md bg-surface-raised px-2 py-1 text-foreground shadow-[inset_0_0_0_1px_var(--hairline)]"
                  : "px-2 py-1"
              }
              key={label}
            >
              {label}
            </span>
          ))}
        </div>
        <div className="flex flex-col gap-3 p-5">
          <span>
            <span className="block text-lg font-[510] tracking-[-0.015em]">Notifications</span>
            <span className="text-[0.8125rem] text-muted-foreground">Choose what reaches you, and where.</span>
          </span>
          <ComponentRender idPrefix="fig-block" />
          <span className="flex justify-end gap-2">
            <span className="rounded-lg border border-hairline-strong px-3 py-1.5 text-[0.8125rem]">Cancel</span>
            <span className="rounded-lg bg-primary px-3 py-1.5 text-[0.8125rem] text-primary-foreground">Save</span>
          </span>
        </div>
      </div>
    </div>
  );
}
