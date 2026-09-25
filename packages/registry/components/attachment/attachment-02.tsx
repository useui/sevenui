"use client";

import * as React from "react";
import {
  CheckIcon,
  DownloadIcon,
  FileTextIcon,
  FileVideoIcon,
  FolderArchiveIcon,
  PresentationIcon,
} from "lucide-react";
import { cn } from "cn";

import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from "@/registry/base/ui/attachment";

const styles = [
  {
    label: "Outline",
    className: "",
    mediaClassName: "",
    icon: FileTextIcon,
    name: "master-services-agreement.pdf",
    meta: "2.4 MB · PDF",
  },
  {
    label: "Subtle",
    className: "border-transparent bg-muted/60",
    mediaClassName: "bg-background",
    icon: PresentationIcon,
    name: "series-a-pitch.key",
    meta: "18 MB · Keynote",
  },
  {
    label: "Elevated",
    className: "border-border/60 shadow-md shadow-foreground/5",
    mediaClassName: "",
    icon: FileVideoIcon,
    name: "onboarding-walkthrough.mp4",
    meta: "64 MB · Video",
  },
  {
    label: "Ghost",
    className: "border-transparent bg-transparent hover:bg-muted/50",
    mediaClassName: "bg-transparent",
    icon: FolderArchiveIcon,
    name: "brand-kit-2026.zip",
    meta: "112 MB · Archive",
  },
];

export default function Attachment02() {
  const [downloaded, setDownloaded] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!downloaded) return;
    const timeout = window.setTimeout(() => setDownloaded(null), 1600);
    return () => window.clearTimeout(timeout);
  }, [downloaded]);

  return (
    <div className="grid w-full max-w-lg grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2">
      {styles.map((style) => {
        const Icon = style.icon;
        return (
          <figure key={style.label} className="flex min-w-0 flex-col gap-2">
            <Attachment className={cn("w-full", style.className)}>
              <AttachmentMedia className={style.mediaClassName}>
                <Icon aria-hidden="true" />
              </AttachmentMedia>
              <AttachmentContent>
                <AttachmentTitle>{style.name}</AttachmentTitle>
                <AttachmentDescription>{style.meta}</AttachmentDescription>
              </AttachmentContent>
              <AttachmentActions>
                <AttachmentAction
                  aria-label={
                    downloaded === style.name
                      ? `Downloaded ${style.name}`
                      : `Download ${style.name}`
                  }
                  onClick={() => setDownloaded(style.name)}
                >
                  {downloaded === style.name ? (
                    <CheckIcon aria-hidden="true" />
                  ) : (
                    <DownloadIcon aria-hidden="true" />
                  )}
                </AttachmentAction>
              </AttachmentActions>
            </Attachment>
            <figcaption className="px-1 text-xs text-muted-foreground">
              {style.label}
            </figcaption>
          </figure>
        );
      })}
    </div>
  );
}
