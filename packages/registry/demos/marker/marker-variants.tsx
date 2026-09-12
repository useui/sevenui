"use client";

import { Marker, MarkerContent } from "@/registry/base/ui/marker";

export default function MarkerVariants() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-5">
      <Marker>
        <MarkerContent>Default — inline status note</MarkerContent>
      </Marker>
      <Marker variant="separator">
        <MarkerContent>Today</MarkerContent>
      </Marker>
      <Marker variant="border">
        <MarkerContent>Unread messages below</MarkerContent>
      </Marker>
    </div>
  );
}
