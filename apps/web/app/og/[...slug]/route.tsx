import { readFileSync } from "node:fs";
import path from "node:path";
import { notFound } from "next/navigation";
import { ImageResponse } from "next/og";
import { OgCard } from "../../../lib/og/card";
import { HEIGHT, WIDTH } from "../../../lib/og/dimensions";
import { routeToSlug, slugToRoute } from "../../../lib/og/path";
import { getPageMeta } from "../../../lib/page-meta";
import { pageRoutes } from "../../../lib/site-index";

const FONTS_DIR = path.join(process.cwd(), "lib/og/fonts");
const geistRegular = readFileSync(path.join(FONTS_DIR, "Geist-Regular.ttf"));
const geistSemiBold = readFileSync(path.join(FONTS_DIR, "Geist-SemiBold.ttf"));

export const dynamicParams = true;

export const revalidate = 300;

type Params = { slug: string[] };

export async function generateStaticParams(): Promise<Params[]> {
  const routes = await pageRoutes();
  return routes.map((route) => ({ slug: routeToSlug(route) }));
}

export async function GET(_request: Request, { params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const route = slugToRoute(slug);
  const meta = route ? await getPageMeta(route) : undefined;
  if (!meta) {
    notFound();
  }

  return new ImageResponse(<OgCard description={meta.description} title={meta.title} />, {
    fonts: [
      { data: geistRegular, name: "Geist", style: "normal", weight: 400 },
      { data: geistSemiBold, name: "Geist", style: "normal", weight: 600 },
    ],
    height: HEIGHT,
    width: WIDTH,
  });
}
