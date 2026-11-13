import "server-only";

import Link from "next/link";
import * as React from "react";
import { UI_SDK_VERSION, uiSdkDocsUrl } from "../../lib/flavour";
import { primitiveFoundation } from "../../lib/flavour-items";
import { POPUP_NOTE, POPUP_PRIMITIVES, UI_SDK_NOTES } from "../../lib/ui-sdk-notes";

const BOX = "flavour-only-ui-sdk my-6 rounded-xl border border-border bg-muted/40 px-4 py-3.5 text-sm leading-6";
const INLINE_CODE =
  "rounded-[0.3rem] bg-background px-[0.35em] py-[0.1em] font-mono text-[0.8125rem] font-medium text-foreground";
const LINK = "font-medium text-foreground underline decoration-1 decoration-dotted underline-offset-[0.2em]";

/** Renders `code` spans written with backticks in the notes data. */
function withCode(text: string): React.ReactNode[] {
  return text.split(/(`[^`]+`)/g).map((part, i) =>
    part.startsWith("`") && part.endsWith("`") ? (
      // biome-ignore lint/suspicious/noArrayIndexKey: a fixed split of static text
      <code className={INLINE_CODE} key={i}>
        {part.slice(1, -1)}
      </code>
    ) : (
      part
    ),
  );
}

/** The UI SDK setup a primitive needs, under its install command. Shown only to UI SDK readers. */
export function UiSdkPrimitiveNote() {
  return (
    <aside aria-label="UI SDK setup" className={BOX}>
      <p className="font-medium text-foreground">
        UI SDK flavour <span className="font-normal text-muted-foreground">· @ui-sdk/react {UI_SDK_VERSION}, beta</span>
      </p>
      <p className="mt-1 text-muted-foreground">
        Needs React 19. Put <code className={INLINE_CODE}>@layer ui-sdk;</code> on the first line of your global stylesheet,
        above <code className={INLINE_CODE}>@import "tailwindcss"</code>, so your utilities win over UI SDK&apos;s popup reset. The
        CLI prints this step; it cannot add it for you.{" "}
        <Link className={LINK} href="/docs/installation#choose-a-flavour">
          Set up UI SDK
        </Link>
      </p>
    </aside>
  );
}

/**
 * The API reference of a primitive for UI SDK readers, in place of the Base UI prose (lib/mdx/remark-flavour-api.mjs
 * puts it there). What the flavour is built on comes from the flavour file's imports; the differences from
 * lib/ui-sdk-notes.ts.
 */
export async function UiSdkApiReference({ name }: { name: string }) {
  const foundation = await primitiveFoundation(name, "ui-sdk");
  const notes = [...(POPUP_PRIMITIVES.has(name) ? [POPUP_NOTE] : []), ...(UI_SDK_NOTES[name] ?? [])].map((note) => note.text);

  const builtOn: React.ReactNode[] = [
    ...foundation.entries.map((entry) => (
      <a className={LINK} href={uiSdkDocsUrl(entry)} key={entry} rel="noopener noreferrer" target="_blank">
        UI SDK {entry.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
      </a>
    )),
    ...foundation.primitives.map((other) => (
      <Link className={LINK} href={`/docs/components/${other}`} key={other}>
        SevenUI {other.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
      </Link>
    )),
    ...foundation.libraries.map((lib) => (
      <code className={INLINE_CODE} key={lib}>
        {lib}
      </code>
    )),
  ];

  return (
    <div className="flavour-only-ui-sdk">
      <p className="my-3.5 font-medium text-base text-muted-foreground leading-[22px]">
        {builtOn.length > 0 ? (
          <>
            The UI SDK flavour is built on{" "}
            {builtOn.map((node, i) => (
              <React.Fragment key={`sep-${i.toString()}`}>
                {i > 0 && (i === builtOn.length - 1 ? " and " : ", ")}
                {node}
              </React.Fragment>
            ))}
            .
          </>
        ) : (
          <>The UI SDK flavour is plain markup and styles, the same file as the Base UI flavour.</>
        )}{" "}
        Its API is the SevenUI wrapper&apos;s, the same in both flavours: export names, props,{" "}
        <code className={INLINE_CODE}>data-slot</code> values and the <code className={INLINE_CODE}>render</code> prop, so code
        that uses only the SevenUI exports compiles against either flavour.{" "}
        {notes.length > 0
          ? "What behaves differently, and any prop that is ignored or not supported, is listed below; code that imports a Base UI or third-party library directly needs changes."
          : "Nothing a reader would notice behaves differently."}{" "}
        Switch to Base UI to read the prop tables, which describe that shared API in Base UI&apos;s terms.
      </p>
      {notes.length > 0 && (
        <>
          <h3 className="mt-8 mb-2 font-display font-medium text-base text-foreground leading-6 tracking-normal">
            Differences on UI SDK
          </h3>
          <ul className="my-4 list-disc ps-[1.625em]">
            {notes.map((note) => (
              <li className="my-1.5 ps-[0.375em] font-medium text-base text-muted-foreground leading-[22px]" key={note}>
                {withCode(note)}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
