# Layer Card Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship `layer-card`, a tray-and-panels primitive covering ReUI Frame and Kumo LayerCard plus six extensions, with tests, docs, demos and gallery Components.

**Architecture:** One registry source file (`layer-card.tsx`) with seven flat exports. Every visual mode is resolved in CSS through `data-slot` selectors and CSS variables set on the root: defaults sit in `:where()` at zero specificity, each `cva` dimension owns a disjoint set of variables, so no two classes ever compete for the same property at equal specificity. `render` on root, panel and title goes through Base UI `useRender` + `mergeProps`.

**Tech Stack:** React 19, Base UI 1.7 (`useRender`, `mergeProps`), Tailwind CSS 4.3, `class-variance-authority`, `cn`, Vitest + Testing Library (jsdom), Next.js docs site.

**Spec:** `docs/superpowers/specs/2026-10-23-layer-card-design.md`

## Global Constraints

- Base UI only; dependencies exactly `@base-ui/react@^1.7.0`, `class-variance-authority@^0.7.1`, `cn@^0.2.5` (check-registry enforces the ranges).
- No new CSS token; only shadcn tokens (`--muted`, `--card`, `--foreground`, `--destructive`, `--ring`, `--radius-xl`).
- Files kebab-case; all code, docs and copy in English.
- User-visible prose uses "primitive" for the installable unit, "component" for gallery compositions.
- Demo content: English names only, `/placeholder.svg` for images.
- **No commits.** The user asked for the work uncommitted on branch `feat/layer-card` in worktree `.claude/worktrees/feat-layer-card`. Every "commit" step of the usual template is replaced by a checkpoint run of the task's tests.

## Deviations from the spec found while planning

1. **`"use client"` is required.** Base UI's `useRender` calls `useMergedRefs` → `useRefWithInit` → `React.useRef`, which the `react-server` build does not export. The file therefore starts with `"use client"`. A Server Component can still render it (client boundary); what the spec really wanted, no context and no state, still holds. The test asserts the directive is present instead of absent. (Finding for later, not fixed here: `item`, `bubble`, `badge`, `breadcrumb`, `button-group`, `marker`, `attachment` also call `useRender` without the directive.)
2. **No narrow-width action wrap in the header.** The header would have to be its own size container and change its own grid columns, which a container query cannot do to its container. The header behaves like `CardHeader`.
3. **`dense` in horizontal orientation only removes the tray inset.** The edge-merging rules of vertical `dense` are vertical-only; documented on the docs page.

The spec is updated with these three points in Task 1.

## Review Focus

1. A consumer override `className="[--layer-card-radius:var(--radius-sm)]"` must win over the default → Task 1 test asserts the default lives in a `:where(&)` class and Task 5 checks it in the browser.
2. Radius preset `none` (`--radius: 0`, so `--radius-xl` = 4px) must give square panels, never a broken radius → Task 5 browser check; formula clamps with `max(0px, …)`.
3. A panel wrapped by another element (Collapsible) must still put the root in layered mode → gallery `layer-card-02` exercises it; Task 5 browser check.
4. A `LayerCardPanel fit` in horizontal orientation must keep its content width, not collapse to 0 → Task 1 test asserts `data-fit` and that the horizontal basis rule excludes `[data-fit]`.
5. A link panel must show a visible keyboard focus ring, including under `dense` (root clips with `overflow-hidden`) → Task 1 test asserts `ring-inset` under dense; Task 5 keyboard check.

---

### Task 1: The primitive and its tests

**Files:**
- Create: `packages/registry/registry/base/ui/layer-card.tsx`
- Create: `packages/registry/tests/layer-card.test.tsx`
- Modify: `packages/registry/registry.json` (append item after `questionnaire`)
- Modify: `docs/superpowers/specs/2026-10-23-layer-card-design.md` (the three deviations)

