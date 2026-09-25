import "server-only";

import { ThemeCustomizer } from "../customizer/theme-customizer";
import { DemoTabs } from "../demo/demo-tabs";
import { PreviewPane } from "../demo/preview-pane";
import { sourcePane } from "../demo/source-pane";
import { DemoPreview } from "./demo-preview";

export async function Component({ path: demoPath, contain = false }: { path: string; contain?: boolean }) {
  return (
    <DemoTabs
      // No install control: a primitive page installs the primitive, from its Installation section.
      actions={<ThemeCustomizer />}
      className="my-6"
      code={await sourcePane(`demos/${demoPath}.tsx`)}
      preview={
        <PreviewPane contain={contain}>
          <DemoPreview path={demoPath} />
        </PreviewPane>
      }
    />
  );
}
