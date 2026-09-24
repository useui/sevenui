"use client";

import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { Switch } from "@/registry/base/ui/switch";
import { packageManagerCommands } from "../../lib/package-manager";
import { installCommand } from "../../lib/registry";
import { cx } from "../../lib/cx";
import { InstallCommand } from "./install-command";
import type { PartInfo } from "./registry-data";

type InspectState = {
  /** null until hydrated: tags then show from md up only, so phones open on the clean screen. */
  on: boolean | null;
  selected: string;
  scanKey: number;
  order: string[];
  select: (name: string) => void;
};

const InspectContext = React.createContext<InspectState | null>(null);

function useInspect() {
  const ctx = React.useContext(InspectContext);
  if (!ctx) throw new Error("Part must be rendered inside <InspectFrame>");
  return ctx;
}

/** One primitive in the demo screen: outlined and tagged while inspect is on; the tag selects it. */
export function Part({
  name,
  tag = true,
  side = "start",
  className,
  children,
}: {
  name: string;
  tag?: boolean;
  side?: "start" | "end";
  className?: string;
  children: React.ReactNode;
}) {
  const { on, selected, select, scanKey, order } = useInspect();
  const visible = on ?? true;
  const active = visible && selected === name;
  const index = Math.max(0, order.indexOf(name));

  return (
    <div
      className={cx(
        "relative rounded-[inherit] outline-offset-[3px] transition-[outline-color] duration-200",
        visible && "outline-1 outline-dashed outline-foreground/35",
        active && "outline-solid outline-foreground",
        on === null && "max-md:outline-transparent",
        className,
      )}
      data-part={name}
    >
      {children}
      {visible && tag ? (
        <button
          aria-pressed={active}
          className={cx(
            scanKey > 0 && "sv-tag",
            on === null && "max-md:hidden",
            "absolute -top-[3px] z-20 inline-flex h-[18px] -translate-y-full items-center rounded-[4px] border px-1.5 font-mono text-[10.5px] leading-none whitespace-nowrap transition-colors",
            "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring",
            side === "start" ? "-left-[3px]" : "-right-[3px]",
            active
              ? "border-foreground bg-foreground text-background"
              : "border-foreground/25 bg-background text-foreground hover:border-foreground/60",
          )}
          key={scanKey}
          onClick={() => select(name)}
          style={{ "--sv-i": index } as React.CSSProperties}
          type="button"
        >
          {name}
        </button>
      ) : null}
    </div>
  );
}

export function InspectFrame({
  parts,
  initialSelected,
  address,
  children,
}: {
  parts: PartInfo[];
  initialSelected: string;
  address: string;
  children: React.ReactNode;
}) {
  const [on, setOn] = React.useState<boolean | null>(null);
  const [selected, setSelected] = React.useState(initialSelected);
  const [scanKey, setScanKey] = React.useState(0);
  const switchId = React.useId();
  const order = React.useMemo(() => parts.map((part) => part.name), [parts]);
  const current = parts.find((part) => part.name === selected) ?? parts[0];

  React.useEffect(() => {
    setOn(window.matchMedia("(min-width: 768px)").matches);
  }, []);

  const state = React.useMemo<InspectState>(
    () => ({ on, selected, scanKey, order, select: setSelected }),
    [on, selected, scanKey, order],
  );

  return (
    <InspectContext.Provider value={state}>
      <figure
        aria-label={`A billing settings screen built from ${parts.length} SevenUI primitives`}
        className="overflow-hidden rounded-xl border border-border bg-background shadow-[0_1px_2px_color-mix(in_oklab,var(--foreground)_5%,transparent),0_32px_64px_-32px_color-mix(in_oklab,var(--foreground)_28%,transparent)] dark:shadow-none"
      >
        <div className="flex h-11 items-center gap-3 border-b border-border bg-muted/40 px-3 sm:px-4">
          <span className="min-w-0 truncate font-mono text-xs text-muted-foreground">{address}</span>
          <span className="ms-auto hidden shrink-0 text-xs text-muted-foreground tabular-nums sm:inline">
            {parts.length} primitives tagged
          </span>
          <label
            className="flex shrink-0 cursor-pointer items-center gap-2 rounded-md py-1 ps-2 text-xs font-medium max-sm:ms-auto"
            htmlFor={switchId}
          >
            Inspect
            <Switch
              checked={on ?? true}
              id={switchId}
              onCheckedChange={(next) => {
                setOn(next);
                if (next) setScanKey((key) => key + 1);
              }}
            />
          </label>
        </div>

        <div className="relative">
          {children}
          {on && scanKey > 0 ? <span aria-hidden="true" className="sv-scanline" key={scanKey} /> : null}
        </div>

        <div
          aria-live="polite"
          className="grid grid-cols-1 gap-3 border-t border-border bg-muted/40 px-4 py-3.5 sm:px-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,29rem)] lg:items-center lg:gap-8"
        >
          {on === false ? (
            <p className="text-sm text-muted-foreground lg:col-span-2">
              Inspect is off: this is the screen as your users would see it. Turn it on to name every part.
            </p>
          ) : (
            <>
              <p className="min-w-0 text-sm leading-snug text-pretty">
                <span className="font-medium text-foreground">{current.title}.</span>{" "}
                <span className="text-muted-foreground">{current.description}</span>{" "}
                <Link
                  className="inline-flex items-center gap-1 font-medium whitespace-nowrap text-foreground underline decoration-foreground/30 underline-offset-4 hover:decoration-foreground"
                  href={`/docs/components/${current.name}`}
                >
                  Docs
                  <ArrowRightIcon aria-hidden="true" className="size-3.5" />
                </Link>
              </p>
              <InstallCommand
                commands={packageManagerCommands((pm) => installCommand(current.name, pm))}
                label={`${current.name} install command`}
              />
            </>
          )}
        </div>
      </figure>
    </InspectContext.Provider>
  );
}
