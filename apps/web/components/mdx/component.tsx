import "server-only";

import { DemoTabs } from "../demo/demo-tabs";
import { PreviewPane } from "../demo/preview-pane";
import { sourcePane } from "../demo/source-pane";
import { DemoPreview } from "./demo-preview";

export async function Component({ path: demoPath, contain = false }: { path: string; contain?: boolean }) {
  return (
    <DemoTabs
      code={await sourcePane(`demos/${demoPath}.tsx`)}
      preview={
        <PreviewPane contain={contain}>
          <DemoPreview path={demoPath} />
        </PreviewPane>
      }
    />
  );
}
