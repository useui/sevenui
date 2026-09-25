import "server-only";

import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { rewriteRegistryImports } from "../../lib/registry-imports";
import { highlightLines } from "../../lib/shiki";
import { CodeBlock } from "../mdx/code-block";
import { CODE_CLASS, cx } from "../mdx/code-element";

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

/** The highlighted lines of one registry source file, as the inside of a `<code className="shiki">`. */
export async function highlightRegistrySource(relPath: string): Promise<string> {
  // Rewritten before highlighting so the tokens shiki colours are the ones the
  // reader will have on disk after `shadcn add`, not the registry's own spelling.
  const source = rewriteRegistryImports(await readRegistrySource(relPath));
  return highlightLines(source, "tsx");
}

export async function sourcePane(relPath: string): Promise<React.ReactElement> {
  const highlighted = await highlightRegistrySource(relPath);

  return (
    <CodeBlock className="my-0! rounded-none! border-0!" language="tsx">
      <code
        className={cx(CODE_CLASS, "language-tsx shiki")}
        // biome-ignore lint/security/noDangerouslySetInnerHtml: build-time Shiki output from our own sources
        dangerouslySetInnerHTML={{ __html: highlighted }}
      />
    </CodeBlock>
  );
}
