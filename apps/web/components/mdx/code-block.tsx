"use client";

import * as React from "react";
import { CopyButton } from "./copy-button";
import { currentPackageManager, type PackageManager } from "../../lib/package-manager";

function cx(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(" ");
}

// Pretty-prints a fence's language for the header label (`tsx` -> `TSX`).
// Exactly the four languages the corpus ever fences (lib/shiki.ts): tsx,
// css, bash, json (72/2/2/1 uses) — the value is already pretty-cased here,
// not transformed by CSS (measured header text is not `text-transform:
// uppercase`).
const LANGUAGE_LABELS: Record<string, string> = {
  tsx: "TSX",
  css: "CSS",
  bash: "Bash",
  json: "JSON",
};

// Inline brand-mark path data (measured-lang-icons.json), the same move
// Task 1.8 made for the GitHub mark when `lucide-react` had no equivalent:
// Blume injected these with a build-time transformer this migration
// retires, and JSON/Bash/CSS3/React have no lucide glyph, so the only route
// to an empty visual diff is inlining the geometry. `class="blume-lang-icon"`
// on the source markup is dropped rather than carried over — Step 3's "no
// new bespoke class names" rule — and its job (14px, currentColor) is done
// instead by the wrapping <span> below.
const LANGUAGE_ICON_PATHS: Record<string, string> = {
  json: "M12.043 23.968c.479-.004.953-.029 1.426-.094a11.805 11.805 0 003.146-.863 12.404 12.404 0 003.793-2.542 11.977 11.977 0 002.44-3.427 11.794 11.794 0 001.02-3.476c.149-1.16.135-2.346-.045-3.499a11.96 11.96 0 00-.793-2.788 11.197 11.197 0 00-.854-1.617c-1.168-1.837-2.861-3.314-4.81-4.3a12.835 12.835 0 00-2.172-.87h-.005c.119.063.24.132.345.201.12.074.239.146.351.225a8.93 8.93 0 011.559 1.33c1.063 1.145 1.797 2.548 2.218 4.041.284.982.434 1.998.495 3.017.044.743.044 1.491-.047 2.229-.149 1.27-.554 2.51-1.228 3.596a7.475 7.475 0 01-1.903 2.084c-1.244.928-2.877 1.482-4.436 1.114a3.916 3.916 0 01-.748-.258 4.692 4.692 0 01-.779-.45 6.08 6.08 0 01-1.244-1.105 6.507 6.507 0 01-1.049-1.747 7.366 7.366 0 01-.494-2.54c-.03-1.273.225-2.553.854-3.67a6.43 6.43 0 011.663-1.918c.225-.178.464-.333.704-.479l.016-.007a5.121 5.121 0 00-1.441-.12 4.963 4.963 0 00-1.228.24c-.359.12-.704.27-1.019.45a6.146 6.146 0 00-.733.494c-.211.18-.42.36-.615.555-1.123 1.153-1.768 2.682-2.022 4.256-.15.973-.15 1.96-.091 2.95.105 1.395.391 2.787.945 4.062a8.518 8.518 0 001.348 2.173 8.14 8.14 0 003.132 2.23 7.934 7.934 0 002.113.54c.074.015.149.015.209.015zm-2.934-.398a4.102 4.102 0 01-.45-.228 8.5 8.5 0 01-2.038-1.534c-1.094-1.137-1.827-2.566-2.247-4.08a15.184 15.184 0 01-.495-3.172 12.14 12.14 0 01.046-2.082c.135-1.257.495-2.501 1.124-3.58a6.889 6.889 0 011.783-2.053 6.23 6.23 0 011.633-.9 5.363 5.363 0 013.522-.045c.029 0 .029 0 .045.03.015.015.045.015.06.03.045.016.104.045.165.074.239.12.479.271.704.42a6.294 6.294 0 012.097 2.502c.42.914.615 1.934.631 2.938.014 1.079-.18 2.157-.645 3.146a6.42 6.42 0 01-2.638 2.832c.09.03.18.045.271.075.225.044.449.074.688.074 1.468.045 2.892-.66 3.94-1.647.195-.18.375-.375.54-.585.225-.27.435-.54.614-.823.239-.375.435-.75.614-1.154a8.112 8.112 0 00.509-1.664c.196-1.004.211-2.022.149-3.026-.135-2.022-.673-4.045-1.842-5.724a9.054 9.054 0 00-.555-.719 9.868 9.868 0 00-1.063-1.034 8.477 8.477 0 00-1.363-.915 9.927 9.927 0 00-1.692-.598l-.3-.06c-.209-.03-.42-.044-.634-.06a8.453 8.453 0 00-1.015.016c-.704.045-1.412.16-2.112.337C5.799 1.227 2.863 3.566 1.3 6.67A11.834 11.834 0 00.238 9.801a11.81 11.81 0 00-.104 3.775c.12 1.02.374 2.023.778 2.977.227.57.511 1.124.825 1.648 1.094 1.783 2.683 3.236 4.51 4.24.688.39 1.408.69 2.157.944.226.074.45.15.689.21z",
  bash: "M21.038,4.9l-7.577-4.498C13.009,0.134,12.505,0,12,0c-0.505,0-1.009,0.134-1.462,0.403L2.961,4.9 C2.057,5.437,1.5,6.429,1.5,7.503v8.995c0,1.073,0.557,2.066,1.462,2.603l7.577,4.497C10.991,23.866,11.495,24,12,24 c0.505,0,1.009-0.134,1.461-0.402l7.577-4.497c0.904-0.537,1.462-1.529,1.462-2.603V7.503C22.5,6.429,21.943,5.437,21.038,4.9z M15.17,18.946l0.013,0.646c0.001,0.078-0.05,0.167-0.111,0.198l-0.383,0.22c-0.061,0.031-0.111-0.007-0.112-0.085L14.57,19.29 c-0.328,0.136-0.66,0.169-0.872,0.084c-0.04-0.016-0.057-0.075-0.041-0.142l0.139-0.584c0.011-0.046,0.036-0.092,0.069-0.121 c0.012-0.011,0.024-0.02,0.036-0.026c0.022-0.011,0.043-0.014,0.062-0.006c0.229,0.077,0.521,0.041,0.802-0.101 c0.357-0.181,0.596-0.545,0.592-0.907c-0.003-0.328-0.181-0.465-0.613-0.468c-0.55,0.001-1.064-0.107-1.072-0.917 c-0.007-0.667,0.34-1.361,0.889-1.8l-0.007-0.652c-0.001-0.08,0.048-0.168,0.111-0.2l0.37-0.236 c0.061-0.031,0.111,0.007,0.112,0.087l0.006,0.653c0.273-0.109,0.511-0.138,0.726-0.088c0.047,0.012,0.067,0.076,0.048,0.151 l-0.144,0.578c-0.011,0.044-0.036,0.088-0.065,0.116c-0.012,0.012-0.025,0.021-0.038,0.028c-0.019,0.01-0.038,0.013-0.057,0.009 c-0.098-0.022-0.332-0.073-0.699,0.113c-0.385,0.195-0.52,0.53-0.517,0.778c0.003,0.297,0.155,0.387,0.681,0.396 c0.7,0.012,1.003,0.318,1.01,1.023C16.105,17.747,15.736,18.491,15.17,18.946z M19.143,17.859c0,0.06-0.008,0.116-0.058,0.145 l-1.916,1.164c-0.05,0.029-0.09,0.004-0.09-0.056v-0.494c0-0.06,0.037-0.093,0.087-0.122l1.887-1.129 c0.05-0.029,0.09-0.004,0.09,0.056V17.859z M20.459,6.797l-7.168,4.427c-0.894,0.523-1.553,1.109-1.553,2.187v8.833 c0,0.645,0.26,1.063,0.66,1.184c-0.131,0.023-0.264,0.039-0.398,0.039c-0.42,0-0.833-0.114-1.197-0.33L3.226,18.64 c-0.741-0.44-1.201-1.261-1.201-2.142V7.503c0-0.881,0.46-1.702,1.201-2.142l7.577-4.498c0.363-0.216,0.777-0.33,1.197-0.33 c0.419,0,0.833,0.114,1.197,0.33l7.577,4.498c0.624,0.371,1.046,1.013,1.164,1.732C21.686,6.557,21.12,6.411,20.459,6.797z",
  css: "M1.5 0h21l-1.91 21.563L11.977 24l-8.565-2.438L1.5 0zm17.09 4.413L5.41 4.41l.213 2.622 10.125.002-.255 2.716h-6.64l.24 2.573h6.182l-.366 3.523-2.91.804-2.956-.81-.188-2.11h-2.61l.29 3.855L12 19.288l5.373-1.53L18.59 4.414z",
  tsx: "M14.23 12.004a2.236 2.236 0 0 1-2.235 2.236 2.236 2.236 0 0 1-2.236-2.236 2.236 2.236 0 0 1 2.235-2.236 2.236 2.236 0 0 1 2.236 2.236zm2.648-10.69c-1.346 0-3.107.96-4.888 2.622-1.78-1.653-3.542-2.602-4.887-2.602-.41 0-.783.093-1.106.278-1.375.793-1.683 3.264-.973 6.365C1.98 8.917 0 10.42 0 12.004c0 1.59 1.99 3.097 5.043 4.03-.704 3.113-.39 5.588.988 6.38.32.187.69.275 1.102.275 1.345 0 3.107-.96 4.888-2.624 1.78 1.654 3.542 2.603 4.887 2.603.41 0 .783-.09 1.106-.275 1.374-.792 1.683-3.263.973-6.365C22.02 15.096 24 13.59 24 12.004c0-1.59-1.99-3.097-5.043-4.032.704-3.11.39-5.587-.988-6.38-.318-.184-.688-.277-1.092-.278zm-.005 1.09v.006c.225 0 .406.044.558.127.666.382.955 1.835.73 3.704-.054.46-.142.945-.25 1.44-.96-.236-2.006-.417-3.107-.534-.66-.905-1.345-1.727-2.035-2.447 1.592-1.48 3.087-2.292 4.105-2.295zm-9.77.02c1.012 0 2.514.808 4.11 2.28-.686.72-1.37 1.537-2.02 2.442-1.107.117-2.154.298-3.113.538-.112-.49-.195-.964-.254-1.42-.23-1.868.054-3.32.714-3.707.19-.09.4-.127.563-.132zm4.882 3.05c.455.468.91.992 1.36 1.564-.44-.02-.89-.034-1.345-.034-.46 0-.915.01-1.36.034.44-.572.895-1.096 1.345-1.565zM12 8.1c.74 0 1.477.034 2.202.093.406.582.802 1.203 1.183 1.86.372.64.71 1.29 1.018 1.946-.308.655-.646 1.31-1.013 1.95-.38.66-.773 1.288-1.18 1.87-.728.063-1.466.098-2.21.098-.74 0-1.477-.035-2.202-.093-.406-.582-.802-1.204-1.183-1.86-.372-.64-.71-1.29-1.018-1.946.303-.657.646-1.313 1.013-1.954.38-.66.773-1.286 1.18-1.868.728-.064 1.466-.098 2.21-.098zm-3.635.254c-.24.377-.48.763-.704 1.16-.225.39-.435.782-.635 1.174-.265-.656-.49-1.31-.676-1.947.64-.15 1.315-.283 2.015-.386zm7.26 0c.695.103 1.365.23 2.006.387-.18.632-.405 1.282-.66 1.933-.2-.39-.41-.783-.64-1.174-.225-.392-.465-.774-.705-1.146zm3.063.675c.484.15.944.317 1.375.498 1.732.74 2.852 1.708 2.852 2.476-.005.768-1.125 1.74-2.857 2.475-.42.18-.88.342-1.355.493-.28-.958-.646-1.956-1.1-2.98.45-1.017.81-2.01 1.085-2.964zm-13.395.004c.278.96.645 1.957 1.1 2.98-.45 1.017-.812 2.01-1.086 2.964-.484-.15-.944-.318-1.37-.5-1.732-.737-2.852-1.706-2.852-2.474 0-.768 1.12-1.742 2.852-2.476.42-.18.88-.342 1.356-.494zm11.678 4.28c.265.657.49 1.312.676 1.948-.64.157-1.316.29-2.016.39.24-.375.48-.762.705-1.158.225-.39.435-.788.636-1.18zm-9.945.02c.2.392.41.783.64 1.175.23.39.465.772.705 1.143-.695-.102-1.365-.23-2.006-.386.18-.63.406-1.282.66-1.933zM17.92 16.32c.112.493.2.968.254 1.423.23 1.868-.054 3.32-.714 3.708-.147.09-.338.128-.563.128-1.012 0-2.514-.807-4.11-2.28.686-.72 1.37-1.536 2.02-2.44 1.107-.118 2.154-.3 3.113-.54zm-11.83.01c.96.234 2.006.415 3.107.532.66.905 1.345 1.727 2.035 2.446-1.595 1.483-3.092 2.295-4.11 2.295-.22-.005-.406-.05-.553-.132-.666-.38-.955-1.834-.73-3.703.054-.46.142-.944.25-1.438zm4.56.64c.44.02.89.034 1.345.034.46 0 .915-.01 1.36-.034-.44.572-.895 1.095-1.345 1.565-.455-.47-.91-.993-1.36-1.565z",
};

