import "server-only";

import { DemoTabs } from "../demo/demo-tabs";
import { PreviewPane } from "../demo/preview-pane";
import { sourcePane } from "../demo/source-pane";

// Reading the demo source, highlighting it and wrapping it in a <CodeBlock>
// used to live here; Task 4.2 moved all three into
// `components/demo/source-pane.tsx` unchanged, because the `/components`
// gallery's example card needs exactly the same three steps against
// `packages/registry/components/` instead of `packages/registry/demos/`.
// `sourcePane()` is a plain async function, not a component, so the element
// tree this file builds is the same one it built before the extraction.

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

  return (
    <DemoTabs
      code={await sourcePane(`demos/${demoPath}.tsx`)}
      preview={
        <PreviewPane contain={contain}>
          <Demo />
        </PreviewPane>
      }
    />
  );
}
