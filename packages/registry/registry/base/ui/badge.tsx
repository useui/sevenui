import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";

// Status tones are quiet: a tint of --badge-tone, a tone border and a dot
// in the tone colour. An icon replaces the dot. The neutral base comes first
// in each color-mix() because Tailwind's no-color-mix() fallback is the first
// colour.
const statusTone =
  "bg-[color:color-mix(in_oklch,transparent_90%,var(--badge-tone))] border-[color:color-mix(in_oklch,transparent_75%,var(--badge-tone))] before:size-1.5 before:shrink-0 before:rounded-full before:bg-(--badge-tone) has-[>svg]:before:hidden [a]:hover:bg-[color:color-mix(in_oklch,transparent_84%,var(--badge-tone))]";

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2 py-0.5 text-[11px] font-medium whitespace-nowrap transition-[color,background-color,border-color] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-reduce:transition-none has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        secondary:
          "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
        // Tinted text is pulled towards the foreground, darker in light and
        // lighter in dark, until it reads at AA (4.5:1) on its own tint over
        // any surface; the dot keeps the pure tone. badge.test.tsx measures
        // each pull against the theme values.
        destructive: cn(
          "[--badge-tone:var(--destructive)] text-[color:color-mix(in_oklch,var(--foreground)_22%,var(--badge-tone))] focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
          statusTone,
        ),
        outline:
          "border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",
        ghost:
          "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
        link: "text-primary underline-offset-4 hover:underline",
        success: cn(
          "[--badge-tone:var(--success,oklch(0.627_0.194_149.214))] text-[color:color-mix(in_oklch,var(--foreground)_40%,var(--badge-tone))]",
          statusTone,
        ),
        warning: cn(
          "[--badge-tone:var(--warning,oklch(0.769_0.188_70.08))] text-[color:color-mix(in_oklch,var(--foreground)_45%,var(--badge-tone))]",
          statusTone,
        ),
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
