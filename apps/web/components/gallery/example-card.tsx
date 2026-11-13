import "server-only";

import { hasOverlay, uiSdkAvailable } from "../../lib/ui-sdk-examples";
import { DemoTabs } from "../demo/demo-tabs";
import { ExampleFlavourNote } from "../flavour/example-note";
import { FlavouredPreview } from "../flavour/flavoured-preview";
import { PreviewPane } from "../demo/preview-pane";
import { LazyCode } from "../demo/lazy-code";
import { ExampleActions } from "./example-actions";

export async function ExampleCard({
  slug,
  id,
  title,
  description,
}: {
  slug: string;
  id: string;
  title: string;
  description: string;
}) {
  const { default: Example } = await import(`../../../../packages/registry/components/${slug}/${id}.tsx`);
  const file = `${slug}/${id}.tsx`;

  return (
    // No content-visibility here: skipped sections report estimated heights, and a #anchor from search
    // or a shared link would land hundreds of pixels off.
    <section className="scroll-mt-24" id={id}>
      <DemoTabs
        actions={<ExampleActions id={id} title={title} />}
        code={
          <LazyCode
            id={id}
            // Only an example with a UI SDK overlay has a second source; any other reads the same in both.
            uiSdkSrc={hasOverlay("components", file) ? `/components/${slug}/code/${id}/ui-sdk` : undefined}
            src={`/components/${slug}/code/${id}`}
          />
        }
        flavoured
        heading={
          <div className="min-w-0">
            <h2 className="text-base font-semibold tracking-tight">
              <a className="hover:underline" href={`#${id}`}>
                {title}
              </a>
            </h2>
            {description && <p className="mt-1 text-pretty text-sm text-muted-foreground">{description}</p>}
          </div>
        }
        label={title}
        preview={
          <PreviewPane compact>
            <FlavouredPreview available={uiSdkAvailable("components", file)} folder={`components/${slug}`} name={id}>
              <Example />
            </FlavouredPreview>
          </PreviewPane>
        }
      />
      <ExampleFlavourNote file={file} kind="components" />
    </section>
  );
}
