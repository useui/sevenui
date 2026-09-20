import "server-only";

import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { DemoTabs } from "../demo/demo-tabs";
import { PreviewPane } from "../demo/preview-pane";
import { highlight } from "../../lib/shiki";
import { CodeBlock } from "./code-block";

// Anchored on process.cwd(), the same rule Task 2.1 fixed for
// lib/docs/index.ts's DOCS_DIR: a source-relative path (import.meta.url)
// would resolve inside .next/server/chunks/… in a bundled server build,
// not the repo. This module cannot import lib/docs/index.ts's own helper
// (that file is out of this task's authorised scope), so the same pattern
// is re-implemented here rather than shared. At build time cwd is
// apps/web, so the demos are two levels up (verified: `packages/registry`
// sits next to `apps` at the repo root).
const DEMOS_DIR = path.join(process.cwd(), "../../packages/registry/demos");

async function readDemoSource(demoPath: string): Promise<string> {
  const fullPath = path.join(DEMOS_DIR, `${demoPath}.tsx`);
  try {
    if (!(await stat(fullPath)).isFile()) throw new Error("not a file");
  } catch {
    throw new Error(
      `components/mdx/component.tsx: expected a demo source file at "${fullPath}" but found none. ` +
        `This path is process.cwd() + "../../packages/registry/demos/${demoPath}.tsx"; process.cwd() ` +
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
// a multi-line demo source. Regex extraction is safe here because the
// input is this file's own build-time shiki output, never user input —
// the same trust boundary install-command.tsx's dangerouslySetInnerHTML
// already relies on.
//
// Fix round 1, MINOR 1 (ruled up): fails loud instead of no-op-ing if the
// output shape ever changes (e.g. a Shiki upgrade adds an attribute to its
// `<code>`, which the bare-tag regex wouldn't match) — a silently
// unmatched replace would inject the WHOLE `<pre>` inside CodeBlock's own
// `<pre>`, invalid nesting with no error, which is exactly the class of
// bug this migration's standing posture (`useDrawer()`, `<JsonLd>`, the
// nav assertion) refuses to ship silently.
async function highlightDemoSource(code: string): Promise<string> {
  const html = await highlight(code, "tsx", "classic");
  const match = /^<pre[^>]*><code>([\s\S]*)<\/code><\/pre>\s*$/.exec(html);
  if (!match) {
    throw new Error(
      "components/mdx/component.tsx: shiki's classic-structure output did not match the expected " +
        `"<pre ...><code>…</code></pre>" shape (got: ${html.slice(0, 120)}…). ` +
        "highlightDemoSource()'s extraction regex needs updating to match the new shape.",
    );
  }
  return match[1] ?? "";
}

// A server component (task-2.6 brief step 1). No forced client boundary:
// the 56 demos with no "use client" directive render with zero client JS,
// and the 81 that do carry it become client islands automatically (§7.1) —
// this component never imports "use client" itself.
//
// Step 2's `client:visible` is deliberately NOT reproduced here: an
// IntersectionObserver wrapper would itself have to be a Client Component,
// dragging all 137 demos back across the boundary and defeating the split
// this file exists to preserve. Hydration moves from on-scroll to on-load
// as a recorded, accepted consequence (§18 owns the resulting number) —
// reopen only if Stage 11 measures bad INP on a page with several
// interactive demos (`/docs/components/chart`, `/docs/components/button`).
//
// PROOF OBLIGATION #1, the import expression (three shapes measured, not
// guessed):
//   1. The brief's exact specifier, `@/registry/demos/${path}.tsx`, fails
//      — but not for the reason page.tsx's Task 2.5 comment predicts.
//      `@/*` resolves to `../../packages/registry/*` (tsconfig.json), so
//      that specifier doubles the segment to `packages/registry/registry/
//      demos/…`, which does not exist; Turbopack itself DID build the
//      aliased dynamic-import context fine (its own error message shows
//      "Import map: aliased to relative '../../packages/registry/
//      registry/demos/'") — the failure is a wrong path in the brief's own
//      snippet, not a Turbopack/alias limitation. §7.1's own text already
//      covers this: "the import expression changes, not §7.1's decision."
//   2. A path-corrected alias, `@/demos/${path}.tsx` (no doubled
//      segment), was then tried as the more interesting test of Task
//      2.5's actual claim ("Turbopack needs a literal relative prefix,
//      not an alias… deliberately not usable here"). It COMPILED and
//      RESOLVED — `pnpm --filter @sevenui/web build` reached real
//      prerendered HTML (verified: /docs/components/select's built HTML
//      contains select-demo's actual `role="combobox"` markup) through
//      this alias. That measurement contradicts the premise in page.tsx's
//      comment; task-2.6-report.md flags it for review rather than
//      editing that file (out of this task's authorised scope).
//   3. Despite (2) working, this file ships the literal relative form
//      below, for consistency with the one other dynamic-import call
//      site in this app (page.tsx) and because it is what the brief's own
//      fallback text anticipates. The `../` count is pinned, not lucky:
//      3 levels ("../../../packages/registry/demos/…", the count in this
//      dispatch's own prose) fails to resolve — this file lives at
//      apps/web/components/mdx/, four directories below the repo root
//      (mdx, components, web, apps), not three — and 5 levels also fails
//      (climbs past the repo root). Only 4 resolves; both neighbours were
//      built and failed with "Module not found" to prove it.
export async function Component({ path: demoPath, contain = false }: { path: string; contain?: boolean }) {
  const { default: Demo } = await import(`../../../../packages/registry/demos/${demoPath}.tsx`);
  const source = await readDemoSource(demoPath);
  const highlighted = await highlightDemoSource(source);

  return (
    <DemoTabs
      code={
        // Fix round 1, IMPORTANT 3: `className` here forces CodeBlock's own
        // `my-6`/`rounded-md`/`border` off (Tailwind v4's trailing `!`
        // modifier — same layer, wins regardless of class order) so its
        // `<pre>` sits flush inside DemoTabs' own bordered/rounded card
        // instead of doubling it. This follows the GALLERY's live shape
        // (a flush code block inside one outer bordered panel,
        // `legacy-components/example-card.astro`) rather than the docs
        // tab-panel's `p-0!`/first-/last-child-margin-reset shape: there is
        // no wrapper padding to zero here (DemoTabs' code pane has none of
        // its own), so overriding CodeBlock's three spacing/border
        // utilities directly is the smaller, more local change, and it
        // doesn't require guessing at CodeBlock's internal child order
        // from outside.
        <CodeBlock className="my-0! rounded-none! border-0!" language="tsx">
          {/* Build-time shiki output only, never user input — see
              highlightDemoSource above, the same trust boundary
              install-command.tsx's dangerouslySetInnerHTML already relies on.
              `shiki` (fix round 1, CRITICAL 2): globals.css's colour rules
              are `.shiki`/`.shiki span`, not `[style*=shiki-light]` — with
              Shiki's own `<pre class="shiki …">` wrapper stripped above,
              nothing carries that class into this tree unless this element
              declares it itself, exactly as install-command.tsx's
              `<code className="pm-only pm-only-<pm> shiki">` already does
              for its own stripped-wrapper case. `.shiki span` matches any
              descendant span of ANY ancestor with the class, so putting it
              here (this `<code>`, not CodeBlock's `<pre>`) is sufficient — a
              CodeBlock consumer that doesn't pass its own className has no
              other way to add it, since CodeBlock's `<pre>` only carries a
              className that flows in via `...rest`/`children`, never
              synthesizing "shiki" on its own. */}
          <code className="language-tsx shiki" dangerouslySetInnerHTML={{ __html: highlighted }} />
        </CodeBlock>
      }
      preview={
        <PreviewPane contain={contain}>
          <Demo />
        </PreviewPane>
      }
    />
  );
}
