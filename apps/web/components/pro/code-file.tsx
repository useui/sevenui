import { CopyButton } from "./copy-button";
import { cx } from "../../lib/cx";

/** A named source panel with one copy control. `copyValue` is what the clipboard gets when it differs from the text shown. */
export function CodeFile({
  name,
  note,
  code,
  copyValue,
  copyLabel,
  className,
}: {
  name: string;
  note?: string;
  code: string;
  copyValue?: string;
  copyLabel: string;
  className?: string;
}) {
  return (
    <div className={cx("min-w-0 overflow-hidden rounded-lg border border-border bg-card", className)}>
      <div className="flex items-center justify-between gap-3 border-b border-border py-1 pr-1 pl-3.5">
        <span className="flex min-w-0 items-baseline gap-2 font-mono text-xs">
          <span className="text-foreground">{name}</span>
          {note ? <span className="truncate text-muted-foreground">{note}</span> : null}
        </span>
        <CopyButton label={copyLabel} value={copyValue ?? code} />
      </div>
      <pre className="sv-scroll overflow-x-auto px-3.5 py-3 font-mono text-[0.8125rem] leading-6 whitespace-pre-wrap text-card-foreground [overflow-wrap:anywhere] sm:whitespace-pre sm:[overflow-wrap:normal]">
        <code>{code}</code>
      </pre>
    </div>
  );
}
