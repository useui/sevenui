import * as React from "react";

import { cn } from "@/registry/base/lib/utils";

function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      className={cn(
        "flex select-none items-center gap-2 text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-50 group-data-[disabled]:pointer-events-none group-data-[disabled]:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Label };
