"use client";

import { Check, Heart, MessageCircle, Send } from "lucide-react";
import * as React from "react";

import { AspectRatio } from "@/registry/base/ui/aspect-ratio";
import { Avatar, AvatarFallback, AvatarImage } from "@/registry/base/ui/avatar";
import { Button } from "@/registry/base/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/registry/base/ui/toggle-group";

const crops = [
  { id: "square", label: "Square", ratio: 1, export: "1080 × 1080" },
  { id: "portrait", label: "Portrait", ratio: 4 / 5, export: "1080 × 1350" },
  { id: "landscape", label: "Landscape", ratio: 1.91, export: "1200 × 628" },
];

export default function AspectRatio12() {
  const [cropId, setCropId] = React.useState("portrait");
  // The crop last applied to the post; Reset returns to it.
  const [appliedId, setAppliedId] = React.useState<string | null>(null);
  const baseline = appliedId ?? "portrait";
  const applied = appliedId === cropId;
  const crop = crops.find((option) => option.id === cropId) ?? crops[0];

  return (
    <section
      aria-labelledby="aspect-ratio-12-title"
      className="w-full max-w-sm rounded-xl border bg-card text-card-foreground"
    >
      <div className="grid gap-3 border-b p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
          <h3 id="aspect-ratio-12-title" className="whitespace-nowrap font-medium">
            Crop for feed
          </h3>
          <span className="whitespace-nowrap text-xs text-muted-foreground tabular-nums">
            Exports at {crop.export} px
          </span>
        </div>
        <ToggleGroup
          aria-label="Crop ratio"
          variant="outline"
          size="sm"
          spacing={0}
          value={[cropId]}
          onValueChange={(next) => {
            if (next[0]) setCropId(next[0]);
          }}
          className="w-full"
        >
          {crops.map((option) => (
            <ToggleGroupItem key={option.id} value={option.id} className="flex-1">
              {option.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
      <div className="bg-muted/40 p-4">
        <figure
          aria-label="Post preview"
          className="mx-auto w-full max-w-72 overflow-hidden rounded-lg border bg-background"
        >
          <div className="flex items-center gap-2 p-2.5">
            <Avatar className="size-7">
              <AvatarImage src="/placeholder.svg" alt="" />
              <AvatarFallback>FH</AvatarFallback>
            </Avatar>
            <div className="text-xs leading-tight">
              <p className="font-medium">fieldhouse.coffee</p>
              <p className="text-muted-foreground">Sponsored</p>
            </div>
          </div>
          <AspectRatio
            ratio={crop.ratio}
            className="overflow-hidden bg-muted transition-[aspect-ratio] duration-300 ease-out motion-reduce:transition-none"
          >
            <img
              src="/placeholder.svg"
              alt="Pour-over coffee on a wooden counter"
              className="absolute inset-0 size-full object-cover"
            />
          </AspectRatio>
          <div className="flex gap-1 px-1.5 pt-1.5" aria-hidden="true">
            <Heart className="m-1 size-4" />
            <MessageCircle className="m-1 size-4" />
            <Send className="m-1 size-4" />
          </div>
          <figcaption className="px-2.5 pt-1 pb-3 text-xs">
            <span className="font-medium">fieldhouse.coffee</span> New Ethiopian
            single origin lands Friday. Bright, floral, a little jammy.
          </figcaption>
        </figure>
      </div>
      <div className="flex justify-end gap-2 border-t p-3">
        <Button
          variant="ghost"
          size="sm"
          disabled={cropId === baseline}
          focusableWhenDisabled
          onClick={() => setCropId(baseline)}
        >
          Reset
        </Button>
        <Button
          size="sm"
          disabled={applied}
          focusableWhenDisabled
          onClick={() => setAppliedId(cropId)}
        >
          {applied ? (
            <>
              <Check aria-hidden="true" data-icon="inline-start" />
              Crop applied
            </>
          ) : (
            "Apply crop"
          )}
        </Button>
      </div>
    </section>
  );
}
