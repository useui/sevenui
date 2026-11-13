import "server-only";

import { uiSdkAvailable } from "../../lib/ui-sdk-examples";
import { ThemeCustomizer } from "../customizer/theme-customizer";
import { DemoTabs } from "../demo/demo-tabs";
import { PreviewPane } from "../demo/preview-pane";
import { flavouredSourcePane } from "../demo/source-pane";
import { ExampleFlavourNote } from "../flavour/example-note";
import { FlavouredPreview } from "../flavour/flavoured-preview";
import { DemoPreview } from "./demo-preview";

export async function Component({ path: demoPath, contain = false }: { path: string; contain?: boolean }) {
  const file = `${demoPath}.tsx`;
  const [folder, name] = demoPath.split("/");
  return (
    <div className="my-6">
      <DemoTabs
        // No install control: a primitive page installs the primitive, from its Installation section.
        actions={<ThemeCustomizer />}
        detached
        flavoured
        code={await flavouredSourcePane("demos", file)}
        preview={
          <PreviewPane contain={contain}>
            <FlavouredPreview available={uiSdkAvailable("demos", file)} folder={`demos/${folder}`} name={name}>
              <DemoPreview path={demoPath} />
            </FlavouredPreview>
          </PreviewPane>
        }
      />
      <ExampleFlavourNote file={file} kind="demos" />
    </div>
  );
}
