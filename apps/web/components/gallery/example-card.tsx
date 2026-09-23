import "server-only";

import CopyCommand from "../copy-command";
import { DemoTabs } from "../demo/demo-tabs";
import { PreviewPane } from "../demo/preview-pane";
import { sourcePane } from "../demo/source-pane";
import { packageManagerCommands } from "../../lib/package-manager";
import { installCommand } from "../../lib/registry";

export async function ExampleCard({ slug, id, title }: { slug: string; id: string; title: string }) {
  const { default: Example } = await import(`../../../../packages/registry/components/${slug}/${id}.tsx`);

  return (
    <section className="scroll-mt-24" id={id}>
      <DemoTabs
        className=""
        code={await sourcePane(`components/${slug}/${id}.tsx`)}
        heading={
          <h2 className="text-base font-semibold tracking-tight">
            <a className="hover:underline" href={`#${id}`}>
              {title}
            </a>
          </h2>
        }
        preview={
          <PreviewPane>
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
