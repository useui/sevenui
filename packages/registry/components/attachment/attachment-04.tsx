"use client";

import * as React from "react";
import { XIcon } from "lucide-react";

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

type Photo = { id: string; name: string; size: string; alt: string };

const initialPhotos: Photo[] = [
  {
    id: "front",
    name: "sofa-front.jpg",
    size: "2.1 MB",
    alt: "Linen sofa, front view",
  },
  {
    id: "side",
    name: "sofa-side.jpg",
    size: "1.8 MB",
    alt: "Linen sofa, side profile",
  },
  {
    id: "detail",
    name: "fabric-detail.jpg",
    size: "940 KB",
    alt: "Close-up of the linen weave",
  },
  {
    id: "room",
    name: "living-room.jpg",
    size: "3.4 MB",
    alt: "Sofa styled in a living room",
  },
];

export default function Attachment04() {
  const [photos, setPhotos] = React.useState(initialPhotos);
  const [removed, setRemoved] = React.useState<{
    photo: Photo;
    index: number;
  } | null>(null);

  function remove(index: number) {
    setRemoved({ photo: photos[index], index });
    setPhotos((current) => current.filter((_, i) => i !== index));
  }

  function undo() {
    if (!removed) return;
    setPhotos((current) => {
      const next = [...current];
      next.splice(removed.index, 0, removed.photo);
      return next;
    });
    setRemoved(null);
  }

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-sm font-medium">Listing photos</h3>
        <span className="text-xs text-muted-foreground tabular-nums">
          {photos.length} of 8
        </span>
      </div>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {photos.map((photo, index) => (
          <li key={photo.id} className="min-w-0">
            <Attachment
              orientation="vertical"
              className="w-full has-data-[slot=attachment-content]:w-full"
            >
              <AttachmentMedia variant="image">
                <img src="/placeholder.svg" alt={photo.alt} />
              </AttachmentMedia>
              <AttachmentContent className="w-full">
                <AttachmentTitle>{photo.name}</AttachmentTitle>
                <AttachmentDescription>{photo.size}</AttachmentDescription>
              </AttachmentContent>
              <AttachmentActions>
                <AttachmentAction
                  variant="secondary"
                  className="rounded-full shadow-sm"
                  aria-label={`Remove ${photo.name}`}
                  onClick={() => remove(index)}
                >
                  <XIcon aria-hidden="true" />
                </AttachmentAction>
              </AttachmentActions>
            </Attachment>
          </li>
        ))}
      </ul>
      <div
        aria-live="polite"
        className="flex min-h-7 items-center justify-between gap-3 text-xs text-muted-foreground"
      >
        {removed ? (
          <>
            <span className="min-w-0 truncate">
              Removed {removed.photo.name}
            </span>
            <Button variant="ghost" size="xs" onClick={undo}>
              Undo
            </Button>
          </>
        ) : photos.length === 0 ? (
          <span>No photos yet. Listings with photos get 3× more views.</span>
        ) : null}
      </div>
    </div>
  );
}
