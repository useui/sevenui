import type * as React from "react";
import { mergeProps, type RenderProp, renderElement } from "@ui-sdk/react/primitive";
import { cn } from "cn";
import { ChevronRightIcon, MoreHorizontalIcon } from "lucide-react";

function Breadcrumb({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      aria-label="breadcrumb"
      data-slot="breadcrumb"
      className={cn(className)}
      {...props}
    />
  );
}

function BreadcrumbList({ className, ...props }: React.ComponentProps<"ol">) {
  return (
    <ol
      data-slot="breadcrumb-list"
      className={cn(
        "flex flex-wrap items-center gap-1.5 text-sm wrap-break-word text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

function BreadcrumbItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="breadcrumb-item"
      className={cn("inline-flex items-center gap-1", className)}
      {...props}
    />
  );
}

type BreadcrumbLinkState = { slot: "breadcrumb-link" };

// Base UI's useRender turns state into data attributes; renderElement does not,
// so data-slot is set explicitly. ReactElement<unknown> keeps Base UI's render type.
function BreadcrumbLink({
  className,
  render,
  ...props
}: React.ComponentProps<"a"> & {
  render?: RenderProp<BreadcrumbLinkState> | React.ReactElement<unknown>;
}) {
  return renderElement(
    "a",
    mergeProps(
      {
        "data-slot": "breadcrumb-link",
        className: cn(
          "transition-[color,background-color,border-color] hover:text-foreground motion-reduce:transition-none",
          className,
        ),
      },
      props,
    ),
    render as RenderProp<BreadcrumbLinkState> | undefined,
    { slot: "breadcrumb-link" } satisfies BreadcrumbLinkState,
  );
}

function BreadcrumbPage({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-page"
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn("font-normal text-foreground", className)}
      {...props}
    />
  );
}

function BreadcrumbSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={cn("text-muted-foreground/60 [&>svg]:size-3.5", className)}
      {...props}
    >
      {children ?? <ChevronRightIcon className="cn-rtl-flip" />}
    </li>
  );
}

function BreadcrumbEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-ellipsis"
      role="presentation"
      aria-hidden="true"
      className={cn(
        "flex size-5 items-center justify-center [&>svg]:size-4",
        className,
      )}
      {...props}
    >
      <MoreHorizontalIcon />
      <span className="sr-only">More</span>
    </span>
  );
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
};