function LanguageIcon({ language }: { language: string }) {
  const path = LANGUAGE_ICON_PATHS[language];
  if (!path) return null;
  return (
    <svg aria-hidden="true" fill="currentColor" height="14" viewBox="0 0 24 24" width="14">
      <path d={path} />
    </svg>
  );
}

export type CodeBlockProps = React.ComponentPropsWithoutRef<"pre"> & {
  /**
   * Task 2.7 extension. Overrides the language normally read off the single
   * fenced `<code>` child's own `language-<lang>` class. <InstallCommand>'s
   * `children` is an ARRAY of four `.pm-only-<pm>` variants (see
   * `installCommands` below), not one element with a class to read, so it
   * has to say its own language plainly. Plain data (a string), not a
   * function — doesn't reopen any server/client boundary.
   */
  language?: string;
  /**
   * Task 2.7 extension. Rendered at the trailing edge of the existing
   * header band (inside the same `pr-13` gutter reserved for the copy
   * button), pushed there with `ml-auto`. ADDITIVE, not a replacement for
   * `label` — the brief's `header` prop implied swapping the language label
   * out entirely, but nothing in this stage measures what that should look
   * like, and the language label (`Bash`, its icon) is still true and
   * useful information for an install command. Only <InstallCommand>'s
   * `<PackageManagerMenu>` passes this today.
   */
  headerRight?: React.ReactNode;
  /**
   * Task 2.7 extension. Plain-data command strings keyed by package
   * manager. When present, `children` is treated as the array of
   * `.pm-only-<pm>` variant elements <InstallCommand> renders (four
   * highlighted commands, CSS reveals one via `[data-pm]` — see
   * globals.css) rather than a single fenced `<code>` to clone/ref.
   *
   * The built-in copy button switches from reading `codeRef.current
   * .textContent` (which would concatenate all four variants — `.pm-only`'s
   * `display: none` does not stop `textContent` from including a hidden
   * element's text) to reading this object keyed by the LIVE
   * `document.documentElement.dataset.pm` at click time
   * (`currentPackageManager()`, lib/package-manager.ts) — the same
   * attribute CSS already keys off, so the two can never disagree. No
   * function prop crosses the server/client boundary to get here: this
   * object is plain data handed from the async server component
   * <InstallCommand>, and the DOM read happens entirely inside this
   * already-`"use client"` component's own click handler.
   *
   * SCOPE (fix round 1, task-2.7 review MINOR 2): this prop has exactly ONE
   * consumer today, <InstallCommand>. It is not a generic "command with
   * variants" mechanism other surfaces are expected to adopt — §6.1's table
   * gives the other two install surfaces their OWN shapes (`/blocks`' fused
   * 32px control; Stage 4's `copy-command.tsx`, which §13.2 says "keeps its
   * shape" and takes `command: string`, not a `Record<PackageManager,
   * string>`). What IS shared across those surfaces is
   * `<PackageManagerMenu>` and `currentPackageManager()`
   * (lib/package-manager.ts) — reuse those, not this prop, if a future
   * stage needs the same four-command switch elsewhere.
   */
  installCommands?: Record<PackageManager, string>;
};

