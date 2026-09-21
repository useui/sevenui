import { site } from "../../lib/site";

export const dynamic = "force-static";

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
