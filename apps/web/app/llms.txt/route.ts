import { buildLlmsIndex } from "../../lib/site-index";

export const revalidate = 300;

export async function GET() {
  return new Response(await buildLlmsIndex(), {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
