"use client";

import * as React from "react";
import {
  CheckIcon,
  CircleAlertIcon,
  FileImageIcon,
  FileTextIcon,
  RotateCcwIcon,
  ScanSearchIcon,
  XIcon,
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
import { Spinner } from "@/registry/base/ui/spinner";

export default function Attachment03() {
  const [retrying, setRetrying] = React.useState(false);
  const [recovered, setRecovered] = React.useState(false);
  const [dismissed, setDismissed] = React.useState<string[]>([]);

  function dismiss(id: string) {
    setDismissed((current) => [...current, id]);
  }


  React.useEffect(() => {
    if (!retrying) return;
    const timeout = window.setTimeout(() => {
      setRetrying(false);
      setRecovered(true);
    }, 1600);
    return () => window.clearTimeout(timeout);
  }, [retrying]);

  const errorState = recovered ? "done" : retrying ? "uploading" : "error";

  return (
    <div className="flex w-full max-w-sm flex-col gap-2.5">
      <ul aria-label="Upload states" className="flex flex-col gap-2.5">
        {dismissed.includes("queued") ? null : (
          <li>
            <Attachment state="idle" className="w-full">
              <AttachmentMedia>
                <FileTextIcon aria-hidden="true" />
              </AttachmentMedia>
              <AttachmentContent>
                <AttachmentTitle>tax-return-2025.pdf</AttachmentTitle>
                <AttachmentDescription>Queued · starts after 2 files</AttachmentDescription>
              </AttachmentContent>
              <AttachmentActions>
                <AttachmentAction
                  aria-label="Remove tax-return-2025.pdf from queue"
                  onClick={() => dismiss("queued")}
                >
                  <XIcon aria-hidden="true" />
                </AttachmentAction>
              </AttachmentActions>
            </Attachment>
          </li>
        )}
        {dismissed.includes("uploading") ? null : (
          <li>
            <Attachment state="uploading" className="w-full" aria-busy="true">
              <AttachmentMedia>
                <Spinner aria-label="Uploading" />
              </AttachmentMedia>
              <AttachmentContent>
                <AttachmentTitle>w2-acme-corp.pdf</AttachmentTitle>
                <AttachmentDescription className="tabular-nums">
                  Uploading · 1.1 of 1.8 MB
                </AttachmentDescription>
              </AttachmentContent>
              <AttachmentActions>
                <AttachmentAction
                  aria-label="Cancel upload of w2-acme-corp.pdf"
                  onClick={() => dismiss("uploading")}
                >
                  <XIcon aria-hidden="true" />
                </AttachmentAction>
              </AttachmentActions>
            </Attachment>
          </li>
        )}
        <li>
          <Attachment state="processing" className="w-full" aria-busy="true">
            <AttachmentMedia>
              <ScanSearchIcon aria-hidden="true" className="animate-pulse" />
            </AttachmentMedia>
            <AttachmentContent>
              <AttachmentTitle>1099-int-statement.pdf</AttachmentTitle>
              <AttachmentDescription>Extracting totals…</AttachmentDescription>
            </AttachmentContent>
          </Attachment>
        </li>
        <li>
          <Attachment state={errorState} className="w-full" aria-live="polite">
            <AttachmentMedia>
              {errorState === "uploading" ? (
                <Spinner aria-label="Retrying" />
              ) : errorState === "done" ? (
                <FileImageIcon aria-hidden="true" />
              ) : (
                <CircleAlertIcon aria-hidden="true" />
              )}
            </AttachmentMedia>
            <AttachmentContent>
              <AttachmentTitle>receipt-scan.heic</AttachmentTitle>
              <AttachmentDescription>
                {errorState === "error"
                  ? "Upload failed · connection lost"
                  : errorState === "uploading"
                    ? "Retrying…"
                    : "2.9 MB · Uploaded"}
              </AttachmentDescription>
            </AttachmentContent>
            {errorState === "error" ? (
              <AttachmentActions>
                <AttachmentAction
                  aria-label="Retry upload of receipt-scan.heic"
                  onClick={() => setRetrying(true)}
                >
                  <RotateCcwIcon aria-hidden="true" />
                </AttachmentAction>
              </AttachmentActions>
            ) : null}
          </Attachment>
        </li>
        <li>
          <Attachment state="done" className="w-full">
            <AttachmentMedia className="bg-success/10 text-success">
              <CheckIcon aria-hidden="true" />
            </AttachmentMedia>
            <AttachmentContent>
              <AttachmentTitle>mortgage-interest-1098.pdf</AttachmentTitle>
              <AttachmentDescription>640 KB · Verified</AttachmentDescription>
            </AttachmentContent>
          </Attachment>
        </li>
      </ul>
      {dismissed.length > 0 ? (
        <button
          type="button"
          className="self-start px-1 text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
          onClick={() => setDismissed([])}
        >
          Restore removed files
        </button>
      ) : null}
    </div>
  );
}
