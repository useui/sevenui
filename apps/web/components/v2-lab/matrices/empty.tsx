"use client";

import { FolderIcon } from "lucide-react";
import { Button } from "@/registry/base/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/registry/base/ui/empty";
import { LabSection } from "../lab-frame";

function Sample({ media, bordered }: { media: "default" | "icon"; bordered: boolean }) {
  return (
    <Empty className={bordered ? "w-72 border" : "w-72"}>
      <EmptyHeader>
        <EmptyMedia variant={media}>
          <FolderIcon className={media === "default" ? "size-8 text-muted-foreground" : undefined} />
        </EmptyMedia>
        <EmptyTitle>No projects yet</EmptyTitle>
        <EmptyDescription>
          Create a project to start. <a href="#docs">Read the docs</a>.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button size="sm">New project</Button>
      </EmptyContent>
    </Empty>
  );
}

export default function EmptyMatrix() {
  return (
    <div>
      <LabSection title="media=icon (raised tile)">
        <Sample media="icon" bordered={false} />
        <Sample media="icon" bordered />
      </LabSection>
      <LabSection title="media=default">
        <Sample media="default" bordered={false} />
        <Sample media="default" bordered />
      </LabSection>
    </div>
  );
}
