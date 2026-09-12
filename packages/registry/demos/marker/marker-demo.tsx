"use client";

import { CheckCheckIcon, UserPlusIcon } from "lucide-react";

import {
  Marker,
  MarkerContent,
  MarkerIcon,
} from "@/registry/base/ui/marker";

export default function MarkerDemo() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <Marker>
        <MarkerIcon>
          <UserPlusIcon />
        </MarkerIcon>
        <MarkerContent>Alex joined the conversation</MarkerContent>
      </Marker>
      <Marker role="status">
        <MarkerIcon>
          <CheckCheckIcon />
        </MarkerIcon>
        <MarkerContent>
          All messages read · <a href="#history">View history</a>
        </MarkerContent>
      </Marker>
    </div>
  );
}
