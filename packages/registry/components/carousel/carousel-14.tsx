"use client";

import * as React from "react";
import {
  DownloadIcon,
  FileTextIcon,
  ImageIcon,
  PaperclipIcon,
} from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/registry/base/ui/carousel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/registry/base/ui/dialog";

const attachments = [
  {
    id: "safari-checkout",
    name: "safari-checkout.png",
    kind: "image",
    size: "412 KB",
    uploadedBy: "Nora Blake",
    caption: "iPhone 15, Safari 18 — Pay button sits under the home bar.",
  },
  {
    id: "chrome-checkout",
    name: "chrome-checkout.png",
    kind: "image",
    size: "388 KB",
    uploadedBy: "Nora Blake",
    caption: "Pixel 8, Chrome — same screen renders correctly.",
  },
  {
    id: "safe-area-fix",
    name: "safe-area-fix.png",
    kind: "image",
    size: "295 KB",
    uploadedBy: "Omar Haddad",
    caption: "Proposed fix: pad the sticky footer with the safe-area inset.",
  },
  {
    id: "qa-report",
    name: "qa-report-sep-22.pdf",
    kind: "document",
    size: "1.2 MB",
    uploadedBy: "Omar Haddad",
    caption: "Regression checklist for the checkout flow, 18 of 18 passing.",
  },
];

export default function Carousel14() {
  const [open, setOpen] = React.useState(false);
  const [startIndex, setStartIndex] = React.useState(0);
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);

  React.useEffect(() => {
    if (!api) return;
    const onSelect = () => setCurrent(api.selectedScrollSnap());
    onSelect();
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  const openAt = (index: number) => {
    setStartIndex(index);
    setCurrent(index);
    setOpen(true);
  };

  const file = attachments[current];

  return (
    <div className="flex w-full max-w-md flex-col gap-3 rounded-xl border bg-card p-4 text-card-foreground">
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-medium">
          WEB-482 · Checkout button hidden on iOS Safari
        </h3>
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <PaperclipIcon aria-hidden="true" className="size-3.5" />
          {attachments.length} attachments
        </p>
      </div>

      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {attachments.map((attachment, index) => (
          <li key={attachment.id}>
            <button
              type="button"
              onClick={() => openAt(index)}
              aria-label={`Preview ${attachment.name}`}
              className="flex w-full flex-col overflow-hidden rounded-lg border bg-background text-left outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {attachment.kind === "image" ? (
                <img
                  src="/placeholder.svg"
                  alt=""
                  className="aspect-[4/3] w-full bg-muted object-cover"
                />
              ) : (
                <span className="flex aspect-[4/3] w-full items-center justify-center bg-muted">
                  <FileTextIcon
                    aria-hidden="true"
                    className="size-6 text-muted-foreground"
                  />
                </span>
              )}
              <span className="truncate px-2 py-1.5 text-xs">
                {attachment.name}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-xl">
          <div className="flex flex-col gap-0.5 border-b p-4 pr-12">
            <DialogTitle className="flex items-center gap-2 truncate">
              {file.kind === "image" ? (
                <ImageIcon aria-hidden="true" className="size-4 shrink-0" />
              ) : (
                <FileTextIcon aria-hidden="true" className="size-4 shrink-0" />
              )}
              <span className="truncate">{file.name}</span>
            </DialogTitle>
            <DialogDescription className="tabular-nums">
              {current + 1} of {attachments.length} · {file.size} · Uploaded by{" "}
              {file.uploadedBy}
            </DialogDescription>
          </div>

          <Carousel
            setApi={setApi}
            opts={{ startIndex }}
            aria-label="Attachment previews"
            className="bg-muted"
          >
            <CarouselContent>
              {attachments.map((attachment, index) => (
                <CarouselItem
                  key={attachment.id}
                  aria-label={`${index + 1} of ${attachments.length}: ${attachment.name}`}
                >
                  {attachment.kind === "image" ? (
                    <img
                      src="/placeholder.svg"
                      alt={attachment.caption}
                      className="aspect-video w-full object-contain"
                    />
                  ) : (
                    <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 text-muted-foreground">
                      <FileTextIcon
                        aria-hidden="true"
                        className="size-10"
                        strokeWidth={1.5}
                      />
                      <span className="text-sm">PDF preview unavailable</span>
                    </div>
                  )}
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-3 bg-background/90" />
            <CarouselNext className="right-3 bg-background/90" />
          </Carousel>

          <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">{file.caption}</p>
            <Button
              variant="outline"
              className="shrink-0"
              nativeButton={false}
              render={<a href="/placeholder.svg" download={file.name} />}
            >
              <DownloadIcon aria-hidden="true" />
              Download
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
