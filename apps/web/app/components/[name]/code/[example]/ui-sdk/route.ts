import { highlightRegistrySource } from "../../../../../../components/demo/source-pane";
import { GALLERY_SLUGS, galleryExamples } from "../../../../../../lib/gallery";
import { exampleSourcePath, hasOverlay } from "../../../../../../lib/ui-sdk-examples";

// The UI SDK source of a gallery example that has a flavour overlay; the Code tab fetches it when the
// reader's flavour is UI SDK. Examples without an overlay read the same in both flavours and use ../route.ts.
export const dynamic = "force-static";
export const dynamicParams = false;

type Params = { name: string; example: string };

export function generateStaticParams(): Params[] {
  return GALLERY_SLUGS.flatMap((name) =>
    galleryExamples(name)
      .filter((example) => hasOverlay("components", `${name}/${example.id}.tsx`))
      .map((example) => ({ name, example: example.id })),
  );
}

export async function GET(_request: Request, { params }: { params: Promise<Params> }) {
  const { name, example } = await params;
  const html = await highlightRegistrySource(exampleSourcePath("components", `${name}/${example}.tsx`, "ui-sdk"));
  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "x-robots-tag": "noindex",
    },
  });
}
