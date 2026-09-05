"use client";

import * as React from "react";
import { Autocomplete as AutocompletePrimitive } from "@base-ui/react/autocomplete";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { SearchIcon } from "lucide-react";

import { cn } from "@/registry/base/lib/utils";

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
        className={cn(
          "flex h-full w-full flex-col overflow-hidden rounded-md border bg-popover text-popover-foreground",
          className,
        )}
      >
        {children}
      </div>
    </AutocompletePrimitive.Root>
  );
}

function CommandInput({
  className,
  ...props
}: React.ComponentProps<typeof AutocompletePrimitive.Input>) {
  return (
    <div className="flex items-center gap-2 border-b px-3">
      <SearchIcon className="size-4 shrink-0 opacity-50" />
      <AutocompletePrimitive.Input
        className={cn(
          "flex h-10 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
    </div>
  );
}

function CommandList({
  className,
  ...props
}: React.ComponentProps<typeof AutocompletePrimitive.List>) {
  return (
    <AutocompletePrimitive.List
      className={cn(
        "max-h-72 scroll-py-1 overflow-x-hidden overflow-y-auto",
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
      className={cn(
        "not-empty:py-6 text-center text-sm text-muted-foreground",
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
      className={cn("overflow-hidden p-1", className)}
      {...props}
    >
      {heading != null && (
        <AutocompletePrimitive.GroupLabel className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
          {heading}
        </AutocompletePrimitive.GroupLabel>
      )}
      <AutocompletePrimitive.Collection>
        {children}
      </AutocompletePrimitive.Collection>
    </AutocompletePrimitive.Group>
  );
}

function CommandItem({
  className,
  ...props
}: React.ComponentProps<typeof AutocompletePrimitive.Item>) {
  return (
    <AutocompletePrimitive.Item
      className={cn(
        "relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
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
      className={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

function CommandSeparator({
  className,
  ...props
}: React.ComponentProps<typeof AutocompletePrimitive.Separator>) {
  return (
    <AutocompletePrimitive.Separator
      className={cn("-mx-1 h-px bg-border", className)}
      {...props}
    />
  );
}

function CommandDialog({
  title = "Command palette",
  description = "Search for a command to run...",
  children,
  ...props
}: Omit<React.ComponentProps<typeof DialogPrimitive.Root>, "children"> & {
  title?: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <DialogPrimitive.Root {...props}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/50 transition-opacity duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
        <DialogPrimitive.Viewport className="fixed inset-0 z-50 flex justify-center overflow-y-auto p-4 pt-[10vh] sm:pt-[15vh]">
          <DialogPrimitive.Popup className="h-fit w-full max-w-lg overflow-hidden rounded-lg border bg-popover shadow-lg transition-[scale,opacity] duration-150 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0">
            <DialogPrimitive.Title className="sr-only">
              {title}
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="sr-only">
              {description}
            </DialogPrimitive.Description>
            {children}
          </DialogPrimitive.Popup>
        </DialogPrimitive.Viewport>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
  CommandDialog,
};
