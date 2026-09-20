import * as React from "react";
import type { MDXComponents } from "mdx/types";
import { CodeBlock } from "./components/mdx/code-block";
import { Component } from "./components/mdx/component";
import { InstallCommand } from "./components/mdx/install-command";

function cx(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(" ");
}

// -----------------------------------------------------------------------
// The nine element overrides (task-2.4 brief step 1), values read from
// getComputedStyle on a live docs page (step 2), not from Blume's override
// file — Blume only overrides SOME properties on each of these and the rest
// fall through to the Typography plugin's defaults, so the rendered value
// is a merge. There is no `.prose` class anywhere in this port (load-bearing
// for Task 2.6's isolation rules): body typography (0.875rem/1.7,
// muted-foreground) is redistributed onto `p`, `li` and `td` directly
// instead of a container rule.
//
// Absent from all 68 corpus files, and therefore absent from this map on
// purpose: h1, h4-h6, blockquote, hr, ordered lists, images, em,
// strikethrough, task lists, HTML comments. lib/docs/elements.ts asserts
// this at build time so a future file introducing one of them is a build
// failure, not a silently unstyled page.
// -----------------------------------------------------------------------

function P({ className, ...props }: React.ComponentPropsWithoutRef<"p">) {
  return <p className={cx("my-4 text-[0.875rem] text-muted-foreground leading-[1.7]", className)} {...props} />;
}

// Heading anchor utility list, copied verbatim from the brief (§4.7,
// §17.6 #5) — expressed as plain Tailwind utilities, not a bespoke
// `.blume-heading-anchor` class, so it survives the Turbopack
// plain-data constraint the same way the table-scroll wrapper below does.
const HEADING_ANCHOR_CLASSES =
  "text-inherit font-inherit no-underline after:content-['#'] after:ms-[0.35em] after:text-muted-foreground after:opacity-0 after:transition-opacity after:duration-150 hover:after:opacity-100 focus-visible:after:opacity-100";

// `rehype-slug` -> `rehype-autolink-headings({behavior: "wrap"})` (Task 2.3,
// locked) wraps a heading's entire content in a self-linking `<a href="#id">`
// with no distinguishing className of its own. That wrapped anchor is still
// dispatched through this file's own `a` override below (MDX applies `a`
// uniformly to every anchor in the tree), so `A` must let an explicit
// `className` win over its own default prose-link styling — this function
// clones that single child and REPLACES its className with the heading-
// anchor utilities, and `A`'s `className ?? DEFAULT` fallback is what makes
// the replacement actually take effect instead of being clobbered back to
// the dotted-underline prose style.
function withHeadingAnchor(children: React.ReactNode): React.ReactNode {
  if (!React.isValidElement(children)) return children;
  return React.cloneElement(children as React.ReactElement<{ className?: string }>, {
    className: HEADING_ANCHOR_CLASSES,
  });
}

function H2({ className, children, ...props }: React.ComponentPropsWithoutRef<"h2">) {
  return (
    <h2
      className={cx(
        "mt-12 mb-[30px] font-display text-3xl font-medium tracking-tighter text-foreground break-words first:mt-0",
        className,
      )}
      {...props}
    >
      {withHeadingAnchor(children)}
    </h2>
  );
}

// `margin-top` is NOT a flat `mt-0`: Typography's `h2 + * { margin-top: 0 }`
// only zeroes an `h3` that directly follows an `h2` (96 of 260 corpus
// headings) — the other 163 (after a paragraph, a table, a `<Component>`,
// or another `h3`) measure 32px (measured-docs-computed-styles.json:
// `button.h3.marginTop` is 0px directly after `## Examples`,
// `sidebar.h3.marginTop` is 32px after a paragraph). `[h2+&]:mt-0`
// reproduces that sibling-combinator rule instead of a flat value, and is
// deliberately not left to margin collapsing — a collapsed `p`/`mb-4` +
// `h3`/`mt-8` would land on 32px after an `h2` where live gives 30px
// (`h2`'s own `mb-[30px]`), since collapsing takes the larger of the two
// margins rather than the following element's own reset.
function H3({ className, children, ...props }: React.ComponentPropsWithoutRef<"h3">) {
  return (
    <h3
      className={cx(
        "mt-8 mb-3 font-display text-xl leading-[1.35] font-medium tracking-tighter text-foreground break-words [h2+&]:mt-0",
        className,
      )}
      {...props}
    >
      {withHeadingAnchor(children)}
    </h3>
  );
}

const DEFAULT_A_CLASSES =
  "font-medium text-foreground underline decoration-1 decoration-dotted underline-offset-[0.2em]";

function A({ className, ...props }: React.ComponentPropsWithoutRef<"a">) {
  return <a className={className ?? DEFAULT_A_CLASSES} {...props} />;
}

// `text-foreground` is required, not decorative: `strong`'s parent (`p`) is
// muted-foreground, and without an explicit color override `<strong>` would
// inherit that muted tone instead of standing out (measured: `strong.color`
// is foreground while its parent `p` is muted-foreground — Typography's
// `--tw-prose-bold`). 90 uses across 17 files.
function Strong({ className, ...props }: React.ComponentPropsWithoutRef<"strong">) {
  return <strong className={cx("font-semibold text-foreground", className)} {...props} />;
}

