"use client";

import * as React from "react";
import { CheckIcon, DownloadIcon, FileTextIcon } from "lucide-react";

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
import { Button } from "@/registry/base/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/registry/base/ui/dialog";

const file = {
  name: "floor-plan-unit-4b.pdf",
  size: "3.2 MB",
  pages: 6,
  uploadedBy: "Priya Raman",
  uploadedAt: "Sep 21, 2026",
};

const details = [
  { label: "Size", value: file.size },
  { label: "Pages", value: String(file.pages) },
  { label: "Uploaded by", value: file.uploadedBy },
  { label: "Uploaded", value: file.uploadedAt },
];

export default function Attachment05() {
  const [downloaded, setDownloaded] = React.useState(false);

  React.useEffect(() => {
    if (!downloaded) return;
    const timeout = window.setTimeout(() => setDownloaded(false), 1600);
    return () => window.clearTimeout(timeout);
  }, [downloaded]);

  const DownloadStateIcon = downloaded ? CheckIcon : DownloadIcon;

  return (
    <Dialog>
      <Attachment className="w-full max-w-xs">
        <AttachmentMedia>
          <FileTextIcon aria-hidden="true" />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>{file.name}</AttachmentTitle>
          <AttachmentDescription>
            {file.size} · {file.pages} pages
          </AttachmentDescription>
        </AttachmentContent>
        <AttachmentActions>
          <AttachmentAction
            aria-label={
              downloaded ? `Downloaded ${file.name}` : `Download ${file.name}`
            }
            onClick={() => setDownloaded(true)}
          >
            <DownloadStateIcon aria-hidden="true" />
          </AttachmentAction>
        </AttachmentActions>
        <DialogTrigger
          render={
            <AttachmentTrigger
              aria-label={`Preview ${file.name}`}
              className="rounded-2xl focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          }
        />
      </Attachment>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="truncate pr-8">{file.name}</DialogTitle>
          <DialogDescription>
            Page 1 of {file.pages} · Ground floor layout
          </DialogDescription>
        </DialogHeader>
        <div className="overflow-hidden rounded-lg border border-border bg-muted">
          <img
            src="/placeholder.svg"
            alt="Ground floor layout of unit 4B"
            className="aspect-[4/3] w-full object-cover"
          />
        </div>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
          {details.map((detail) => (
            <div key={detail.label} className="flex min-w-0 flex-col gap-0.5">
              <dt className="text-muted-foreground">{detail.label}</dt>
              <dd className="truncate font-medium">{detail.value}</dd>
            </div>
          ))}
        </dl>
        <DialogFooter>
          <DialogClose render={<Button variant="outline">Close</Button>} />
          <Button onClick={() => setDownloaded(true)}>
            <DownloadStateIcon aria-hidden="true" data-icon="inline-start" />
            {downloaded ? "Downloaded" : "Download"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
