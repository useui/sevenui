import type { ReactNode } from "react";

const CELLS = [
  { theme: "dark", density: "comfortable" },
  { theme: "dark", density: "compact" },
  { theme: "light", density: "comfortable" },
  { theme: "light", density: "compact" },
] as const;

/** Renders its children four times: dark/light x comfortable/compact. */
export function LabFrame({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      {CELLS.map(({ theme, density }) => (
        <div
          key={`${theme}-${density}`}
          data-theme={theme}
          data-density={density}
          data-lab-cell={`${theme}-${density}`}
          className="bg-background text-foreground rounded-lg border p-6"
        >
          <p className="text-muted-foreground mb-4 font-mono text-xs">
            {theme} / {density}
          </p>
          {children}
        </div>
      ))}
    </div>
  );
}

/** A labelled row of states inside a matrix. */
export function LabSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-6 last:mb-0">
      <h3 className="text-muted-foreground mb-2 font-mono text-xs">{title}</h3>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </section>
  );
}