**Interfaces:**
- Produces: `LayerCard`, `LayerCardHeader`, `LayerCardTitle`, `LayerCardDescription`, `LayerCardAction`, `LayerCardPanel`, `LayerCardFooter`, `layerCardVariants` from `@/registry/base/ui/layer-card`.
  - `LayerCard`: `useRender.ComponentProps<"div"> & { variant?: "default" | "inverse" | "ghost"; size?: "xs" | "sm" | "default" | "lg"; orientation?: "vertical" | "horizontal"; stacked?: boolean; dense?: boolean; tone?: "default" | "destructive" }`
  - `LayerCardPanel`: `useRender.ComponentProps<"div"> & { fit?: boolean }`
  - `LayerCardTitle`: `useRender.ComponentProps<"div">`
  - Header, Description, Action, Footer: `React.ComponentProps<"div">`
  - Data slots: `layer-card`, `layer-card-header`, `layer-card-title`, `layer-card-description`, `layer-card-action`, `layer-card-panel`, `layer-card-footer`. Root also carries `data-variant`, `data-size`, `data-orientation`, `data-tone`, and `data-stacked` / `data-dense` only when true. Panel carries `data-fit` only when true.
  - Public CSS variables: `--layer-card-radius`, `--layer-card-panel-radius`.

- [ ] **Step 1: Write the failing test** — `packages/registry/tests/layer-card.test.tsx`

```tsx
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  LayerCard,
  LayerCardAction,
  LayerCardDescription,
  LayerCardFooter,
  LayerCardHeader,
  LayerCardPanel,
  LayerCardTitle,
  layerCardVariants,
} from "@/registry/base/ui/layer-card";

describe("LayerCard", () => {
  it("renders a div with data-slot and default state attributes", () => {
    render(<LayerCard data-testid="root">Content</LayerCard>);
    const root = screen.getByTestId("root");
    expect(root.tagName).toBe("DIV");
    expect(root.getAttribute("data-slot")).toBe("layer-card");
    expect(root.getAttribute("data-variant")).toBe("default");
    expect(root.getAttribute("data-size")).toBe("default");
    expect(root.getAttribute("data-orientation")).toBe("vertical");
    expect(root.getAttribute("data-tone")).toBe("default");
    expect(root.hasAttribute("data-stacked")).toBe(false);
    expect(root.hasAttribute("data-dense")).toBe(false);
  });

  it("reflects every prop as a data attribute", () => {
    render(
      <LayerCard
        data-testid="root"
        variant="inverse"
        size="lg"
        orientation="horizontal"
        tone="destructive"
        stacked
        dense
      />,
    );
    const root = screen.getByTestId("root");
    expect(root.getAttribute("data-variant")).toBe("inverse");
    expect(root.getAttribute("data-size")).toBe("lg");
    expect(root.getAttribute("data-orientation")).toBe("horizontal");
    expect(root.getAttribute("data-tone")).toBe("destructive");
    expect(root.hasAttribute("data-stacked")).toBe(true);
    expect(root.hasAttribute("data-dense")).toBe(true);
  });

  it("appends a custom className to the root", () => {
    render(<LayerCard data-testid="root" className="custom-root" />);
    const root = screen.getByTestId("root");
    expect(root.className).toContain("custom-root");
    expect(root.className).toContain("rounded-(--layer-card-radius)");
  });

  it("keeps its variable defaults at zero specificity so a className override wins", () => {
    render(<LayerCard data-testid="root" />);
    expect(screen.getByTestId("root").className).toContain(
      "[:where(&)]:[--layer-card-radius:var(--radius-xl)]",
    );
  });

  it("renders the root through the render prop", () => {
    render(<LayerCard render={<section />} data-testid="root" />);
    const root = screen.getByTestId("root");
    expect(root.tagName).toBe("SECTION");
    expect(root.getAttribute("data-slot")).toBe("layer-card");
  });

  it("composes all parts with their data-slot attributes", () => {
    render(
      <LayerCard>
        <LayerCardHeader data-testid="header">
          <LayerCardTitle>Subrequests</LayerCardTitle>
          <LayerCardDescription>Origins called.</LayerCardDescription>
          <LayerCardAction data-testid="action">Edit</LayerCardAction>
        </LayerCardHeader>
        <LayerCardPanel data-testid="panel">Body</LayerCardPanel>
        <LayerCardFooter data-testid="footer">Footer</LayerCardFooter>
      </LayerCard>,
    );
    const slot = (el: HTMLElement) => el.getAttribute("data-slot");
    expect(slot(screen.getByTestId("header"))).toBe("layer-card-header");
    expect(slot(screen.getByText("Subrequests"))).toBe("layer-card-title");
    expect(slot(screen.getByText("Origins called."))).toBe("layer-card-description");
    expect(slot(screen.getByTestId("action"))).toBe("layer-card-action");
    expect(slot(screen.getByTestId("panel"))).toBe("layer-card-panel");
    expect(slot(screen.getByTestId("footer"))).toBe("layer-card-footer");
  });

  it("merges className on every part", () => {
    render(
      <LayerCard>
        <LayerCardHeader className="c-header">
          <LayerCardTitle className="c-title">T</LayerCardTitle>
          <LayerCardDescription className="c-desc">D</LayerCardDescription>
          <LayerCardAction className="c-action">A</LayerCardAction>
        </LayerCardHeader>
        <LayerCardPanel className="c-panel">P</LayerCardPanel>
        <LayerCardFooter className="c-footer">F</LayerCardFooter>
      </LayerCard>,
    );
    for (const name of ["header", "title", "desc", "action", "panel", "footer"]) {
      expect(document.querySelector(`.c-${name}`)).not.toBeNull();
    }
  });

  it("renders the panel as a link that keeps href and data-slot", () => {
    render(
      <LayerCard>
        <LayerCardPanel render={<a href="/docs" />}>Docs</LayerCardPanel>
      </LayerCard>,
    );
    const link = screen.getByRole("link", { name: "Docs" });
    expect(link.getAttribute("href")).toBe("/docs");
    expect(link.getAttribute("data-slot")).toBe("layer-card-panel");
    expect(link.className).toContain("[a,button]:focus-visible:ring-3");
  });

  it("renders the title as a heading through the render prop", () => {
    render(
      <LayerCard>
        <LayerCardHeader>
          <LayerCardTitle render={<h3 />}>Usage</LayerCardTitle>
        </LayerCardHeader>
      </LayerCard>,
    );
    const heading = screen.getByRole("heading", { level: 3, name: "Usage" });
    expect(heading.getAttribute("data-slot")).toBe("layer-card-title");
  });

  it("grows by default and keeps content size with fit", () => {
    render(
      <LayerCard>
        <LayerCardPanel data-testid="grow">A</LayerCardPanel>
        <LayerCardPanel data-testid="fit" fit>
          B
        </LayerCardPanel>
      </LayerCard>,
    );
    expect(screen.getByTestId("grow").className).toContain("grow");
    expect(screen.getByTestId("grow").hasAttribute("data-fit")).toBe(false);
    expect(screen.getByTestId("fit").className).not.toMatch(/(^|\s)grow(\s|$)/);
    expect(screen.getByTestId("fit").hasAttribute("data-fit")).toBe(true);
  });

  it("excludes fit panels from the horizontal zero basis", () => {
    expect(layerCardVariants({ orientation: "horizontal" })).toContain(
      "[&>[data-slot=layer-card-panel]:not([data-fit])]:basis-0",
    );
  });

  it("insets the focus ring of panels under dense, where the root clips", () => {
    expect(layerCardVariants({ dense: true })).toContain(
      "[&>[data-slot=layer-card-panel]]:focus-visible:ring-inset",
    );
  });

  it("exports layerCardVariants as a callable class builder", () => {
    expect(typeof layerCardVariants()).toBe("string");
    expect(layerCardVariants({ variant: "ghost" })).toContain("border-0");
  });

  it("declares a client boundary, because useRender calls useRef", () => {
    const source = readFileSync(
      join(__dirname, "../registry/base/ui/layer-card.tsx"),
      "utf8",
    );
    expect(source.startsWith('"use client";')).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @sevenui/registry exec vitest run tests/layer-card.test.tsx`
