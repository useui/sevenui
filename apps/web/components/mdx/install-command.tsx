import { PACKAGE_MANAGERS, type PackageManager } from "../../lib/package-manager";
import { installCommand } from "../../lib/registry";
import { highlight } from "../../lib/shiki";
import { PackageManagerMenu } from "../package-manager-menu";
import { CodeBlock } from "./code-block";

// Task 2.7 (§6.1, §17.6 #7): closes the gap where every one of the 68 docs
// install blocks read a hard `npx` while the site already stores a
// preference (default pnpm) that, before this task, only `/blocks`
// honoured. mdx-components.tsx's seam wires this in as `<InstallCommand
// item="…" />` — the corpus's only call shape, 68 uses across 67 files
// (lib/docs/elements.ts's JSX-tag allow-list already names it).
//
// All four commands ship in the rendered HTML; CSS (globals.css's
// `.pm-only` rules) reveals exactly one off `[data-pm]` on <html>, written
// pre-paint by <PackageManagerScript> (Stage 1). No client component sits
// in the rendering path for the four commands themselves — the only client
// code involved is CodeBlock's own copy button and <PackageManagerMenu>,
// neither of which re-renders anything when the preference changes.
//
// Brief discrepancies (task-2.7-report.md has the full account):
//   (A) The brief's `<CodeBlock language="bash" header={…}>` — neither prop
//       existed; both are now real, minimal additions to code-block.tsx
//       (`language`, `headerRight`) rather than duplicated chrome here.
//   (B) The brief's `className={\`pm-only-${pm}\`}` reveals nothing on its
//       own — install-control.astro's own live markup carries BOTH
//       `pm-only` and `pm-only-{pm}`, and this file does the same below.
//   (C) `highlight()`'s default output is a complete `<pre><code>…`
//       fragment, which cannot legally nest inside CodeBlock's own `<pre>`.
//       This calls `highlight(command, "bash", "inline")` (lib/shiki.ts's
//       Task 2.7 addition) instead, which returns bare `<span>`s with no
//       wrapper at all, and wraps them here in a `<code class="pm-only
//       pm-only-<pm> shiki">` — `<code>` because `<pre>`'s content model is
//       phrasing content only (a `<div>` would repeat the same invalidity
//       this sidesteps), and `class="shiki"` because that's the class
//       globals.css's colour rules (`.shiki`, `.shiki span`) actually key
//       off, not a nesting `<pre>`.
//   (D) `textContent` would copy all four concatenated commands. CodeBlock's
//       `installCommands` prop instead hands the four plain command
//       strings down and reads the live `[data-pm]` attribute at copy-click
//       time (see code-block.tsx) — no function prop crosses this
//       server/client boundary; only the string data below does.
//
// SCOPE (fix round 1, task-2.7 review MINOR 2): `CodeBlock`'s
// `installCommands` prop is built for exactly this one call site, not as a
// mechanism other install surfaces are expected to adopt — §6.1's table
// gives `/blocks` and Stage 4's `copy-command.tsx` their own shapes
// (`copy-command.tsx` keeps its own `$ command` row and its own
// `Record<PackageManager, string>` prop; Task 4.1 corrected this line, which
// used to claim it "keeps `command: string`, per §13.2" — §13.2 in fact says
// it takes its command from the same four-command set). The pieces that
// ARE shared across those surfaces are `<PackageManagerMenu>` and
// `currentPackageManager()` (lib/package-manager.ts), both reused here
// rather than reinvented.
export async function InstallCommand({ item }: { item: string }) {
  const variants = await Promise.all(
    PACKAGE_MANAGERS.map(async (pm) => {
      const command = installCommand(item, pm);
      const html = await highlight(command, "bash", "inline");
      return { pm, command, html };
    }),
  );

  const commands = Object.fromEntries(variants.map(({ pm, command }) => [pm, command])) as Record<
    PackageManager,
    string
  >;

  return (
    <CodeBlock language="bash" headerRight={<PackageManagerMenu />} installCommands={commands}>
      {variants.map(({ pm, html }) => (
        // `html` is this file's own lib/shiki.ts output — a build-time
        // highlight of a shadcn CLI command this same function assembled
        // two lines up (never user input) — so injecting it is safe.
        <code key={pm} className={`pm-only pm-only-${pm} shiki`} dangerouslySetInnerHTML={{ __html: html }} />
      ))}
    </CodeBlock>
  );
}
