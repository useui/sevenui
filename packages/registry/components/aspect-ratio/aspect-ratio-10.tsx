"use client";

import { Paperclip } from "lucide-react";
import * as React from "react";

import { AspectRatio } from "@/registry/base/ui/aspect-ratio";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/registry/base/ui/dialog";

const photos = [
  { id: "box", caption: "Outer box, crushed corner" },
  { id: "lamp", caption: "Lamp shade, cracked rim" },
  { id: "base", caption: "Base plate, scratched finish" },
  { id: "label", caption: "Shipping label, order SR-48213" },
  { id: "cable", caption: "Power cable, bent connector" },
];

const visible = photos.slice(0, 3);
const hidden = photos.length - visible.length;

export default function AspectRatio10() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);
  // Remember the last photo so the dialog keeps its content while it closes.
  const [lastIndex, setLastIndex] = React.useState(0);
  const shownIndex = openIndex ?? lastIndex;
  const active = photos[shownIndex];

  const openPhoto = (index: number) => {
    setLastIndex(index);
    setOpenIndex(index);
  };

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex flex-col items-end gap-1">
        <div className="w-full max-w-64 rounded-2xl rounded-br-md bg-primary p-1 text-primary-foreground">
          <ul aria-label="Attached photos" className="grid grid-cols-2 gap-1">
            {visible.map((photo, index) => {
              const isLast = index === visible.length - 1 && hidden > 0;
              return (
                <li key={photo.id} className={index === 0 ? "col-span-2" : undefined}>
                  <button
                    type="button"
                    onClick={() => openPhoto(index)}
                    aria-label={
                      isLast
                        ? `Open ${photo.caption} and ${hidden} more photos`
                        : `Open ${photo.caption}`
                    }
                    className="block w-full overflow-hidden rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring"
                  >
                    <AspectRatio ratio={index === 0 ? 2 / 1 : 1} className="bg-muted">
                      <img
                        src="/placeholder.svg"
                        alt=""
                        className="absolute inset-0 size-full object-cover"
                      />
                      {isLast ? (
                        <span className="absolute inset-0 flex items-center justify-center bg-foreground/60 text-lg font-semibold text-background">
                          +{hidden}
                        </span>
                      ) : null}
                    </AspectRatio>
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="px-2.5 pt-2 pb-1.5 text-sm">
            The lamp arrived like this. Box was already crushed at delivery.
          </p>
        </div>
        <span className="text-xs text-muted-foreground">
          You · 9:41 AM · <Paperclip aria-hidden="true" className="inline size-3" />{" "}
          {photos.length} photos
        </span>
      </div>
      <div className="flex flex-col items-start gap-1">
        <p className="max-w-64 rounded-2xl rounded-bl-md bg-muted px-3 py-2 text-sm">
          Thanks, Daniel. The photos are clear enough to approve a replacement
          without a return. A new lamp ships today.
        </p>
        <span className="text-xs text-muted-foreground">Nora · Support · 9:43 AM</span>
      </div>

      <Dialog
        open={openIndex !== null}
        onOpenChange={(open) => {
          if (!open) setOpenIndex(null);
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{active.caption}</DialogTitle>
            <DialogDescription>
              Photo {shownIndex + 1} of {photos.length} · Attached to
              ticket SR-7730
            </DialogDescription>
          </DialogHeader>
          <AspectRatio ratio={4 / 3} className="overflow-hidden rounded-lg bg-muted">
            <img
              src="/placeholder.svg"
              alt={active.caption}
              className="absolute inset-0 size-full object-contain"
            />
          </AspectRatio>
          <ul aria-label="All photos" className="grid grid-cols-5 gap-2">
            {photos.map((photo, index) => (
              <li key={photo.id}>
                <button
                  type="button"
                  aria-label={photo.caption}
                  aria-current={index === shownIndex ? "true" : undefined}
                  onClick={() => openPhoto(index)}
                  className="block w-full overflow-hidden rounded-md opacity-60 outline-none transition-opacity hover:opacity-100 focus-visible:ring-3 focus-visible:ring-ring/50 aria-[current=true]:opacity-100 aria-[current=true]:ring-2 aria-[current=true]:ring-primary"
                >
                  <AspectRatio ratio={1} className="bg-muted">
                    <img
                      src="/placeholder.svg"
                      alt=""
                      className="absolute inset-0 size-full object-cover"
                    />
                  </AspectRatio>
                </button>
              </li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>
    </div>
  );
}
