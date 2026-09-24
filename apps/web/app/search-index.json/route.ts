import { NextResponse } from "next/server";

import { buildSearchIndex } from "../../lib/docs/search-index";

// The index includes the Pro block directory, read from the pro manifest; match its 300 s ISR
// window like /blocks, sitemap.xml and llms.txt, so new blocks become searchable without a rebuild.
export const revalidate = 300;

export async function GET() {
  const index = await buildSearchIndex();
  return NextResponse.json(index);
}
