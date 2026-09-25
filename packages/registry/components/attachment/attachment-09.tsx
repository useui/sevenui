"use client";

import * as React from "react";
import {
  CheckIcon,
  FileTextIcon,
  ImageIcon,
  PaperclipIcon,
  SendIcon,
  XIcon,
} from "lucide-react";

import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
} from "@/registry/base/ui/attachment";
import { Button } from "@/registry/base/ui/button";
import { Label } from "@/registry/base/ui/label";
import { Textarea } from "@/registry/base/ui/textarea";

const initialFiles = [
  {
    id: "crash-log",
    name: "crash-log-0921.txt",
    meta: "18 KB · Text",
    kind: "doc",
  },
  {
    id: "screenshot",
    name: "checkout-error.png",
    meta: "412 KB · PNG",
    kind: "image",
  },
  {
    id: "har",
    name: "network-trace.har",
    meta: "2.4 MB · HAR",
    kind: "doc",
  },
] as const;

type SupportFile = (typeof initialFiles)[number];

export default function Attachment09() {
  const [files, setFiles] = React.useState<SupportFile[]>([
    ...initialFiles,
  ]);
  const [message, setMessage] = React.useState(
    "The payment step freezes after I confirm the card. Logs and a trace are attached.",
  );

  const [sent, setSent] = React.useState(false);

  function removeFile(id: string) {
    setFiles((current) => current.filter((file) => file.id !== id));
  }

  return (
    <form
      className="w-full max-w-md rounded-2xl border bg-card p-3 text-card-foreground shadow-xs"
      onSubmit={(event) => {
        event.preventDefault();
        if (message.trim().length === 0) return;
        setSent(true);
        setMessage("");
        setFiles([]);
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5 px-1 pb-2">
        <Label htmlFor="attachment-09-reply">Reply to ticket SUP-4821</Label>
        <span
          aria-live="polite"
          className="flex shrink-0 items-center gap-1 text-xs whitespace-nowrap text-muted-foreground"
        >
          {sent ? (
            <>
              <CheckIcon aria-hidden="true" className="size-3.5 text-success" />
              Reply sent
            </>
          ) : (
            "Priority support"
          )}
        </span>
      </div>
      <Textarea
        id="attachment-09-reply"
        value={message}
        onChange={(event) => {
          setMessage(event.target.value);
          setSent(false);
        }}
        placeholder="Describe what happened…"
        className="min-h-20 resize-none"
      />
      {files.length > 0 ? (
        <AttachmentGroup
          aria-label={`${files.length} attached files`}
          className="mt-3"
          role="list"
        >
          {files.map((file) => (
            <Attachment
              key={file.id}
              size="sm"
              role="listitem"
              className="max-w-56"
            >
              <AttachmentMedia>
                {file.kind === "image" ? (
                  <ImageIcon aria-hidden="true" />
                ) : (
                  <FileTextIcon aria-hidden="true" />
                )}
              </AttachmentMedia>
              <AttachmentContent>
                <AttachmentTitle>{file.name}</AttachmentTitle>
                <AttachmentDescription>{file.meta}</AttachmentDescription>
              </AttachmentContent>
              <AttachmentActions>
                <AttachmentAction
                  aria-label={`Remove ${file.name}`}
                  onClick={() => removeFile(file.id)}
                >
                  <XIcon aria-hidden="true" />
                </AttachmentAction>
              </AttachmentActions>
            </Attachment>
          ))}
        </AttachmentGroup>
      ) : null}
      <div className="mt-3 flex items-center justify-between gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setFiles([...initialFiles])}
          disabled={files.length === initialFiles.length}
        >
          <PaperclipIcon aria-hidden="true" />
          Attach files
        </Button>
        <Button type="submit" size="sm" disabled={message.trim().length === 0}>
          Send reply
          <SendIcon aria-hidden="true" />
        </Button>
      </div>
    </form>
  );
}
