import { getDocIndex } from "../../lib/docs";
import { toMarkdown } from "../../lib/docs/serialize-md";
import { site } from "../../lib/site";

export const dynamic = "force-static";

const SECTION_SEPARATOR = "\n\n---\n\n";

export async function GET() {
  const index = await getDocIndex();

  const pages = [...index].sort((a, b) => (a.route < b.route ? -1 : a.route > b.route ? 1 : 0));

  const sections = await Promise.all(
    pages.map(async (page) => {
      const body = await toMarkdown(page, index);
      return `# ${page.title}\nSource: ${site.url}${page.route}\n\n${body.trimEnd()}`;
    }),
  );

  const text = `# ${site.name}\n\n> ${site.description}\n\n${sections.join(SECTION_SEPARATOR)}\n`;
  return new Response(text, { headers: { "content-type": "text/plain; charset=utf-8" } });
}
