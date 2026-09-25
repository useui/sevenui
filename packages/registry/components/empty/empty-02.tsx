"use client";

import { FolderPlusIcon, UploadIcon } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/registry/base/ui/empty";

export default function Empty02() {
  return (
    <Empty className="w-full max-w-md border md:p-10">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FolderPlusIcon aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle>No collections yet</EmptyTitle>
        <EmptyDescription>
          Group related documents into a collection so your team can find them
          in one place.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex flex-wrap justify-center gap-2">
          <Button size="sm">
            <FolderPlusIcon aria-hidden="true" data-icon="inline-start" />
            New collection
          </Button>
          <Button size="sm" variant="outline">
            <UploadIcon aria-hidden="true" data-icon="inline-start" />
            Import files
          </Button>
        </div>
      </EmptyContent>
    </Empty>
  );
}
