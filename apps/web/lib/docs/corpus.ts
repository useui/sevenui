import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import { VFile } from "vfile";
import { matter } from "vfile-matter";
import { z } from "zod";
import { frontmatterSchema } from "./schema.ts";

export const DOCS_DIR = path.join(process.cwd(), "docs");

export async function assertDocsDirExists(): Promise<void> {
  let isDirectory = false;
  try {
    isDirectory = (await stat(DOCS_DIR)).isDirectory();
  } catch {
    isDirectory = false;
  }
  if (!isDirectory) {
    throw new Error(
      `lib/docs/corpus.ts: expected a docs directory at "${DOCS_DIR}" but found none. ` +
        `This path is process.cwd() + "docs"; process.cwd() is currently "${process.cwd()}". ` +
        `Run the build/dev server, or scripts/build-md-mirrors.ts, with cwd = apps/web.`,
    );
  }
}

export async function collectMdxFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectMdxFiles(fullPath)));
    } else if (entry.isFile() && entry.name.endsWith(".mdx")) {
      files.push(fullPath);
    }
  }
  return files;
}

export function routeFor(relPath: string): string {
  const withoutExt = relPath.slice(0, -path.extname(relPath).length);
  return withoutExt === "index" ? "/docs" : `/docs/${withoutExt}`;
}

export function blankFrontmatter(content: string): { blanked: string; frontmatterEnd: number } {
  const lines = content.split("\n");
  if (lines[0] !== "---") return { blanked: content, frontmatterEnd: -1 };
  let end = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i] === "---") {
      end = i;
      break;
    }
  }
  if (end === -1) return { blanked: content, frontmatterEnd: -1 };
  const blankedLines = lines.slice();
  for (let i = 0; i <= end; i++) blankedLines[i] = "";
  return { blanked: blankedLines.join("\n"), frontmatterEnd: end };
}

export type ParsedFrontmatter = z.infer<typeof frontmatterSchema>;

export function parseFrontmatter(fullPath: string, content: string): ParsedFrontmatter {
  const file = new VFile({ path: fullPath, value: content });
  matter(file);
  return frontmatterSchema.parse(file.data.matter);
}
