"use client";

import { ImageUp, Trash2 } from "lucide-react";
import * as React from "react";

import { AspectRatio } from "@/registry/base/ui/aspect-ratio";
import { Avatar, AvatarFallback, AvatarImage } from "@/registry/base/ui/avatar";
import { Button } from "@/registry/base/ui/button";

export default function AspectRatio09() {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [cover, setCover] = React.useState<string | null>("/placeholder.svg");
  const [fileName, setFileName] = React.useState("team-offsite-lisbon.jpg");

  // Revoke object URLs created for local previews when they are replaced.
  React.useEffect(() => {
    return () => {
      if (cover?.startsWith("blob:")) URL.revokeObjectURL(cover);
    };
  }, [cover]);

  return (
    <section
      aria-labelledby="aspect-ratio-09-title"
      className="w-full max-w-lg rounded-xl border bg-card text-card-foreground"
    >
      <div className="border-b p-4">
        <h3 id="aspect-ratio-09-title" className="font-medium">
          Profile cover
        </h3>
        <p className="text-sm text-muted-foreground">
          Shown at the top of your public profile and in team directories.
        </p>
      </div>
      <div className="p-4">
        <div className="relative">
          <AspectRatio
            ratio={3 / 1}
            className="overflow-hidden rounded-lg border bg-muted"
          >
            {cover ? (
              <img
                src={cover}
                alt="Current profile cover"
                className="absolute inset-0 size-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
                No cover image
              </div>
            )}
          </AspectRatio>
          <Avatar className="absolute -bottom-7 left-4 size-16 ring-4 ring-card">
            <AvatarImage src="/placeholder.svg" alt="Priya Raman" />
            <AvatarFallback>PR</AvatarFallback>
          </Avatar>
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0 text-sm">
            <p className="truncate font-medium">
              {cover ? fileName : "Using the default cover"}
            </p>
            <p className="text-muted-foreground">
              3:1 ratio · 1500 × 500 px recommended · JPG or PNG up to 5 MB
            </p>
          </div>
          <div className="flex gap-2">
            <input
              ref={inputRef}
              id="aspect-ratio-09-file"
              type="file"
              accept="image/png, image/jpeg"
              className="sr-only"
              tabIndex={-1}
              aria-hidden="true"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                setCover(URL.createObjectURL(file));
                setFileName(file.name);
                event.target.value = "";
              }}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => inputRef.current?.click()}
            >
              <ImageUp aria-hidden="true" data-icon="inline-start" />
              {cover ? "Replace" : "Upload"}
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Remove cover image"
              disabled={!cover}
              onClick={() => setCover(null)}
            >
              <Trash2 aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
