"use client";

import * as React from "react";
import { Trash2Icon, UploadIcon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/registry/base/ui/avatar";
import { Button } from "@/registry/base/ui/button";

const maxBytes = 2 * 1024 * 1024;

export default function Avatar11() {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  // Revoke the previous object URL whenever the photo changes or unmounts.
  React.useEffect(() => {
    return () => {
      if (photo?.startsWith("blob:")) URL.revokeObjectURL(photo);
    };
  }, [photo]);

  function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("That file isn't an image. Choose a PNG, JPG, or WebP.");
      return;
    }
    if (file.size > maxBytes) {
      setError("That image is over 2 MB. Choose a smaller one.");
      return;
    }
    setError(null);
    setPhoto(URL.createObjectURL(file));
  }

  return (
    <section
      aria-labelledby="avatar-11-title"
      className="flex w-full max-w-md flex-col gap-4 rounded-xl border bg-card p-5 text-card-foreground"
    >
      <div className="flex flex-col gap-1">
        <h3 id="avatar-11-title" className="text-sm font-medium">
          Profile photo
        </h3>
        <p className="text-sm text-muted-foreground">
          Shown on your comments, mentions, and in the team directory.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <Avatar className="size-16">
          {photo && <AvatarImage src={photo} alt="Your profile photo" />}
          <AvatarFallback className="text-lg font-medium">AM</AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => inputRef.current?.click()}
            >
              <UploadIcon data-icon="inline-start" aria-hidden="true" />
              {photo ? "Replace photo" : "Upload photo"}
            </Button>
            {photo && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setPhoto(null)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2Icon data-icon="inline-start" aria-hidden="true" />
                Remove
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Square images work best. PNG, JPG, or WebP up to 2 MB.
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleFile}
          className="sr-only"
          tabIndex={-1}
          aria-label="Profile photo file"
        />
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </section>
  );
}
