import { highlightRegistrySource } from "../../../../../components/demo/source-pane";
import { GALLERY_SLUGS, galleryExamples } from "../../../../../lib/gallery";

// The gallery's Code tabs fetch their highlighted source from here on first open, so a
// gallery page ships previews only instead of every example's source twice (HTML + RSC).
export const dynamic = "force-static";
export const dynamicParams = false;

type Params = { name: string; example: string };

export function generateStaticParams(): Params[] {
  return GALLERY_SLUGS.flatMap((name) => galleryExamples(name).map((example) => ({ name, example: example.id })));
}

export async function GET(_request: Request, { params }: { params: Promise<Params> }) {
  const { name, example } = await params;
  const html = await highlightRegistrySource(`components/${name}/${example}.tsx`);
  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      // A fragment of its gallery page, never a search result of its own.
      "x-robots-tag": "noindex",
    },
  });
}