Expected: FAIL — cannot resolve `@/registry/base/ui/layer-card`.

- [ ] **Step 3: Write the implementation** — `packages/registry/registry/base/ui/layer-card.tsx`

```tsx
"use client";

import * as React from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";

/**
 * The root owns every variable its parts read. Defaults sit in :where() at
 * zero specificity, so a variant or a consumer's own [--layer-card-*:…] class
 * overrides them without `!`. Each variant dimension writes a disjoint set of
 * variables, so no two classes compete for one property at equal specificity.
 */
const layerCardVariants = cva(
  [
    "group/layer-card relative flex min-w-0 rounded-(--layer-card-radius) bg-clip-padding p-(--layer-card-inset) text-sm text-card-foreground",
    "bg-[color:var(--layer-card-tone-bg,var(--layer-card-bg))] border-[color:var(--layer-card-tone-border,var(--layer-card-border-color))]",
    "[:where(&)]:[--layer-card-radius:var(--radius-xl)]",
    "[:where(&)]:[--layer-card-border-color:color-mix(in_oklch,var(--foreground)_10%,transparent)]",
    // Concentric: the panel is inset by the tray padding plus the tray border,
    // so subtracting exactly that keeps both arcs parallel. Clamped, because
    // the radius-none preset leaves --radius-xl at 4px.
    "[:where(&)]:[--layer-card-panel-radius:max(0px,calc(var(--layer-card-radius)_-_var(--layer-card-inset)_-_var(--layer-card-border-width)))]",
    // Bars left-align with panel content: panel padding plus its 1px border.
    "[:where(&)]:[--layer-card-bar-px:calc(var(--layer-card-panel-px)_+_1px)]",
    // Surface mode: no panel anywhere inside, so the root is the surface.
    "[&:not(:has([data-slot=layer-card-panel]))]:bg-[color:var(--layer-card-tone-bg,var(--layer-card-panel-bg))] [&:not(:has([data-slot=layer-card-panel]))]:px-(--layer-card-panel-px) [&:not(:has([data-slot=layer-card-panel]))]:py-(--layer-card-panel-py) [&:not(:has([data-slot=layer-card-panel]))]:shadow-xs",
  ],
  {
    variants: {
      variant: {
        default:
          "border [--layer-card-border-width:1px] [--layer-card-bg:color-mix(in_oklch,var(--muted)_50%,transparent)] [--layer-card-panel-bg:var(--card)]",
        inverse:
          "border [--layer-card-border-width:1px] [--layer-card-bg:var(--card)] [--layer-card-panel-bg:color-mix(in_oklch,var(--muted)_50%,transparent)]",
        ghost:
          "border-0 [--layer-card-border-width:0px] [--layer-card-bg:color-mix(in_oklch,var(--muted)_50%,transparent)] [--layer-card-panel-bg:var(--card)]",
      },
      // Bars read as chrome: their py is about half the panel's, px is equal.
      size: {
        xs: "[--layer-card-panel-px:--spacing(2)] [--layer-card-panel-py:--spacing(2)] [--layer-card-bar-py:--spacing(0.5)]",
        sm: "[--layer-card-panel-px:--spacing(3)] [--layer-card-panel-py:--spacing(3)] [--layer-card-bar-py:--spacing(1.5)]",
        default:
          "[--layer-card-panel-px:--spacing(4)] [--layer-card-panel-py:--spacing(4)] [--layer-card-bar-py:--spacing(2)]",
        lg: "[--layer-card-panel-px:--spacing(5)] [--layer-card-panel-py:--spacing(5)] [--layer-card-bar-py:--spacing(2.5)]",
      },
      orientation: {
        vertical: "flex-col",
        // Only horizontal becomes a size container: inline-size containment
        // collapses a root that sizes to its content.
        horizontal:
          "@container/layer-card flex-row flex-wrap [&>[data-slot=layer-card-header]]:basis-full [&>[data-slot=layer-card-footer]]:basis-full [&>[data-slot=layer-card-panel]:not([data-fit])]:basis-0 [&>[data-slot=layer-card-panel]]:@max-md/layer-card:basis-full",
      },
      stacked: {
        true: "gap-0",
        false: "gap-1",
      },
      dense: {
        true: "[--layer-card-inset:0px]",
        false: "[--layer-card-inset:--spacing(1)]",
      },
      tone: {
        default: "[--layer-card-tone-bg:initial] [--layer-card-tone-border:initial]",
        destructive:
          "[--layer-card-tone-bg:color-mix(in_oklch,var(--destructive)_6%,transparent)] dark:[--layer-card-tone-bg:color-mix(in_oklch,var(--destructive)_12%,transparent)] [--layer-card-tone-border:color-mix(in_oklch,var(--destructive)_30%,transparent)] [&>[data-slot=layer-card-header]_[data-slot=layer-card-title]]:text-destructive",
      },
    },
    compoundVariants: [
      {
        orientation: "vertical",
        stacked: true,
        className:
          "[&>[data-slot=layer-card-panel]:has(+[data-slot=layer-card-panel])]:rounded-b-none [&>[data-slot=layer-card-panel]+[data-slot=layer-card-panel]]:rounded-t-none [&>[data-slot=layer-card-panel]+[data-slot=layer-card-panel]]:border-t-0",
      },
      {
        // Seams run vertically in a row and flip to horizontal once the
        // panels stack below @md.
        orientation: "horizontal",
        stacked: true,
        className:
          "[&>[data-slot=layer-card-panel]:has(+[data-slot=layer-card-panel])]:@md/layer-card:rounded-e-none [&>[data-slot=layer-card-panel]+[data-slot=layer-card-panel]]:@md/layer-card:rounded-s-none [&>[data-slot=layer-card-panel]+[data-slot=layer-card-panel]]:@md/layer-card:border-s-0 [&>[data-slot=layer-card-panel]:has(+[data-slot=layer-card-panel])]:@max-md/layer-card:rounded-b-none [&>[data-slot=layer-card-panel]+[data-slot=layer-card-panel]]:@max-md/layer-card:rounded-t-none [&>[data-slot=layer-card-panel]+[data-slot=layer-card-panel]]:@max-md/layer-card:border-t-0",
      },
      {
        // Panels run edge to edge: the tray border is their side border and
        // the tray clips their corners.
        orientation: "vertical",
        dense: true,
        className:
          "overflow-hidden [&>[data-slot=layer-card-panel]]:rounded-none [&>[data-slot=layer-card-panel]]:border-x-0 [&>[data-slot=layer-card-panel]]:shadow-none [&>[data-slot=layer-card-panel]:first-child]:border-t-0 [&>[data-slot=layer-card-panel]:last-child]:border-b-0 [&>[data-slot=layer-card-panel]]:focus-visible:ring-inset",
      },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
      orientation: "vertical",
      stacked: false,
      dense: false,
      tone: "default",
    },
  },
);

function LayerCard({
  className,
  variant = "default",
  size = "default",
  orientation = "vertical",
  stacked = false,
  dense = false,
  tone = "default",
  render,
  ...props
}: useRender.ComponentProps<"div"> & VariantProps<typeof layerCardVariants>) {
  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        className: cn(
          layerCardVariants({ variant, size, orientation, stacked, dense, tone }),
          className,
        ),
      },
      props,
    ),
    render,
    state: {
      slot: "layer-card",
      variant,
      size,
      orientation,
      tone,
      stacked,
      dense,
    },
  });
}

function LayerCardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="layer-card-header"
      className={cn(
        "group/layer-card-header grid auto-rows-min items-start gap-0.5 px-(--layer-card-bar-px) py-(--layer-card-bar-py) has-data-[slot=layer-card-action]:grid-cols-[1fr_auto]",
        className,
      )}
      {...props}
    />
  );
}

function LayerCardTitle({
  className,
  render,
  ...props
}: useRender.ComponentProps<"div">) {
  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      { className: cn("text-sm leading-snug font-medium", className) },
      props,
    ),
    render,
    state: { slot: "layer-card-title" },
  });
}

function LayerCardDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="layer-card-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

function LayerCardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="layer-card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-center justify-self-end group-has-data-[slot=layer-card-description]/layer-card-header:self-start",
        className,
      )}
      {...props}
    />
  );
}

function LayerCardPanel({
  className,
  fit = false,
  render,
  ...props
}: useRender.ComponentProps<"div"> & { fit?: boolean }) {
  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        className: cn(
          "relative min-w-0 rounded-(--layer-card-panel-radius) border border-(color:--layer-card-border-color) bg-(--layer-card-panel-bg) bg-clip-padding px-(--layer-card-panel-px) py-(--layer-card-panel-py) text-card-foreground shadow-xs",
          !fit && "grow",
          "[a,button]:text-left [a,button]:no-underline [a,button]:transition-colors [a,button]:outline-none [a,button]:hover:bg-[color-mix(in_oklch,var(--layer-card-panel-bg),var(--foreground)_4%)] [a,button]:focus-visible:border-ring [a,button]:focus-visible:ring-3 [a,button]:focus-visible:ring-ring/50",
          className,
        ),
      },
      props,
    ),
    render,
    state: { slot: "layer-card-panel", fit },
  });
}

function LayerCardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="layer-card-footer"
      className={cn(
        "flex items-center gap-2 px-(--layer-card-bar-px) py-(--layer-card-bar-py) text-sm text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

export {
  LayerCard,
  LayerCardHeader,
  LayerCardTitle,
  LayerCardDescription,
  LayerCardAction,
  LayerCardPanel,
  LayerCardFooter,
  layerCardVariants,
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @sevenui/registry exec vitest run tests/layer-card.test.tsx`
Expected: PASS (14 tests). If `state` booleans do not map to bare `data-stacked` / `data-fit` attributes, set them explicitly in the merged props instead (`"data-stacked": stacked ? "" : undefined`).

