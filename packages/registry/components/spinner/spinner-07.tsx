"use client";

import { CameraIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/registry/base/ui/avatar";
import { Button } from "@/registry/base/ui/button";
import { Spinner } from "@/registry/base/ui/spinner";

export default function Spinner07() {
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!uploading) return;
    const timer = window.setTimeout(() => setUploading(false), 2400);
    return () => window.clearTimeout(timer);
  }, [uploading]);

  return (
    <div className="flex w-full max-w-sm items-center gap-4 rounded-xl border border-border bg-card p-4">
      <div className="relative shrink-0">
        <Avatar className="size-16" aria-busy={uploading || undefined}>
          <AvatarImage src="/placeholder.svg" alt="Maya Lin" />
          <AvatarFallback className="text-base">ML</AvatarFallback>
        </Avatar>
        {uploading ? (
          <span className="absolute inset-0 z-10 flex items-center justify-center rounded-full bg-background/70 backdrop-blur-[2px]">
            <Spinner aria-label="Uploading photo" className="size-6" />
          </span>
        ) : null}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-col">
          <span className="truncate text-sm font-medium">Maya Lin</span>
          <span className="truncate text-xs text-muted-foreground">
            {uploading
              ? "Uploading portrait.jpg · 1.8 MB"
              : "PNG or JPG, up to 5 MB"}
          </span>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="w-fit"
          disabled={uploading}
          onClick={() => setUploading(true)}
        >
          <CameraIcon aria-hidden="true" data-icon="inline-start" />
          {uploading ? "Uploading…" : "Change photo"}
        </Button>
      </div>
    </div>
  );
}
