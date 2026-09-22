import "server-only";

import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { rewriteRegistryImports } from "../../lib/registry-imports";
import { highlight } from "../../lib/shiki";
import { CodeBlock } from "../mdx/code-block";

const REGISTRY_DIR = path.join(process.cwd(), "../../packages/registry");

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

export async function sourcePane(relPath: string): Promise<React.ReactElement> {
  // Rewritten before highlighting so the tokens shiki colours are the ones the
  // reader will have on disk after `shadcn add`, not the registry's own spelling.
  const source = rewriteRegistryImports(await readRegistrySource(relPath));
  const highlighted = await highlightSource(source);

  return (
    <CodeBlock className="my-0! rounded-none! border-0!" language="tsx">
      <code className="language-tsx shiki" dangerouslySetInnerHTML={{ __html: highlighted }} />
    </CodeBlock>
  );
}
