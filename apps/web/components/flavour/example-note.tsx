import "server-only";

import { Info } from "lucide-react";
import { type ExampleKind, exampleCompat, hasOverlay } from "../../lib/ui-sdk-examples";

/**
 * A one-line note under an example, shown only to UI SDK readers, when the compat manifest records that
 * this example behaves or looks different on UI SDK (or has no UI SDK version yet).
 */
export function ExampleFlavourNote({ kind, file }: { kind: ExampleKind; file: string }) {
  const { status, reasons } = exampleCompat(`${kind}/${file.replace(/\.tsx$/, "")}`);
  const missing = status === "variant" && !hasOverlay(kind, file);
  if (!missing && (status !== "differs" || reasons.length === 0)) return null;

  const sentences = reasons.map((reason) => reason.replaceAll("`", "")).map((r) => r.charAt(0).toUpperCase() + r.slice(1));
  const text = missing
    ? `no version yet. ${sentences.join(". ")}.`
    : `${sentences.join(". ")}.`;

  return (
    <p className="flavour-only-ui-sdk mt-2.5 flex gap-2 px-1 text-muted-foreground text-xs leading-5">
      <Info aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" strokeWidth={1.75} />
      <span>
        <span className="font-medium text-foreground">On UI SDK: </span>
        {text}
      </span>
    </p>
  );
}
