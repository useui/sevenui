"use client";

import * as React from "react";
import {
  AlertCircleIcon,
  CheckIcon,
  DownloadIcon,
  FileTextIcon,
  RotateCwIcon,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/registry/base/ui/avatar";
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from "@/registry/base/ui/attachment";
import { Bubble, BubbleContent } from "@/registry/base/ui/bubble";
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageHeader,
} from "@/registry/base/ui/message";
import { Spinner } from "@/registry/base/ui/spinner";

const photos = [
  { id: "p1", alt: "Living room with the new oak shelving installed" },
  { id: "p2", alt: "Close-up of the shelf bracket finish" },
  { id: "p3", alt: "Kitchen corner before the countertop fitting" },
];

type Upload = {
  id: string;
  name: string;
  state: "uploading" | "error" | "done";
  progress: number;
};

const initialUploads: Upload[] = [
  { id: "u1", name: "materials-list.xlsx", state: "uploading", progress: 64 },
  { id: "u2", name: "floor-plan-v3.pdf", state: "error", progress: 0 },
];

export default function Message03() {
  const [downloaded, setDownloaded] = React.useState(false);
  const [uploads, setUploads] = React.useState(initialUploads);
  const uploading = uploads.some((upload) => upload.state === "uploading");
  const failed = uploads.filter((upload) => upload.state === "error").length;

  // Advance every in-flight upload until it completes.
  React.useEffect(() => {
    if (!uploading) return;
    const timer = window.setInterval(() => {
      setUploads((current) =>
        current.map((upload) => {
          if (upload.state !== "uploading") return upload;
          const progress = Math.min(upload.progress + 12, 100);
          return {
            ...upload,
            progress,
            state: progress === 100 ? "done" : "uploading",
          };
        }),
      );
    }, 300);
    return () => window.clearInterval(timer);
  }, [uploading]);

  React.useEffect(() => {
    if (!downloaded) return;
    const timer = window.setTimeout(() => setDownloaded(false), 2000);
    return () => window.clearTimeout(timer);
  }, [downloaded]);

  function retry(id: string) {
    setUploads((current) =>
      current.map((upload) =>
        upload.id === id
          ? { ...upload, state: "uploading", progress: 0 }
          : upload,
      ),
    );
  }

  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      <Message>
        <MessageAvatar>
          <Avatar className="size-8">
            <AvatarFallback>TB</AvatarFallback>
          </Avatar>
        </MessageAvatar>
        <MessageContent>
          <MessageHeader>Tomás Bauer · Site visit</MessageHeader>
          <div className="grid w-full max-w-72 grid-cols-2 gap-1 overflow-hidden rounded-3xl">
            {photos.map((photo, index) => (
              <img
                key={photo.id}
                src="/placeholder.svg"
                alt={photo.alt}
                className={
                  index === 0
                    ? "col-span-2 aspect-video w-full bg-muted object-cover"
                    : "aspect-square w-full bg-muted object-cover"
                }
              />
            ))}
          </div>
          <Bubble variant="muted">
            <BubbleContent>
              Shelving is in. Countertop fitting moves to Monday.
            </BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
      <Message align="end">
        <MessageContent>
          <Bubble align="end">
            <BubbleContent>
              Here are the signed quote and the materials list.
            </BubbleContent>
          </Bubble>
          <div className="flex w-full max-w-72 flex-col gap-2 self-end">
            <Attachment className="w-full">
              <AttachmentMedia>
                <FileTextIcon aria-hidden="true" />
              </AttachmentMedia>
              <AttachmentContent>
                <AttachmentTitle>quote-signed.pdf</AttachmentTitle>
                <AttachmentDescription>PDF · 412 KB</AttachmentDescription>
              </AttachmentContent>
              <AttachmentActions>
                <AttachmentAction
                  aria-label={
                    downloaded
                      ? "quote-signed.pdf downloaded"
                      : "Download quote-signed.pdf"
                  }
                  onClick={() => setDownloaded(true)}
                >
                  {downloaded ? (
                    <CheckIcon aria-hidden="true" className="text-success" />
                  ) : (
                    <DownloadIcon aria-hidden="true" />
                  )}
                </AttachmentAction>
              </AttachmentActions>
            </Attachment>
            {uploads.map((upload) => (
              <Attachment
                key={upload.id}
                state={upload.state}
                className="w-full"
              >
                <AttachmentMedia>
                  {upload.state === "uploading" ? (
                    <Spinner />
                  ) : (
                    <FileTextIcon aria-hidden="true" />
                  )}
                </AttachmentMedia>
                <AttachmentContent>
                  <AttachmentTitle>{upload.name}</AttachmentTitle>
                  <AttachmentDescription>
                    {upload.state === "uploading"
                      ? `Uploading · ${upload.progress}%`
                      : upload.state === "error"
                        ? "Upload failed · connection lost"
                        : "Uploaded"}
                  </AttachmentDescription>
                </AttachmentContent>
                {upload.state === "error" && (
                  <AttachmentActions>
                    <AttachmentAction
                      aria-label={`Retry ${upload.name}`}
                      onClick={() => retry(upload.id)}
                    >
                      <RotateCwIcon aria-hidden="true" />
                    </AttachmentAction>
                  </AttachmentActions>
                )}
              </Attachment>
            ))}
          </div>
          <MessageFooter
            aria-live="polite"
            className={failed > 0 ? "gap-1 text-destructive" : "gap-1"}
          >
            {failed > 0 ? (
              <>
                <AlertCircleIcon aria-hidden="true" className="size-3.5" />
                {failed === 1 ? "1 file needs" : `${failed} files need`}{" "}
                attention
              </>
            ) : uploading ? (
              "Uploading…"
            ) : (
              "All files sent"
            )}
          </MessageFooter>
        </MessageContent>
      </Message>
    </div>
  );
}
