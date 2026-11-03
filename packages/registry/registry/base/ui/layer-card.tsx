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
    "group/layer-card relative flex min-w-0 rounded-(--layer-card-radius) bg-clip-padding px-(--layer-card-pad-x) py-(--layer-card-pad-y) text-sm text-card-foreground shadow-(--layer-card-shadow)",
    // The tone is mixed into whatever the root is filled with, so an inverse
    // or ghost tray keeps its own base and only takes the tint. The base comes
    // first because Tailwind's no-color-mix() fallback is the first colour.
    "bg-[color:color-mix(in_oklch,var(--layer-card-fill),var(--destructive)_var(--layer-card-tone-mix))] border-[color:var(--layer-card-tone-border,var(--layer-card-border-color))]",
    // --theme() inlines the token like rounded-xl does on Card; var() would
    // read --radius-xl as computed on :root and miss a scoped --radius.
    "[:where(&)]:[--layer-card-radius:--theme(--radius-xl)]",
    "[:where(&)]:[--layer-card-pad-x:var(--layer-card-inset)] [:where(&)]:[--layer-card-pad-y:var(--layer-card-inset)] [:where(&)]:[--layer-card-fill:var(--layer-card-bg)] [:where(&)]:[--layer-card-shadow:var(--elevation-highlight,0_0_#0000)]",
    // Surfaces, hairline and lift come from the SevenUI tokens; each keeps its
    // pre-token value as the fallback for a file copied without them.
    "[:where(&)]:[--layer-card-border-color:var(--hairline,color-mix(in_oklch,var(--foreground)_10%,transparent))]",    // Concentric: the panel is inset by the tray padding plus the tray border,
    // so subtracting exactly that keeps both arcs parallel. Clamped, because
    // the radius-none preset leaves --radius-xl at 4px.
    "[:where(&)]:[--layer-card-panel-radius:max(0px,calc(var(--layer-card-radius)_-_var(--layer-card-inset)_-_var(--layer-card-border-width)))]",
    // Bars left-align with panel content: panel padding plus its 1px border.
    "[:where(&)]:[--layer-card-bar-px:calc(var(--layer-card-panel-px)_+_1px)]",
    // Surface mode: no panel anywhere inside, so the root is the surface. It
    // only re-points variables, so a consumer's p-* / bg-* / shadow-* class
    // still wins. The root's padding insets the content; the bars add none.
    "[&:not(:has([data-slot=layer-card-panel]))]:[--layer-card-fill:var(--layer-card-panel-bg)] [&:not(:has([data-slot=layer-card-panel]))]:[--layer-card-pad-x:var(--layer-card-panel-px)] [&:not(:has([data-slot=layer-card-panel]))]:[--layer-card-pad-y:var(--layer-card-panel-py)] [&:not(:has([data-slot=layer-card-panel]))]:[--layer-card-shadow:var(--elevation-highlight,0_0_#0000),var(--elevation-raised,0_1px_2px_0_rgb(0_0_0/0.05))]",
    "[&:not(:has([data-slot=layer-card-panel]))]:[--layer-card-bar-px:0px] [&:not(:has([data-slot=layer-card-panel]))]:[--layer-card-bar-py:0px]",
  ],
  {
    variants: {
      variant: {
        // The panel token already lifts itself off the tray in dark, so the
        // variants need no dark: override.
        default:
          "border [--layer-card-border-width:1px] [--layer-card-bg:var(--surface-tray,color-mix(in_oklch,var(--muted)_50%,transparent))] [--layer-card-panel-bg:var(--surface-panel,var(--card))]",
        inverse:
          "border [--layer-card-border-width:1px] [--layer-card-bg:var(--surface-panel,var(--card))] [--layer-card-panel-bg:var(--surface-tray,color-mix(in_oklch,var(--muted)_50%,var(--card)))]",
        ghost:
          "border-0 [--layer-card-border-width:0px] [--layer-card-bg:var(--surface-tray,color-mix(in_oklch,var(--muted)_50%,transparent))] [--layer-card-panel-bg:var(--surface-panel,var(--card))]",
      },
      // Panel padding scales from --panel-pad, so data-density on any ancestor
      // tightens it. Its fallback sits inside var() rather than in a :where()
      // default: a declaration on the root would shadow the inherited value.
      // Bars read as chrome: their py is about half the panel's, px is equal.
      size: {
        xs: "[--layer-card-panel-px:calc(var(--panel-pad,1.125rem)*0.5)] [--layer-card-panel-py:calc(var(--panel-pad,1.125rem)*0.5)] [--layer-card-bar-py:calc(var(--panel-pad,1.125rem)*0.125)]",
        sm: "[--layer-card-panel-px:calc(var(--panel-pad,1.125rem)*0.75)] [--layer-card-panel-py:calc(var(--panel-pad,1.125rem)*0.75)] [--layer-card-bar-py:calc(var(--panel-pad,1.125rem)*0.375)]",
        default:
          "[--layer-card-panel-px:var(--panel-pad,1.125rem)] [--layer-card-panel-py:var(--panel-pad,1.125rem)] [--layer-card-bar-py:calc(var(--panel-pad,1.125rem)*0.5)]",
        lg: "[--layer-card-panel-px:calc(var(--panel-pad,1.125rem)*1.25)] [--layer-card-panel-py:calc(var(--panel-pad,1.125rem)*1.25)] [--layer-card-bar-py:calc(var(--panel-pad,1.125rem)*0.625)]",
      },
      orientation: {
        vertical: "flex-col",
        // Only horizontal becomes a size container: inline-size containment
        // collapses a root that sizes to its content.
        horizontal:
          "@container/layer-card flex-row flex-wrap [&>[data-slot=layer-card-header]]:basis-full [&>[data-slot=layer-card-footer]]:basis-full [&>[data-slot=layer-card-panel]:not([data-fit])]:@md/layer-card:basis-0 [&>[data-slot=layer-card-panel]]:@max-md/layer-card:basis-full",
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
        default: "[--layer-card-tone-mix:0%] [--layer-card-tone-border:initial]",
        destructive:
          "[--layer-card-tone-mix:6%] dark:[--layer-card-tone-mix:12%] [--layer-card-tone-border:color-mix(in_oklch,var(--destructive)_30%,transparent)] [&>[data-slot=layer-card-header]_[data-slot=layer-card-title]]:text-destructive",
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
        // Panels run edge to edge: the tray border is their side border. Only
        // a panel touching the tray's top or bottom edge takes the tray's
        // inner radius; the tray does not clip, so focus rings in the bars
        // stay whole. Bars lose the panel side border from their alignment.
        orientation: "vertical",
        dense: true,
        className:
          "[--layer-card-bar-px:var(--layer-card-panel-px)] [&>[data-slot=layer-card-panel]]:[--layer-card-panel-radius:0px] [&>[data-slot=layer-card-panel]]:border-x-0 [&>[data-slot=layer-card-panel]]:shadow-none [&>[data-slot=layer-card-panel]:first-child]:border-t-0 [&>[data-slot=layer-card-panel]:last-child]:border-b-0 [&>[data-slot=layer-card-panel]:first-child]:rounded-t-[max(0px,calc(var(--layer-card-radius)_-_var(--layer-card-border-width)))] [&>[data-slot=layer-card-panel]:last-child]:rounded-b-[max(0px,calc(var(--layer-card-radius)_-_var(--layer-card-border-width)))] [&>[data-slot=layer-card-panel]]:focus-visible:[--focus-gap:calc(var(--focus-width)*-2)]",
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
          "relative min-w-0 rounded-(--layer-card-panel-radius) border border-(color:--layer-card-border-color) bg-(--layer-card-panel-bg) bg-clip-padding px-(--layer-card-panel-px) py-(--layer-card-panel-py) text-card-foreground shadow-[var(--elevation-raised,0_1px_2px_0_rgb(0_0_0/0.05))]",
          !fit && "grow",
          "[a,button]:text-start [a,button]:no-underline [a,button]:transition-colors [a,button]:outline-none [a,button]:hover:bg-[color-mix(in_oklch,var(--layer-card-panel-bg),var(--foreground)_4%)] [a,button]:focus-visible:z-10 [a,button]:focus-visible:focus-ring [a,button]:motion-reduce:transition-none",
          className,
        ),
      },
      props,
      // The tray finds its panels by this slot, so it goes last: a component
      // that renders through a panel (CollapsibleContent render={…}) passes
      // its own data-slot, which must not win.
      { "data-slot": "layer-card-panel" } as React.ComponentProps<"div">,
    ),
    render,
    state: { fit },
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
