"use client";

import { UploadIcon } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/registry/base/ui/empty";
import {
  LayerCard,
  LayerCardHeader,
  LayerCardPanel,
  LayerCardTitle,
} from "@/registry/base/ui/layer-card";

export default function LayerCard05() {
  return (
    <LayerCard className="w-full max-w-md">
      <LayerCardHeader>
        <LayerCardTitle>Attachments</LayerCardTitle>
      </LayerCardHeader>
      <LayerCardPanel className="border-dashed bg-transparent shadow-none">
        <Empty className="p-6">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <UploadIcon />
            </EmptyMedia>
            <EmptyTitle>Drop files to upload</EmptyTitle>
            <EmptyDescription>PNG, JPG or PDF up to 10 MB.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button variant="outline" size="sm">
              Browse files
            </Button>
          </EmptyContent>
        </Empty>
      </LayerCardPanel>
    </LayerCard>
  );
}
