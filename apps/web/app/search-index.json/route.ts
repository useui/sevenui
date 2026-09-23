import { NextResponse } from "next/server";

import { buildSearchIndex } from "../../lib/docs/search-index";

export const dynamic = "force-static";

export async function GET() {
  const index = await buildSearchIndex();
  return NextResponse.json(index);
}