type ClonableCodeProps = { className?: string; tabIndex?: number } & React.RefAttributes<HTMLElement>;

// The shared code-block primitive (task-2.4 brief step 4) for both
// producers this stage has: MDX fences (via mdx-components.tsx's `pre`
// override) and, later, <InstallCommand> (Task 2.7). `blume-source` is not
// ported — its one job was making the <pre> a non-scrolling flex column so
// an absolutely-pinned copy button never drifted, sized off the preview
// iframe's postMessage height; demos render inline now, so that contract is
// gone. Here the <code> itself is the scroller (max-h-96 + overflow-auto on
// both axes) and the <pre> stays a static, bordered box, which is what keeps
// the pinned button from drifting without any iframe-height plumbing.
//
// The language is read off the highlighted <code> child's own
// `language-<lang>` class (next.config.ts's `addLanguageClass: true`, a
// Task 2.4 amendment to the Task 2.3 rehype chain) rather than a
// `data-language` prop: `@shikijs/rehype` has no plain-data option that
// writes `data-language` on the `<pre>` directly, and every route that
// could (`transformers`, `parseMetaString`) is function-valued and
// forbidden under Turbopack's loader-option constraint.
//
// FUTURE FALLBACK SEAM (proof obligation #2, tested at Task 2.6): if
// `@shikijs/rehype` turns out unusable under Turbopack, its declared
// fallback is "highlighting moves to an async RSC pre/code override" that
// calls lib/shiki.ts's `highlight()` itself and injects the resulting HTML.
// That swap lands entirely in mdx-components.tsx's `code` override (the one
// place that decides what `children` is before it reaches this component) —
// for the FENCE path, CodeBlock never inspects or produces raw HTML itself;
// it only clones whatever single child element it is given and reads that
// child's `.textContent` through a ref. Swapping the override to render
// `dangerouslySetInnerHTML` output instead of JSX from the rehype chain
// touches that one function, not this component.
//
// Task 2.7 gives this component a SECOND producer/shape, `installCommands`
// (see CodeBlockProps below): `children` becomes an array of four
// `.pm-only-<pm>` elements instead of one fenced `<code>`, and the copy
// button reads a plain-data object keyed by the live `[data-pm]` attribute
// instead of a ref's `.textContent`. Both paths still share every other
// piece of chrome (header band, language icon, scroll box, `<CopyButton>`)
// — nothing about the fence path above changed.
export function CodeBlock({
  children,
  className,
  language: languageProp,
  headerRight,
  installCommands,
  tabIndex: _tabIndex,
  ...rest
}: CodeBlockProps) {
  const codeRef = React.useRef<HTMLElement>(null);

  // installCommands mode (Task 2.7): children is the four-element
  // `.pm-only-<pm>` array, not a single fenced <code> — never read a
  // language-<lang> class off it, and never take the single-child clone
  // path below.
  const codeElement =
    !installCommands && React.isValidElement<ClonableCodeProps>(children) ? children : undefined;
  const languageMatch = /(?:^|\s)language-(\w+)/.exec(codeElement?.props.className ?? "");
  const language = languageProp ?? languageMatch?.[1];
  const label = language ? (LANGUAGE_LABELS[language] ?? language.toUpperCase()) : undefined;
  const hasIcon = language !== undefined && language in LANGUAGE_ICON_PATHS;

  // Every one of the four variants gets the same scroll/padding treatment a
  // single fenced <code> would — only one is ever visible at once (CSS), so
  // applying it uniformly costs nothing and keeps whichever one is revealed
  // properly scrollable. tabIndex=0 on a `display: none` element is inert
  // (out of the tab order regardless), so setting it on all four is safe.
  const codeChild = installCommands
    ? React.Children.map(children, (child) =>
        React.isValidElement<ClonableCodeProps>(child)
          ? React.cloneElement(child, {
              tabIndex: 0,
              className: cx("block max-h-96 overflow-auto px-5 pb-1.5", child.props.className),
            })
          : child,
      )
    : codeElement
      ? React.cloneElement(codeElement, {
          ref: codeRef,
          tabIndex: 0,
          className: cx("block max-h-96 overflow-auto px-5 pb-1.5", codeElement.props.className),
        })
      : children;

  // installCommands mode reads the currently-revealed command straight from
  // plain data + the live `[data-pm]` attribute, rather than the ref's
  // `.textContent` — `.textContent` ignores `display: none` and would
  // concatenate all four hidden variants into one clipboard write.
  const getCopyText = installCommands
    ? () => installCommands[currentPackageManager()] ?? ""
    : () => codeRef.current?.textContent ?? "";

  return (
    <pre
      {...rest}
      data-language={language}
      className={cx(
        "group relative my-6 overflow-auto rounded-md border border-border bg-transparent pb-4 text-[0.8125rem] leading-[1.55]",
        label || headerRight ? "pt-15" : "pt-4",
        className,
      )}
    >
      {label || headerRight ? (
        <div
          // Only decorative (a duplicate of data-language) when it's just
          // the plain label, same as before. Once `headerRight` carries a
          // real control (<PackageManagerMenu>), the band holds focusable
          // content and must stay out of the accessibility tree's hidden
          // subtree, so aria-hidden is dropped in that case.
          aria-hidden={headerRight ? undefined : true}
          className={cx(
            "absolute inset-x-0 top-0 flex h-11 items-center border-b border-border pr-13 font-sans text-xs font-medium text-muted-foreground",
            hasIcon ? "pl-10" : "pl-4",
          )}
        >
          {label}
          {headerRight ? <div className="ml-auto flex items-center">{headerRight}</div> : null}
        </div>
      ) : null}
      {hasIcon && language ? (
        <span aria-hidden="true" className="absolute top-3.5 left-4 size-3.5 text-muted-foreground">
          <LanguageIcon language={language} />
        </span>
      ) : null}
      {codeChild}
      <CopyButton getText={getCopyText} />
    </pre>
  );
}
