import { site } from "../../lib/site";

export const dynamic = "force-static";

const ROBOTS = [
  "User-agent: *",
  "Content-Signal: search=yes, ai-input=yes, ai-train=yes",
  "Allow: /",
  "",
  `Sitemap: ${site.url}/sitemap.xml`,
  "",
].join("\n");

export async function GET() {
  return new Response(ROBOTS, { headers: { "content-type": "text/plain; charset=utf-8" } });
}
