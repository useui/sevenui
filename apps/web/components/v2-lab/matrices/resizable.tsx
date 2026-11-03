"use client";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/registry/base/ui/resizable";
import { LabSection } from "../lab-frame";

function Pane({ label }: { label: string }) {
  return (
    <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
      {label}
    </div>
  );
}

export default function ResizableMatrix() {
  return (
    <div>
      <LabSection title="horizontal, withHandle (tab to the handle, arrow keys resize)">
        <ResizablePanelGroup className="h-32 max-w-md rounded-lg border">
          <ResizablePanel defaultSize="50%">
            <Pane label="One" />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize="50%">
            <Pane label="Two" />
          </ResizablePanel>
        </ResizablePanelGroup>
      </LabSection>
      <LabSection title="vertical, withHandle">
        <ResizablePanelGroup orientation="vertical" className="h-48 max-w-md rounded-lg border">
          <ResizablePanel defaultSize="40%">
            <Pane label="Top" />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize="60%">
            <Pane label="Bottom" />
          </ResizablePanel>
        </ResizablePanelGroup>
      </LabSection>
      <LabSection title="bare handle / disabled handle">
        <ResizablePanelGroup className="h-32 max-w-xs rounded-lg border">
          <ResizablePanel defaultSize="50%">
            <Pane label="Bare" />
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize="50%">
            <Pane label="Handle" />
          </ResizablePanel>
        </ResizablePanelGroup>
        <ResizablePanelGroup className="h-32 max-w-xs rounded-lg border">
          <ResizablePanel defaultSize="50%">
            <Pane label="Disabled" />
          </ResizablePanel>
          <ResizableHandle withHandle disabled />
          <ResizablePanel defaultSize="50%">
            <Pane label="Handle" />
          </ResizablePanel>
        </ResizablePanelGroup>
      </LabSection>
    </div>
  );
}
