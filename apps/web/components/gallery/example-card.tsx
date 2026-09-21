import "server-only";

import CopyCommand from "../copy-command";
import { DemoTabs } from "../demo/demo-tabs";
import { PreviewPane } from "../demo/preview-pane";
import { sourcePane } from "../demo/source-pane";
import { packageManagerCommands } from "../../lib/package-manager";
import { installCommand } from "../../lib/registry";

/**
 * One gallery example, ported from `legacy-components/example-card.astro`:
 * an anchored heading, the Preview/Code toggle, the live example, its
 * highlighted source, and the install command that copies it.
 *
 * Almost none of that is written here, and that is the point. The toggle is
 * `<DemoTabs>` — the docs demos' component, whose tablist markup, tab
 * classes and panel wrapper were copied out of this very `.astro` file at
 * Task 2.6, so the two were already byte-identical; Task 4.2 gave it the
 * two optional props (`heading`, `className`) that are the whole remaining
 * difference rather than standing up a second toggle. The preview box is
 * `<PreviewPane>`, whose own class list was likewise copied from this file
 * and which names the gallery as its intended second consumer; adopting it
 * brings the `[data-sevenui-example]` layout box (§7.2b) and the
 * `[data-preset-scope]` applier (Task 2.8) along with it, which is brief
 * step 4. NOT §7.2c's typographic-root rule: task 11.1e (2026-09-21) scoped
 * that one to `article [data-sevenui-example]`, i.e. to the docs demos,
 * because it stands in for an iframe `<body>` and this surface never had a
 * frame — unscoped, its `line-height: normal` overrode the 24px the gallery
 * inherits live. §7.2b does apply here and has to: measured, scoping it the
 * same way collapses this page's `w-full` demos to content width. The code pane is `sourcePane()`, extracted from
 * `components/mdx/component.tsx` for this task.
 *
 * The one piece of the Astro original that does NOT come along is its
 * `<script>`: a single document-level delegated click listener toggling
 * `aria-selected` and `hidden` across every card on the page. `<DemoTabs>`
 * holds that in React state per card instead, so the `astro:page-load`
 * delegated-once pattern (§14.7) has nothing left to do.
 *
 * `data-example-card` is dropped with it (§13.3): it was the selector that
 * listener scoped itself with, it carried no CSS, and nothing else ever
 * read it.
 *
 * The outer `<section>` stays HERE rather than becoming a `<DemoTabs>`
 * prop, because it holds more than the toggle: the install-command row
 * below is inside it in production, which is what keeps the command
 * grouped with its example instead of being spaced away from it by the
 * page's own gap between cards.
 *
 * `<CopyCommand>` takes the four package-manager dialects (§17.6 #15, Task
 * 4.1), where the live page hard-codes a single `npx` string — the
 * recorded, intended change that put this surface on the same preference
 * the docs install blocks and the landing page already follow.
 */
export async function ExampleCard({ slug, id, title }: { slug: string; id: string; title: string }) {
  // Literal relative prefix, and the `../` count is pinned by THIS file's
  // own depth: `apps/web/components/gallery/` is four directories below the
  // repo root (gallery, components, web, apps), the same count
  // `components/mdx/component.tsx` needs from `apps/web/components/mdx/`.
  // Verified by building, not by reading — see task-4.2-report.md.
  const { default: Example } = await import(`../../../../packages/registry/components/${slug}/${id}.tsx`);

  return (
    <section className="scroll-mt-24" id={id}>
      <DemoTabs
        className=""
        code={await sourcePane(`components/${slug}/${id}.tsx`)}
        heading={
          <h2 className="text-base font-semibold tracking-tight">
            <a className="hover:underline" href={`#${id}`}>
              {title}
            </a>
          </h2>
        }
        preview={
          <PreviewPane>
            <Example />
          </PreviewPane>
        }
      />
      <div className="mt-3">
        <CopyCommand commands={packageManagerCommands((pm) => installCommand(`component/${id}`, pm))} />
      </div>
    </section>
  );
}
