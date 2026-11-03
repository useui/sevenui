import { cn } from "cn";
import { Loader2Icon } from "lucide-react";

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <Loader2Icon
      data-slot="spinner"
      role="status"
      aria-label="Loading"
      // Muted on its own, but it takes the text colour of a button or badge
      // it sits in. Reduced motion slows the spin instead of freezing it, so
      // the status still reads as in progress.
      className={cn(
        "size-4 animate-spin text-muted-foreground in-data-[slot=badge]:text-current in-data-[slot=button]:text-current motion-reduce:animate-[spin_2.5s_linear_infinite]",
        className,
      )}
      {...props}
    />
  );
}

export { Spinner };
