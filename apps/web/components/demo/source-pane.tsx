import "server-only";

import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { highlight } from "../../lib/shiki";
import { CodeBlock } from "../mdx/code-block";

/**
 * The Code half of a Preview/Code toggle: read one `.tsx` file out of
 * `packages/registry`, highlight it, and return the `<CodeBlock>` element
 * `<DemoTabs code={…}>` renders.
 *
 * Extracted from `components/mdx/component.tsx` at Task 4.2, unchanged in
 * behaviour. The `/components` gallery's example card (Task 4.2) needs the
 * same three steps against a different subdirectory of the same package, and
 * all three carry hard-won detail — the cwd anchor, the `<pre>`-unwrapping
 * regex and its fail-loud branch, and the class overrides plus the `shiki`
 * class on the `<code>` — so the two call sites share this rather than each
 * keeping a copy.
 *
 * Anchored on `process.cwd()`, the same rule Task 2.1 fixed for
 * `lib/docs/index.ts`'s `DOCS_DIR`: a source-relative path
 * (`import.meta.url`) would resolve inside `.next/server/chunks/…` in a
 * bundled server build, not the repo. At build time cwd is `apps/web`, so
 * the package is two levels up (`packages/registry` sits next to `apps` at
 * the repo root).
 */
const REGISTRY_DIR = path.join(process.cwd(), "../../packages/registry");

/**
 * Read one source file out of `packages/registry`. Module-private: the only
 * caller is `sourcePane()` below, and this module's whole exported surface
 * is that one function — a reader with no highlighting is not a thing any
 * page needs.
 *
 * @param relPath Path relative to `packages/registry`, extension included:
 *   `"demos/accordion-demo.tsx"`, `"components/button/button-01.tsx"`.
 */
async function readRegistrySource(relPath: string): Promise<string> {
  const fullPath = path.join(REGISTRY_DIR, relPath);
  try {
    if (!(await stat(fullPath)).isFile()) throw new Error("not a file");
  } catch {
    throw new Error(
      `components/demo/source-pane.tsx: expected a registry source file at "${fullPath}" but found none. ` +
        `This path is process.cwd() + "../../packages/registry/${relPath}"; process.cwd() ` +
        `is currently "${process.cwd()}". Run the build/dev server with cwd = apps/web.`,
    );
  }
  return readFile(fullPath, "utf8");
}

// shiki's "classic" structure (lib/shiki.ts's default) returns a complete
// `<pre class="shiki …" style="…" tabindex="0"><code>…</code></pre>`
// fragment, with each line as its own `<span class="line">` separated by a
// real newline character. Nesting that `<pre>` inside CodeBlock's own
// `<pre>` would be invalid (same reasoning as components/mdx/
// install-command.tsx), so only the `<code>` element's inner HTML is kept
// and re-wrapped in a plain `<code>` that CodeBlock clones exactly the way
// it clones a fenced MDX code block. "inline" structure
// (install-command.tsx's choice) is NOT used here: it renders line breaks
// as literal `<br>` elements instead of separate line spans, which would
// silently swallow newlines from CodeBlock's copy button
// (`codeRef.current.textContent`, which returns "" for a `<br>`) —
// invisible for install-command's single-line bash commands, but wrong for
// a multi-line source file. Regex extraction is safe here because the
// input is this file's own build-time shiki output, never user input —
// the same trust boundary install-command.tsx's dangerouslySetInnerHTML
// already relies on.
//
// Fix round 1, MINOR 1 (ruled up, task 2.6): fails loud instead of no-op-ing
// if the output shape ever changes (e.g. a Shiki upgrade adds an attribute
// to its `<code>`, which the bare-tag regex wouldn't match) — a silently
// unmatched replace would inject the WHOLE `<pre>` inside CodeBlock's own
// `<pre>`, invalid nesting with no error, which is exactly the class of
// bug this migration's standing posture (`useDrawer()`, `<JsonLd>`, the
// nav assertion) refuses to ship silently.
async function highlightSource(code: string): Promise<string> {
  const html = await highlight(code, "tsx", "classic");
  const match = /^<pre[^>]*><code>([\s\S]*)<\/code><\/pre>\s*$/.exec(html);
  if (!match) {
    throw new Error(
      "components/demo/source-pane.tsx: shiki's classic-structure output did not match the expected " +
        `"<pre ...><code>…</code></pre>" shape (got: ${html.slice(0, 120)}…). ` +
        "highlightSource()'s extraction regex needs updating to match the new shape.",
    );
  }
  return match[1] ?? "";
}

/**
 * A plain async function, NOT a component, and deliberately so: its caller
 * awaits it and passes the resulting element straight into `<DemoTabs
 * code={…}>`, so the rendered element tree is identical to the one
 * `component.tsx` built inline before this extraction. Returning an
 * `<SourcePane />` element instead would add a node to that tree, and this
 * app has already measured (see `preview-pane.tsx`'s header) that adding a
 * node near a demo shifts React's `useId` output for the demo itself.
 *
 * @param relPath Path relative to `packages/registry`, extension included.
 */
export async function sourcePane(relPath: string): Promise<React.ReactElement> {
  const highlighted = await highlightSource(await readRegistrySource(relPath));

  return (
    // Fix round 1, IMPORTANT 3 (task 2.6): `className` here forces
    // CodeBlock's own margin/radius/border utilities off (Tailwind v4's
    // trailing `!` modifier — same layer, wins regardless of class order)
    // so its `<pre>` sits flush inside DemoTabs' own bordered/rounded card
    // instead of doubling it. This follows the GALLERY's live shape
    // (a flush code block inside one outer bordered panel,
    // `legacy-components/example-card.astro`) rather than the docs
    // tab-panel's zeroed-padding/first-/last-child-margin-reset shape:
    // there is no wrapper padding to zero here (DemoTabs' code pane has
    // none of its own), so overriding CodeBlock's three spacing/border
    // utilities directly is the smaller, more local change, and it
    // doesn't require guessing at CodeBlock's internal child order
    // from outside.
    <CodeBlock className="my-0! rounded-none! border-0!" language="tsx">
      {/* Build-time shiki output only, never user input — see
          highlightSource above, the same trust boundary
          install-command.tsx's dangerouslySetInnerHTML already relies on.
          `shiki` (fix round 1, CRITICAL 2, task 2.6): globals.css's colour
          rules are `.shiki`/`.shiki span`, not an attribute selector — with
          Shiki's own `<pre class="shiki …">` wrapper stripped above,
          nothing carries that class into this tree unless this element
          declares it itself, exactly as install-command.tsx already does
          for its own stripped-wrapper case. `.shiki span` matches any
          descendant span of ANY ancestor with the class, so putting it
          here (this `<code>`, not CodeBlock's `<pre>`) is sufficient — a
          CodeBlock consumer that doesn't pass its own className has no
          other way to add it, since CodeBlock's `<pre>` only carries a
          className that flows in via `...rest`/`children`, never
          synthesizing "shiki" on its own. */}
      <code className="language-tsx shiki" dangerouslySetInnerHTML={{ __html: highlighted }} />
    </CodeBlock>
  );
}
