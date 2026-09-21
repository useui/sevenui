import "server-only";

import { DemoTabs } from "../demo/demo-tabs";
import { PreviewPane } from "../demo/preview-pane";
import { sourcePane } from "../demo/source-pane";

export async function Component({ path: demoPath, contain = false }: { path: string; contain?: boolean }) {
  const { default: Demo } = await import(`../../../../packages/registry/demos/${demoPath}.tsx`);

  return (
    <DemoTabs
      code={await sourcePane(`demos/${demoPath}.tsx`)}
      preview={
        <PreviewPane contain={contain}>
          <Demo />
        </PreviewPane>
      }
    />
  );
}
