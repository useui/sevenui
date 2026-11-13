import { Info } from "lucide-react";

/**
 * Pro blocks have one flavour. A reader who chose UI SDK meets this on the block pages (CSS shows it only
 * under `<html data-flavour="ui-sdk">`), so nothing implies a UI SDK version of a block.
 */
export function BlocksFlavourNote() {
  return (
    <p className="flavour-only-ui-sdk mt-6 flex max-w-docs gap-2 rounded-xl border border-border bg-muted/40 px-4 py-3 text-muted-foreground text-sm leading-6">
      <Info aria-hidden="true" className="mt-1 size-4 shrink-0" strokeWidth={1.75} />
      <span>
        <span className="font-medium text-foreground">You chose UI SDK.</span> Pro blocks are built on Base UI only:
        installing one adds the Base UI flavour of the primitives it uses, and replaces those files if your project is
        on UI SDK. See{" "}
        <a className="font-medium text-foreground underline decoration-dotted underline-offset-[0.2em]" href="/docs/installation#one-flavour-per-project">
          one flavour per project
        </a>
        .
      </span>
    </p>
  );
}
