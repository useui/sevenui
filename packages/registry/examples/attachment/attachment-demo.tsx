"use client";

import { FileTextIcon } from "lucide-react";

import {
  Attachment,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
} from "@/registry/base/ui/attachment";

export default function AttachmentDemo() {
  return (
    <AttachmentGroup className="w-full max-w-md">
      <Attachment>
        <AttachmentMedia>
          <FileTextIcon />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>quarterly-report.pdf</AttachmentTitle>
          <AttachmentDescription>1.2 MB · PDF</AttachmentDescription>
        </AttachmentContent>
      </Attachment>
      <Attachment>
        <AttachmentMedia variant="image">
          <img src="/placeholder.svg" alt="" />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>cover.png</AttachmentTitle>
          <AttachmentDescription>96 KB</AttachmentDescription>
        </AttachmentContent>
      </Attachment>
    </AttachmentGroup>
  );
}
