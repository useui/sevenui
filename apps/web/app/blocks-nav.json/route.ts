import { NextResponse } from "next/server";

import { getBlocksNav } from "../../lib/shell-nav";

// The site sidebar's Blocks section outside /blocks. Read from the pro manifest on the same 300 s ISR
// window as /blocks and search-index.json, so the docs and gallery pages stay fully static.
export const revalidate = 300;

export async function GET() {
  return NextResponse.json(await getBlocksNav());
}
