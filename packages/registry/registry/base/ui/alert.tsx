import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";

const alertVariants = cva(
  // A tinted panel per tone. --panel-pad falls back inside var(), so an
  // ancestor's data-density still reaches it.
  "group/alert relative grid w-full gap-0.5 rounded-xl border p-[var(--panel-pad,1.125rem)] text-left text-sm has-data-[slot=alert-action]:relative has-data-[slot=alert-action]:pr-18 has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-2.5 *:[svg]:row-span-2 *:[svg]:translate-y-0.5 *:[svg]:text-current *:[svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "border-hairline-strong bg-surface-panel text-card-foreground",
        // 8% tone into the panel. The panel comes first because Tailwind's
        // no-color-mix() fallback is the first colour. Title and description
        // pull the tone towards the foreground so both read at AA on the
        // tint; alert.test.tsx measures them against the theme values.
        destructive:
          "border-[color:color-mix(in_oklch,transparent_70%,var(--destructive))] bg-[color:color-mix(in_oklch,var(--surface-panel,var(--card))_92%,var(--destructive))] text-[color:color-mix(in_oklch,var(--foreground)_15%,var(--destructive))] *:data-[slot=alert-description]:text-[color:color-mix(in_oklch,var(--foreground)_25%,var(--destructive))] *:[svg]:text-current",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "font-medium group-has-[>svg]/alert:col-start-2 [&_a]:underline [&_a]:underline-offset-3 [&_a]:rounded-sm [&_a]:outline-none [&_a]:focus-visible:focus-ring [&_a]:hover:text-foreground",
        className,
      )}
      {...props}
    />
  );
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-sm text-balance text-muted-foreground md:text-pretty [&_a]:underline [&_a]:underline-offset-3 [&_a]:rounded-sm [&_a]:outline-none [&_a]:focus-visible:focus-ring [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4",
        className,
      )}
      {...props}
    />
  );
}

function AlertAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-action"
      className={cn(
        "absolute top-[calc(var(--panel-pad,1.125rem)-0.375rem)] right-[calc(var(--panel-pad,1.125rem)-0.375rem)]",
        className,
      )}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription, AlertAction };