// Inline code (`` `x` ``) and the block code shiki produces inside a <pre>
// both compile through this same `code` override — MDX dispatches `code`
// uniformly regardless of nesting. CommonMark inline code spans never carry
// nested markup, so their children is always a bare string; the shiki
// fragment's <code> always carries a non-string children (an array of
// `<span class="line">` elements). That is the distinguishing test.
// Forwards its ref so CodeBlock (the `pre` override, below) can attach a
// ref to the real DOM node for the copy button's `.textContent` read.
const INLINE_CODE_CLASSES =
  "rounded-[0.3rem] bg-[oklch(0.99_0_0)] px-[0.35em] py-[0.15em] font-mono text-[0.875em] font-medium text-foreground dark:bg-[oklch(0.12_0_0)]";

const Code = React.forwardRef<HTMLElement, React.ComponentPropsWithoutRef<"code">>(function Code(
  { children, className, ...props },
  ref,
) {
  const isInline = typeof children === "string";
  return (
    <code ref={ref} className={isInline ? cx(INLINE_CODE_CLASSES, className) : className} {...props}>
      {children}
    </code>
  );
});

// Table scroll wrapper, produced by THIS element override (not a rehype
// plugin), utilities copied verbatim from the brief (§4.7, §17.6 #5) with
// one correction: the brief's string uses `rounded-lg`, but this port's
// `--radius` is 0.625rem, so `--radius-lg` resolves to 10px while BOTH
// measured artifacts (`tableWrapper` and the visible `pre`) report an
// 8px border-radius — that is `--radius-md` in this theme, not
// `--radius-lg`. Matching the measured 8px over the brief's literal string
// per this task's own instruction to report (not silently pick) a
// disagreement between the two.
const TABLE_WRAPPER_CLASSES =
  "my-6 overflow-x-auto rounded-md border border-border [&>table]:m-0 [&_th]:whitespace-nowrap [&_th]:px-3 [&_th]:py-2 [&_td]:px-3 [&_td]:py-2";

// `table` itself carries only structural styling (width, border-collapse,
// font-size/line-height) — the binding-constraint trio (font-size,
// color, line-height as body typography) lands on `Td`, not here, and not
// on `TABLE_WRAPPER_CLASSES`'s div either. Nothing inheritable sits on an
// ancestor of a demo (Task 2.6 Step 3(a)'s premise) even though no
// `<Component>`/`<InstallCommand>` is nested in a table cell today.
function Table({ className, ...props }: React.ComponentPropsWithoutRef<"table">) {
  return (
    <div className={TABLE_WRAPPER_CLASSES}>
      <table className={cx("w-full border-collapse text-[0.8125rem] leading-[22.2858px]", className)} {...props} />
    </div>
  );
}

function Th({ className, ...props }: React.ComponentPropsWithoutRef<"th">) {
  return <th className={cx("text-start font-semibold text-foreground", className)} {...props} />;
}

// Body typography (0.875rem/1.7, muted-foreground) lands here — same rule
// as `p`/`li`, never on `table`/`Table`'s wrapper div (Task 2.6 Step 3(a)).
// font-size/line-height on `td` here are the table's own measured values
// (0.8125rem/22.2858px), distinct from `p`'s 0.875rem/1.7 — `table`'s own
// scale, not the body scale, which is why this isn't merged with `P`.
function Td({ className, ...props }: React.ComponentPropsWithoutRef<"td">) {
  return <td className={cx("text-[0.8125rem] text-muted-foreground leading-[22.2858px]", className)} {...props} />;
}

// Structural only (margin, marker indent) — body typography (font-size,
// color, line-height) lands on `Li`, not here, so nothing inheritable sits
// on an ancestor of a demo (Task 2.6 Step 3(a)'s premise) even though no
// `<Component>`/`<InstallCommand>` is nested in a list today.
function Ul({ className, ...props }: React.ComponentPropsWithoutRef<"ul">) {
  return <ul className={cx("my-4 list-disc ps-[1.625em]", className)} {...props} />;
}

// Body typography (0.875rem/1.7, muted-foreground) lands here — same rule
// as `p`/`td`, never on `ul`/`Ul` (Task 2.6 Step 3(a)).
function Li({ className, ...props }: React.ComponentPropsWithoutRef<"li">) {
  return (
    <li
      className={cx("my-[7px] ps-[0.375em] text-[0.875rem] text-muted-foreground leading-[1.7]", className)}
      {...props}
    />
  );
}

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    p: P,
    h2: H2,
    h3: H3,
    a: A,
    strong: Strong,
    code: Code,
    pre: (props: React.ComponentPropsWithoutRef<"pre">) => <CodeBlock {...props} />,
    table: Table,
    th: Th,
    td: Td,
    ul: Ul,
    li: Li,
    InstallCommand,
    Component,

    // --- Seam for a later stage — DO NOT import before it exists ---
    // An import of a nonexistent module fails the whole build. Stage 3
    // adds `PrimitiveIndex` (the base-primitive cross-reference table);
    // lib/docs/elements.ts's JSX-tag assertion already allow-lists the
    // name, so wiring it in here is this map's only remaining step once
    // that stage lands. `InstallCommand` (Task 2.7) and `Component`
    // (Task 2.6) are both wired above, not here.
    // ----------------------------------------------------------------------
  };
}
