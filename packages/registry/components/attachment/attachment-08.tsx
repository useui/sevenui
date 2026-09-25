"use client";

import * as React from "react";
import {
  CheckIcon,
  DownloadIcon,
  FileImageIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  PaperclipIcon,
} from "lucide-react";

import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from "@/registry/base/ui/attachment";
import { Button } from "@/registry/base/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/registry/base/ui/popover";

const files = [
  { name: "invoice-inv-2048.pdf", size: "212 KB", icon: FileTextIcon },
  { name: "timesheet-august.xlsx", size: "88 KB", icon: FileSpreadsheetIcon },
  { name: "site-visit-01.jpg", size: "2.6 MB", icon: FileImageIcon },
  { name: "site-visit-02.jpg", size: "2.4 MB", icon: FileImageIcon },
  { name: "purchase-order-771.pdf", size: "164 KB", icon: FileTextIcon },
  { name: "expense-receipts.pdf", size: "1.1 MB", icon: FileTextIcon },
];

const VISIBLE = 2;

export default function Attachment08() {
  const [downloaded, setDownloaded] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!downloaded) return;
    const timeout = window.setTimeout(() => setDownloaded(null), 1600);
    return () => window.clearTimeout(timeout);
  }, [downloaded]);

  const visible = files.slice(0, VISIBLE);
  const hiddenCount = files.length - VISIBLE;

  return (
    <div className="flex w-full max-w-sm flex-col gap-2.5">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <PaperclipIcon className="size-3.5" aria-hidden="true" />
        <span className="tabular-nums">{files.length} attachments</span>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        {visible.map((file) => {
          const Icon = file.icon;
          return (
            <Attachment
              key={file.name}
              size="xs"
              className="max-w-36 min-w-0 pr-2.5"
            >
              <AttachmentMedia>
                <Icon aria-hidden="true" />
              </AttachmentMedia>
              <AttachmentContent>
                <AttachmentTitle>{file.name}</AttachmentTitle>
              </AttachmentContent>
            </Attachment>
          );
        })}
        <Popover>
          <PopoverTrigger
            render={
              <Button
                variant="outline"
                size="sm"
                className="h-9 rounded-xl tabular-nums"
              />
            }
          >
            +{hiddenCount} more
            <span className="sr-only"> attachments</span>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-80 max-w-[calc(100vw-2rem)]">
            <PopoverHeader>
              <PopoverTitle>Attached to INV-2048</PopoverTitle>
              <PopoverDescription>
                Shared by Marcus Chen · Read-only
              </PopoverDescription>
            </PopoverHeader>
            <ul className="-mx-1 flex max-h-64 flex-col gap-0.5 overflow-y-auto">
              {files.map((file) => {
                const Icon = file.icon;
                return (
                  <li key={file.name}>
                    <Attachment
                      size="sm"
                      className="w-full border-transparent bg-transparent hover:bg-muted/60"
                    >
                      <AttachmentMedia>
                        <Icon aria-hidden="true" />
                      </AttachmentMedia>
                      <AttachmentContent>
                        <AttachmentTitle>{file.name}</AttachmentTitle>
                        <AttachmentDescription>{file.size}</AttachmentDescription>
                      </AttachmentContent>
                      <AttachmentActions>
                        <AttachmentAction
                          aria-label={
                            downloaded === file.name
                              ? `Downloaded ${file.name}`
                              : `Download ${file.name}`
                          }
                          onClick={() => setDownloaded(file.name)}
                        >
                          {downloaded === file.name ? (
                            <CheckIcon aria-hidden="true" />
                          ) : (
                            <DownloadIcon aria-hidden="true" />
                          )}
                        </AttachmentAction>
                      </AttachmentActions>
                    </Attachment>
                  </li>
                );
              })}
            </ul>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
