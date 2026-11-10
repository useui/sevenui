import { LayerCard, LayerCardHeader, LayerCardPanel } from "@/registry/base/ui/layer-card";
import { CopyButton } from "./copy-button";
import { cx } from "../../lib/cx";

/**
 * A named source panel with one copy control. `copyValue` is what the clipboard gets when it differs from the text shown.
 * `html` is `code` already highlighted on the server (`highlightLines`); without it the code renders plain, which is
 * what a client caller gets, since Shiki never ships to the browser.
 */
export function CodeFile({
  name,
  note,
  code,
  copyValue,
  copyLabel,
  html,
  className,
}: {
  name: string;
  note?: string;
  code: string;
  copyValue?: string;
  copyLabel: string;
  html?: string;
  className?: string;
}) {
  return (
    // The file name and copy control are the tray's header chrome, the source is the panel: the same frame the
    // docs code blocks use.
    <LayerCard className={cx("min-w-0", className)} size="sm">
      <LayerCardHeader className="flex items-center justify-between gap-3 py-0.5 pr-0.5 pl-[calc(0.875rem+1px)]">
        <span className="flex min-w-0 items-baseline gap-2 font-mono text-xs">
          <span className="text-foreground">{name}</span>
          {note ? <span className="truncate text-muted-foreground">{note}</span> : null}
        </span>
        <CopyButton label={copyLabel} value={copyValue ?? code} />
      </LayerCardHeader>
      <LayerCardPanel className="overflow-hidden p-0">
        <pre className="sv-scroll overflow-x-auto px-3.5 py-3 font-mono text-[0.8125rem] leading-6 whitespace-pre-wrap text-card-foreground [overflow-wrap:anywhere] sm:whitespace-pre sm:[overflow-wrap:normal]">
          {html === undefined ? (
            <code>{code}</code>
          ) : (
            // biome-ignore lint/security/noDangerouslySetInnerHtml: server-side Shiki output from our own sources
            <code className="shiki" dangerouslySetInnerHTML={{ __html: html }} />
          )}
        </pre>
      </LayerCardPanel>
    </LayerCard>
  );
}
