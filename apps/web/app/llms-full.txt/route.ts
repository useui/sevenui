import { getDocIndex } from "../../lib/docs";
import { toMarkdown } from "../../lib/docs/serialize-md";
import { site } from "../../lib/site";

// `/llms-full.txt` (§15.5): the entire docs corpus in one fetch, one section
// per page. It stays whole — §15.5 measured production's copy at 296,471 B
// across 68 sections, 59% of it fenced demo source (175,231 B in 214 fences),
// which is what settled it: dropping the demo sources would leave a longer
// `llms.txt`, and a consumer who asks for this file is asking for everything.
// Those figures describe the frozen pre-migration fixture, not this route's
// output, which tracks the corpus and grows with it.
//
// `force-static`, unlike `/llms.txt` and `sitemap.ts`: nothing in this file
// comes from the pro manifest. Every byte is the docs corpus, which is a
// filesystem read baked into the deploy — the same argument
// `/search-index.json` makes for the same treatment, and the reason §15.7's
// 300-second ceiling has nothing to bind here.
export const dynamic = "force-static";

// The section separator, and the whole of this file's structure:
//
//   # SevenUI
//   <blank>
//   > <site description>
//   <blank>
//   # <title>
//   Source: <absolute url>
//   <blank>
//   <body>
//   <blank>
//   ---
//   <blank>
//   # <next title>
//   …
//
// Verified by splitting the production fixture on exactly this string: it
// yields 68 parts, every one of which starts with `# `. The last section is
// followed by a single newline and no trailing separator.
const SECTION_SEPARATOR = "\n\n---\n\n";

export async function GET() {
  const index = await getDocIndex();

  // Sorted by ROUTE, by the same plain comparator `lib/docs/nav.ts` sorts the
  // primitives with, and for the same reason it gives: the route is the frozen
  // URL, while the title is prose and the filename collides (`alert-dialog.mdx`
  // sorts before `alert.mdx`; `-` is 0x2D and `.` is 0x2E). Route order also
  // happens to be exactly production's section order here — `/docs`, then the
  // primitives, then `/docs/installation` and `/docs/theming` — which is not a
  // coincidence worth relying on, but is worth recording as the check that
  // this comparator is the right one.
  const pages = [...index].sort((a, b) => (a.route < b.route ? -1 : a.route > b.route ? 1 : 0));

  // `# <title>` + `Source:` rather than the verbatim YAML front matter the
  // `.md` mirrors keep (§15.3): inside a 69-document concatenation a front
  // matter block is noise, and this pair is what separates one document from
  // the next. The full `index` — not `pages` — is handed to `toMarkdown` as its
  // second argument: that parameter is the corpus `<PrimitiveIndex>` renders
  // from, so it must be every page, and its own ordering is that tag's concern,
  // not this file's.
  //
  // `trimEnd()` on each body because `SECTION_SEPARATOR` supplies the blank
  // line, and a body's own trailing newline would otherwise add a second one.
  const sections = await Promise.all(
    pages.map(async (page) => {
      const body = await toMarkdown(page, index);
      return `# ${page.title}\nSource: ${site.url}${page.route}\n\n${body.trimEnd()}`;
    }),
  );

  const text = `# ${site.name}\n\n> ${site.description}\n\n${sections.join(SECTION_SEPARATOR)}\n`;
  return new Response(text, { headers: { "content-type": "text/plain; charset=utf-8" } });
}