- [ ] **Step 5: Verify Tailwind compiles the non-trivial classes**

Write a scratch file in the session scratchpad that `@import "tailwindcss"; @source` the new file, compile with the workspace `@tailwindcss/cli` or `@tailwindcss/node`, and grep the output for: `:where(.\[\:where\(\&\)\]`, `:not(:has([data-slot=layer-card-panel]))`, `@container layer-card (width < 28rem)`, `max(0px, calc(`. Expected: each present. Any class that produced no CSS is rewritten before moving on.

- [ ] **Step 6: Register the item** — append to `packages/registry/registry.json` `items`:

```json
{
  "name": "layer-card",
  "type": "registry:ui",
  "title": "Layer Card",
  "description": "A muted tray holding one or more raised panels, with a header and footer as chrome.",
  "dependencies": [
    "@base-ui/react@^1.7.0",
    "class-variance-authority@^0.7.1",
    "cn@^0.2.5"
  ],
  "files": [
    {
      "path": "registry/base/ui/layer-card.tsx",
      "type": "registry:ui"
    }
  ]
}
```

- [ ] **Step 7: Update the spec** with the three deviations listed above (Name/exports → add the client-boundary note; LayerCardHeader → drop the narrow-width wrap; Mode resolution → horizontal dense; Testing → directive present).

