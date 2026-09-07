"use client";

import { DownloadIcon, FileArchiveIcon, XIcon } from "lucide-react";

import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
  AttachmentTrigger,
} from "@/registry/base/ui/attachment";
import { Spinner } from "@/registry/base/ui/spinner";

export default function AttachmentActionsDemo() {
  return (
    <div className="flex w-full max-w-xs flex-col gap-3">
      <Attachment size="sm" className="w-full">
        <AttachmentMedia>
          <FileArchiveIcon />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>design-assets.zip</AttachmentTitle>
          <AttachmentDescription>24 MB</AttachmentDescription>
        </AttachmentContent>
        <AttachmentActions>
          <AttachmentAction aria-label="Download design-assets.zip">
            <DownloadIcon />
          </AttachmentAction>
          <AttachmentAction aria-label="Remove design-assets.zip">
            <XIcon />
          </AttachmentAction>
        </AttachmentActions>
        <AttachmentTrigger aria-label="Preview design-assets.zip" />
      </Attachment>
      <Attachment size="xs" state="uploading" className="w-full">
        <AttachmentMedia>
          <Spinner />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>screen-recording.mp4</AttachmentTitle>
          <AttachmentDescription>Uploading…</AttachmentDescription>
        </AttachmentContent>
      </Attachment>
    </div>
  );
}
