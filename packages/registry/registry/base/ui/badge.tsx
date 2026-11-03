"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";

// Status tones are quiet: a tint of --badge-tone, a tone hairline and a dot
// in the tone colour. An icon replaces the dot. The neutral base comes first
// in each color-mix() because Tailwind's no-color-mix() fallback is the first
// colour.
const statusTone =
  "bg-[color:color-mix(in_oklch,transparent_90%,var(--badge-tone))] border-[color:color-mix(in_oklch,transparent_75%,var(--badge-tone))] before:size-1.5 before:shrink-0 before:rounded-full before:bg-(--badge-tone) has-[>svg]:before:hidden [a]:hover:bg-[color:color-mix(in_oklch,transparent_84%,var(--badge-tone))]";

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2 py-0.5 text-[11px] font-medium whitespace-nowrap transition-colors outline-none focus-visible:focus-ring motion-reduce:transition-none has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:[--focus-color:var(--destructive)] [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default:
          "border-hairline-strong text-foreground [a]:hover:bg-muted",
        secondary:
          "border-hairline bg-surface-panel text-secondary-foreground [a]:hover:bg-surface-raised",
        destructive: cn(
          "text-destructive [--badge-tone:var(--destructive)]",
          statusTone,
        ),
        outline:
          "border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",
        ghost:
          "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
        link: "text-brand underline-offset-4 hover:underline",
        // Text is pulled a quarter towards the foreground so it reads at AA on
        // its own tint in light; the dot keeps the pure tone.
        success: cn(
          "[--badge-tone:var(--success,oklch(0.627_0.194_149.214))] text-[color:color-mix(in_oklch,var(--foreground)_25%,var(--badge-tone))]",
          statusTone,
        ),
        warning: cn(
          "[--badge-tone:var(--warning,oklch(0.769_0.188_70.08))] text-[color:color-mix(in_oklch,var(--foreground)_40%,var(--badge-tone))]",
          statusTone,
        ),
        highlight:
          "border-brand/30 bg-brand/14 text-brand [a]:hover:bg-brand/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props,
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  });
}

export { Badge, badgeVariants };
