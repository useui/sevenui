import "server-only";

import CopyCommand from "../copy-command";
import { DemoTabs } from "../demo/demo-tabs";
import { PreviewPane } from "../demo/preview-pane";
import { sourcePane } from "../demo/source-pane";
import { packageManagerCommands } from "../../lib/package-manager";
import { installCommand } from "../../lib/registry";

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

  return (
    // No content-visibility here: skipped sections report estimated heights, and a #anchor from search
    // or a shared link would land hundreds of pixels off.
    <section className="scroll-mt-24" id={id}>
      <DemoTabs
        code={await sourcePane(`components/${slug}/${id}.tsx`)}
        heading={
          <div className="min-w-0 flex-1 basis-72">
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
            <Example />
          </PreviewPane>
        }
      />
      <div className="mt-3">
        <CopyCommand commands={packageManagerCommands((pm) => installCommand(`component/${id}`, pm))} />
      </div>
    </section>
  );
}
