"use client";

import * as React from "react";
import { Group, Panel, Separator } from "react-resizable-panels";
import { GripVerticalIcon } from "lucide-react";

import { cn } from "@/registry/base/lib/utils";

function ResizablePanelGroup({
  className,
  orientation = "horizontal",
  ...props
}: React.ComponentProps<typeof Group>) {
  return (
    <Group
      data-orientation={orientation}
      orientation={orientation}
      className={cn("group/resizable", className)}
      {...props}
    />
  );
}

const ResizablePanel = Panel;

function ResizableHandle({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof Separator> & { withHandle?: boolean }) {
  return (
    <Separator
      className={cn(
        "relative flex w-px items-center justify-center bg-border outline-none data-[separator=active]:bg-ring data-[separator=focus]:ring-2 data-[separator=focus]:ring-ring/50 data-[separator=disabled]:opacity-50 group-data-[orientation=vertical]/resizable:h-px group-data-[orientation=vertical]/resizable:w-full",
        className,
      )}
      {...props}
    >
      {withHandle && (
        <div className="z-10 flex h-4 w-3 shrink-0 items-center justify-center rounded-xs border bg-border group-data-[orientation=vertical]/resizable:rotate-90">
          <GripVerticalIcon className="size-2.5" />
        </div>
      )}
    </Separator>
  );
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