- [ ] **Step 8: Checkpoint** — `pnpm --filter @sevenui/registry test` → all pass (525 + 14).

### Task 2: Docs demos and the docs page

**Files:**
- Create: `packages/registry/demos/layer-card/layer-card-{demo,surface,panels,stacked,dense,horizontal,variants,sizes,link,destructive,radius}.tsx`
- Modify: `packages/registry/demos/registry.json` (11 items, `registryDependencies` = every `@/registry/base/ui/*` the file imports, as full `https://sevenui.dev/r/<name>.json` URLs; `dependencies: ["lucide-react@<workspace range>"]` when the file imports lucide)
- Create: `apps/web/docs/components/layer-card.mdx`

**Interfaces:**
- Consumes: Task 1 exports.
- Produces: demo paths `layer-card/<name>` used by `<Component path="…" />` in the mdx.

Every demo starts with `"use client";`, default-exports a PascalCase function named after the file (`LayerCardDemo`, `LayerCardSurface`, …), and wraps in a width-bounded container (`w-full max-w-sm` or `max-w-lg` for horizontal).

- [ ] **Step 1: `layer-card-demo`** — header "Subrequests" / "Origins this worker called in the last hour." with `LayerCardAction` holding `Button variant="ghost" size="icon-sm" aria-label="Open subrequests"` + `ArrowRightIcon`; one panel listing three origins (`api.example.com` 1,204 · `cdn.example.com` 860 · `auth.example.com` 312) as a `ul` with `flex justify-between` rows and `tabular-nums` counts; footer "Showing 3 of 12 origins".
- [ ] **Step 2: `layer-card-surface`** — `<LayerCard className="w-full max-w-xs">` containing only a `p` "Quick start guide for new users." (Kumo's surface mode).
- [ ] **Step 3: `layer-card-panels`** — header "Deployments"; two separate panels ("Production · main · 2 minutes ago", "Preview · feat/search · 1 hour ago") each with a `Badge` status.
- [ ] **Step 4: `layer-card-stacked`** — header "Server logs"; `stacked` with three panels (Auth service, Database, Storage), each a title line + muted status line.
- [ ] **Step 5: `layer-card-dense`** — two cards side by side in a `grid gap-6 sm:grid-cols-2`: `dense` alone and `dense stacked`, both titled "Inventory" with panels "Warehouse A · 1,240 units" and "Warehouse B · 860 units".
- [ ] **Step 6: `layer-card-horizontal`** — `orientation="horizontal" stacked`, header "Usage this month", three panels: Requests 1.2M, Bandwidth 84 GB, Errors 0.3% (label `text-muted-foreground text-xs`, value `text-2xl font-semibold tabular-nums`).
- [ ] **Step 7: `layer-card-variants`** — `grid gap-6 sm:grid-cols-3` with `default`, `inverse`, `ghost`, each titled with the variant name and one panel "Panel content".
- [ ] **Step 8: `layer-card-sizes`** — `grid gap-6 sm:grid-cols-2` with `xs`, `sm`, `default`, `lg`, each header = size name, one panel, footer "Footer".
- [ ] **Step 9: `layer-card-link`** — header "Next steps"; three panels rendered as `<a href="#">` ("Install the CLI", "Add your first primitive", "Customize the theme"), each with title + muted line + `ChevronRightIcon` at the end (`flex items-center gap-3`).
- [ ] **Step 10: `layer-card-destructive`** — `tone="destructive"`, header "Danger zone" / "These actions cannot be undone."; `stacked` panels "Transfer ownership" (Button outline "Transfer") and "Delete project" (Button variant="destructive" "Delete"), each `flex items-center justify-between gap-4` with a description.
- [ ] **Step 11: `layer-card-radius`** — `className="[--layer-card-radius:var(--radius-sm)]"` card next to a default one; the default one's panel holds an `img src="/placeholder.svg" alt="" className="aspect-video w-full rounded-(--layer-card-panel-radius) object-cover"` in a `p-0`-overridden panel (`className="p-0 overflow-hidden"`).
- [ ] **Step 12: Register all 11 demos** in `packages/registry/demos/registry.json` (titles "Layer Card Demo", "Layer Card Surface", …; descriptions one sentence each).
- [ ] **Step 13: Write `apps/web/docs/components/layer-card.mdx`** following `card.mdx`: frontmatter (title "Layer Card", description = registry description), hero `<Component path="layer-card/layer-card-demo" />`, `## Installation` `<InstallCommand item="layer-card" />`, `## Usage` (import block + anatomy from the spec), `## Examples` (one `###` per remaining demo with one or two sentences), `## Accessibility` (`render={<section aria-labelledby="…" />}` + `LayerCardTitle render={<h3 id="…" />}`; link panels: one link per panel, don't nest interactive elements), `## API reference` (LayerCard props table, LayerCardPanel props table, the other parts, CSS variables table with `--layer-card-radius` and `--layer-card-panel-radius`, data attributes list, notes: layered mode counts panels at any depth; stacked/dense only affect direct-child panels; dense in horizontal only removes the inset; a surface-mode card that directly contains a layered card is read as layered).
- [ ] **Step 14: Checkpoint** — `pnpm check:registry` → ok; `pnpm check:docs-imports` → ok.

### Task 3: Gallery Components

**Files:**
- Create: `packages/registry/components/layer-card/layer-card-01.tsx` … `layer-card-10.tsx`
- Modify: `packages/registry/components/registry.json` (10 items, type `registry:component`, files type `registry:component`)
- Modify: `apps/web/lib/gallery.ts` (`"layer-card"` into `GALLERY_SLUGS` alphabetically after `"label"`; `"layer-card": "layout"` in `FAMILY_OF`)
- Modify: `apps/web/components/gallery/illustrations.tsx` (`"layer-card"` drawing)

**Interfaces:**
- Consumes: Task 1 exports; existing primitives `button`, `badge`, `input`, `tabs`, `collapsible`, `scroll-area`, `radio-group`, `empty`, `item`, `switch`, `meter`.

Each file: `"use client";`, default export `LayerCard01` … `LayerCard10`, English content.

- [ ] **Step 1: 01 Subrequests** — `max-w-[540px]`; header holds title "Subrequests" and, below it, a row with `Input` (placeholder "Filter origins…", `h-7 text-xs`) and `Tabs` (All, 2xx, 4xx, 5xx) filtering a local `ORIGINS` array with `useState`; panel holds a 3-column grid (Origin, Requests, Duration) with `Badge` status; footer "Showing X of Y".
- [ ] **Step 2: 02 Collapsible panel** — `Collapsible` whose trigger lives in the header (chevron button in `LayerCardAction`) and whose `CollapsiblePanel render={<LayerCardPanel />}` holds build steps. Exercises "panel wrapped by another element still yields layered mode".
- [ ] **Step 3: 03 Log viewer** — header "Build log" + `Badge` "Running"; one panel with `p-0` holding `ScrollArea` `h-56` of 30 monospace log lines; footer "Streaming…".
- [ ] **Step 4: 04 Plan picker** — `RadioGroup` with three plans; each `Radio` sits inside a `<label>` rendered as a `LayerCardPanel` (`render={<label />}`) with `has-data-checked:border-primary has-data-checked:ring-2 has-data-checked:ring-primary/20` (selection styled in className, per spec).
- [ ] **Step 5: 05 Drop zone** — header "Attachments"; panel `border-dashed bg-transparent shadow-none` holding `Empty` (icon `UploadIcon`, title "Drop files to upload", description "PNG, JPG or PDF up to 10 MB", Button "Browse files").
- [ ] **Step 6: 06 Settings section** — header "Notifications"; `stacked size="sm"` panels, each an `Item`-like row: title + description + `Switch` (Email digests, Push alerts, Product updates).
- [ ] **Step 7: 07 Nested** — outer header "Project"; panel containing a nested `LayerCard variant="inverse" size="sm"` titled "Environment variables" with a stacked list of three keys.
- [ ] **Step 8: 08 Usage row** — `orientation="horizontal" stacked`; three panels each with a `Meter` (Requests 64%, Storage 38%, Bandwidth 81%).
- [ ] **Step 9: 09 Navigation grid** — `grid gap-4 sm:grid-cols-2` of four surface-mode-free cards, each `LayerCard` with a header title (Docs, Components, Blocks, Changelog) and one panel rendered as `<a href="#">` with a description and `ArrowUpRightIcon`.
- [ ] **Step 10: 10 Danger zone** — `tone="destructive" stacked`; panels: "Archive project" (outline Button), "Delete project" (destructive Button), with descriptions.
- [ ] **Step 11: Register** the 10 items with titles (Subrequests, Collapsible build steps, Build log, Plan picker, Drop zone, Notification settings, Nested cards, Usage row, Navigation cards, Danger zone) and one-sentence descriptions; `registryDependencies` match imports; lucide dependency where used.
- [ ] **Step 12: Gallery wiring** — `GALLERY_SLUGS` + `FAMILY_OF` + illustration: a tray `Panel` (x 36, y 20, w 128, h 80, r 8), a `Text strong` header line inside the tray top, then two inner `Box` panels (tone default) stacked inside, each with a `Text` line.
- [ ] **Step 13: Checkpoint** — `pnpm check:registry` → ok; `pnpm typecheck` → ok.

### Task 4: Counts and repo notes

**Files:**
- Modify: `apps/web/docs/index.mdx:6` and `:27` (65 → 66; line 27's "The first 53 arrived across five waves" stays true)
- Modify: `apps/web/lib/roadmap.ts:65` ("the existing 65" → "the existing 66"). Lines 97 and 102 are the 1.0 release notes, a historical record: unchanged.
- Modify: `AGENTS.md:20` and `:24` (65 → 66)

- [ ] **Step 1:** Make the edits.
- [ ] **Step 2:** `grep -rnw 65` over `apps/web/{app,lib,components,docs}` and `AGENTS.md`; every remaining hit must be a non-count or the 1.0 release notes.

### Task 5: Gates and browser verification

- [ ] **Step 1:** `pnpm test`, `pnpm --filter @sevenui/registry test`, `pnpm typecheck`, `pnpm lint`, `pnpm check:registry`, `pnpm check:docs-imports`, `pnpm build:registry` → all pass. Report exact counts.
- [ ] **Step 2:** Start `pnpm dev` in the worktree on a free port (not 3000, which other sessions may use) and open `/docs/components/layer-card` and `/components/layer-card` in a browser.
- [ ] **Step 3:** For every demo, light and dark: tray and panels visible and distinct; header/panel/footer text left-aligned.
- [ ] **Step 4:** Theme customizer radius none / small / default / large: panels concentric, square under none, never broken.
- [ ] **Step 5:** Stacked and dense seams: single 1px lines, no doubled borders; dense corners clipped by the tray.
- [ ] **Step 6:** Horizontal demo at < 28rem container width: panels stack, seams flip to horizontal.
- [ ] **Step 7:** Keyboard-tab through `layer-card-link`: visible focus ring on each panel.
- [ ] **Step 8:** `layer-card-02`: root is in layered mode (muted tray around the collapsible panel); `layer-card-radius`: the `--layer-card-radius` override visibly changes corners.
- [ ] **Step 9:** Stop the dev server. Leave everything uncommitted; report `git status`.
