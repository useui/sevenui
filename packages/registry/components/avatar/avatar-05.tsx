"use client";

import * as React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/registry/base/ui/avatar";
import { Badge } from "@/registry/base/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/registry/base/ui/toggle-group";

type Status = "idle" | "loading" | "loaded" | "error";

const sources = [
  { value: "valid", label: "Valid image", src: "/placeholder.svg" },
  // An undecodable data URI fails like a dead link, without a network 404.
  { value: "broken", label: "Broken URL", src: "data:image/png;base64,broken" },
  { value: "none", label: "No image", src: undefined },
];

const messages: Record<Status, string> = {
  idle: "No image set. Initials render right away.",
  loading: "Fetching the photo. The fallback waits 600 ms to avoid a flash.",
  loaded: "Photo loaded and faded in.",
  error: "The photo failed to load, so initials took its place.",
};

const statusLabel: Record<Status, string> = {
  idle: "Idle",
  loading: "Loading",
  loaded: "Loaded",
  error: "Error",
};

const statusVariant: Record<Status, "secondary" | "outline" | "destructive"> =
  {
    idle: "outline",
    loading: "secondary",
    loaded: "secondary",
    error: "destructive",
  };

export default function Avatar05() {
  const [source, setSource] = React.useState("valid");
  const [status, setStatus] = React.useState<Status>("loading");
  const current = sources.find((item) => item.value === source) ?? sources[0];

  function handleSourceChange(value: string[]) {
    const next = value[0];
    if (!next || next === source) return;
    const nextSource = sources.find((item) => item.value === next);
    setSource(next);
    setStatus(nextSource?.src ? "loading" : "idle");
  }

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-5">
      <ToggleGroup
        variant="outline"
        size="sm"
        spacing={0}
        value={[source]}
        onValueChange={handleSourceChange}
        aria-label="Image source"
      >
        {sources.map((item) => (
          <ToggleGroupItem key={item.value} value={item.value}>
            {item.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <Avatar
        key={source}
        className={`size-20 ${status === "loading" ? "animate-pulse bg-muted" : ""}`}
      >
        {current.src ? (
          <AvatarImage
            src={current.src}
            alt="Priya Raman"
            onLoadingStatusChange={setStatus}
            className="transition-opacity duration-300 data-[starting-style]:opacity-0"
          />
        ) : null}
        <AvatarFallback delay={current.src ? 600 : 0} className="text-xl">
          PR
        </AvatarFallback>
      </Avatar>
      <div
        className="flex flex-col items-center gap-2 text-center"
        aria-live="polite"
      >
        <Badge variant={statusVariant[status]}>{statusLabel[status]}</Badge>
        <p className="text-sm text-balance text-muted-foreground">
          {messages[status]}
        </p>
      </div>
    </div>
  );
}
