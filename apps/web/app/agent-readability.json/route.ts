import { site } from "../../lib/site";

// `/agent-readability.json` (§15.11): the machine-readable description of this
// site's agent surface, pointed at from every docs page by
// `<link rel="describedby" type="application/json">`.
//
// Reproduced from production with EXACTLY TWO corrected fields, both of which
// are corrections of statements that became false rather than changes of
// policy:
//
//  - `generator` was `"blume@1.5.3"`. Post-cutover that is simply not what
//    generates this site.
//  - `artifacts.markdown.pattern` was `https://sevenui.dev/{route}.md`, a
//    universal claim that was ALREADY a lie: `/components/button.md`,
//    `/components.md`, `/blocks.md`, `/pro.md` and `/terms.md` all 404, because
//    `.md` mirrors exist only for the docs corpus plus `/`. Nothing noticed
//    because `llms.txt` never listed those routes; §15.4 now lists them —
//    a manifest-derived count that drifts with the pro catalog (Ruling 58;
//    `lib/site-index.ts`'s own header: NOTHING HERE IS A COUNT), so no
//    specific number is repeated here — so an agent following this pattern
//    would start hitting those 404s. The narrowed pattern says what is true.
//
// The mirrors are NOT widened to match the old pattern instead (§15.12).
// Synthesising Markdown for a gallery page — a live component grid, not prose —
// would produce either an empty file or newly invented content to maintain, and
// for `/blocks` it is worse: the previews are licence-gated iframes served from
// another origin. Narrowing the declaration is the honest half of that pair.
//
// Everything else is reproduced as-is, and every value that appears anywhere
// else on the site is read from `lib/site.ts` rather than retyped — the name,
// the description, the origin and the repository URL. `contentUsage` restates
// `robots.txt`'s `Content-Signal` in JSON; the two are one stance in two
// formats and must always move together.
//
// `force-static`: nothing here comes from the manifest or from the request.
export const dynamic = "force-static";

// Key order and two-space indentation are production's, kept so a diff of this
// endpoint against the fixture shows the two corrected values and no reshuffle.
// §17.4's gate parses both sides and compares field by field, so the order is
// courtesy to a human reader, not a requirement.
const AGENT_READABILITY = {
  artifacts: {
    markdown: { pattern: `${site.url}/docs/{route}.md` },
    llmsFullTxt: `${site.url}/llms-full.txt`,
    llmsTxt: `${site.url}/llms.txt`,
    sitemap: `${site.url}/sitemap.xml`,
  },
  description: site.description,
  generator: "sevenui-web",
  name: site.name,
  site: site.url,
  contentUsage: {
    search: true,
    "ai-input": true,
    "ai-train": true,
  },
  repository: `https://github.com/${site.github.owner}/${site.github.repo}`,
};

export async function GET() {
  return new Response(`${JSON.stringify(AGENT_READABILITY, null, 2)}\n`, {
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}
