import { site } from "../../lib/site";

// `robots.txt` (§15.6), reproduced byte for byte — 120 B, four lines plus the
// blank one before `Sitemap:`, and a single trailing newline.
//
// A ROUTE HANDLER, NOT `app/robots.ts`. Next's `MetadataRoute.Robots` models
// `userAgent`, `allow`, `disallow`, `crawlDelay`, `sitemap` and `host`; it has
// no field for `Content-Signal` and no escape hatch to emit an unmodelled
// directive, so the idiomatic API cannot produce these bytes at all. Byte
// identity wins: this file is the site's published stance on AI use, the gate
// requires it unchanged, and losing a line of it to a framework convenience
// would be a policy change disguised as a refactor.
//
// The `Content-Signal` stance is settled, not deferred. It is not revisited
// during a framework cutover, and no post-cutover follow-up is opened for it.
// `contentUsage` in `/agent-readability.json` states the same three values in
// JSON and must move with this file if it ever moves.
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
