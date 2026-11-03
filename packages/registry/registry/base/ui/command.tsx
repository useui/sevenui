"use client";

import * as React from "react";
import { Autocomplete as AutocompletePrimitive } from "@base-ui/react/autocomplete";
import { cn } from "cn";
import { SearchIcon } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/registry/base/ui/dialog";
import { InputGroup, InputGroupAddon } from "@/registry/base/ui/input-group";

function Command({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AutocompletePrimitive.Root> & {
  className?: string;
}) {
  return (
    <AutocompletePrimitive.Root
      inline
      open
      autoHighlight="always"
      keepHighlight
      {...props}
    >
      <div
        data-slot="command"
        className={cn(
          // Tray surface; the highlighted row is the inner panel. Standalone,
          // the palette shows the offset ring while its search input has
          // keyboard focus; inside a dialog the input always has focus, so
          // the dialog edge is the indicator and no ring is drawn.
          "flex size-full flex-col overflow-hidden rounded-xl! bg-surface-tray p-1 text-popover-foreground shadow-[inset_0_0_0_1px_var(--hairline)] outline-none in-data-[slot=dialog-content]:shadow-none [&:not([data-slot=dialog-content]_*):has([data-slot=command-input]:focus-visible)]:focus-ring",
          className,
        )}
      >
        {children}
      </div>
    </AutocompletePrimitive.Root>
  );
}

function CommandDialog({
  title = "Command Palette",
  description = "Search for a command to run...",
  children,
  className,
  showCloseButton = false,
  ...props
}: Omit<React.ComponentProps<typeof Dialog>, "children"> & {
  title?: string;
  description?: string;
  className?: string;
  showCloseButton?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Dialog {...props}>
      <DialogHeader className="sr-only">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogContent
        className={cn(
          "top-1/3 translate-y-0 overflow-hidden rounded-xl! bg-surface-tray p-0 shadow-overlay",
          className,
        )}
        showCloseButton={showCloseButton}
      >
        {children}
      </DialogContent>
    </Dialog>
  );
}

function CommandInput({
  className,
  ...props
}: React.ComponentProps<typeof AutocompletePrimitive.Input>) {
  return (
    <div
      data-slot="command-input-wrapper"
      className="-mx-1 -mt-1 mb-1 border-b border-hairline px-1"
    >
      <InputGroup className="h-[calc(var(--control-h,2.125rem)+0.5rem)]! rounded-none! border-0! bg-transparent! shadow-none! ring-0! *:data-[slot=input-group-addon]:pl-2!">
        <AutocompletePrimitive.Input
          data-slot="command-input"
          className={cn(
            "w-full bg-transparent text-[length:var(--control-text,0.8125rem)] outline-hidden placeholder:text-muted-foreground/70 disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
          {...props}
        />
        <InputGroupAddon>
          <SearchIcon className="size-4 shrink-0 opacity-50" />
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}

function CommandList({
  className,
  ...props
}: React.ComponentProps<typeof AutocompletePrimitive.List>) {
  return (
    <AutocompletePrimitive.List
      data-slot="command-list"
      className={cn(
        "no-scrollbar max-h-72 scroll-py-1 overflow-x-hidden overflow-y-auto outline-none",
        className,
      )}
      {...props}
    />
  );
}

function CommandEmpty({
  className,
  ...props
}: React.ComponentProps<typeof AutocompletePrimitive.Empty>) {
  return (
    <AutocompletePrimitive.Empty
      data-slot="command-empty"
      className={cn(
        "not-empty:py-6 text-center text-[length:var(--control-text,0.8125rem)] text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

function CommandGroup({
  className,
  heading,
  children,
  ...props
}: Omit<
  React.ComponentProps<typeof AutocompletePrimitive.Group>,
  "children"
> & {
  heading?: React.ReactNode;
  children: (item: any, index: number) => React.ReactNode;
}) {
  return (
    <AutocompletePrimitive.Group
      data-slot="command-group"
      className={cn("overflow-hidden p-1 text-foreground", className)}
      {...props}
    >
      {heading != null && (
        <AutocompletePrimitive.GroupLabel className="px-2 pt-2 pb-1 font-mono text-[11px] font-medium tracking-wide text-muted-foreground/80 uppercase">
          {heading}
        </AutocompletePrimitive.GroupLabel>
      )}
      <AutocompletePrimitive.Collection>
        {children}
      </AutocompletePrimitive.Collection>
    </AutocompletePrimitive.Group>
  );
}

function CommandSeparator({
  className,
  ...props
}: React.ComponentProps<typeof AutocompletePrimitive.Separator>) {
  return (
    <AutocompletePrimitive.Separator
      data-slot="command-separator"
      className={cn("-mx-1 my-1 h-px bg-hairline", className)}
      {...props}
    />
  );
}

function CommandItem({
  className,
  ...props
}: React.ComponentProps<typeof AutocompletePrimitive.Item>) {
  return (
    <AutocompletePrimitive.Item
      data-slot="command-item"
      className={cn(
        "group/command-item relative flex min-h-[var(--item-h,2rem)] cursor-default items-center gap-[var(--control-gap,0.5rem)] rounded-md px-2 py-1 text-[length:var(--control-text,0.8125rem)] outline-hidden select-none in-data-[slot=dialog-content]:rounded-lg! data-disabled:pointer-events-none data-disabled:opacity-50 data-highlighted:bg-surface-panel data-highlighted:text-foreground data-highlighted:shadow-[inset_0_0_0_1px_var(--hairline)] [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 data-highlighted:*:[svg]:text-foreground",
        className,
      )}
      {...props}
    />
  );
}

function CommandShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="command-shortcut"
      className={cn(
        // B1 kbd look, classes only.
        "ml-auto inline-flex h-5 min-w-5 items-center justify-center gap-0.5 rounded-sm bg-surface-raised px-1 font-mono text-[10.5px] leading-none font-medium text-muted-foreground shadow-[inset_0_0_0_1px_var(--hairline),inset_0_-1px_0_var(--hairline-strong)] group-data-highlighted/command-item:text-foreground",
        className,
      )}
      {...props}
    />
  );
}

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
};
