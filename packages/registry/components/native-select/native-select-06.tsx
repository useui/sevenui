"use client";

import { XIcon } from "lucide-react";
import * as React from "react";

import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import { Label } from "@/registry/base/ui/label";
import {
  NativeSelect,
  NativeSelectOptGroup,
  NativeSelectOption,
} from "@/registry/base/ui/native-select";

const channelGroups = [
  {
    label: "Engineering",
    channels: ["#deploys", "#incidents", "#code-review"],
  },
  {
    label: "Company",
    channels: ["#announcements", "#design-crit", "#random"],
  },
];

export default function NativeSelect06() {
  const [channels, setChannels] = React.useState<string[]>([
    "#deploys",
    "#incidents",
  ]);

  function remove(channel: string) {
    setChannels((current) => current.filter((item) => item !== channel));
  }

  return (
    <div className="flex w-full max-w-xs flex-col gap-2">
      <div className="flex items-baseline justify-between gap-2">
        <Label htmlFor="native-select-06-channels">Alert channels</Label>
        <span className="text-xs text-muted-foreground tabular-nums">
          {channels.length} selected
        </span>
      </div>
      <NativeSelect
        id="native-select-06-channels"
        multiple
        value={channels}
        aria-describedby="native-select-06-hint"
        onChange={(event) =>
          setChannels(
            Array.from(event.target.selectedOptions, (option) => option.value),
          )
        }
        className="w-full [&>select]:h-52 [&>select]:overflow-y-auto [&>select]:p-1 [&>svg]:hidden [&_option]:rounded-md [&_option]:px-2 [&_option]:py-1 [&_option:checked]:bg-accent [&_option:checked]:text-accent-foreground"
      >
        {channelGroups.map((group) => (
          <NativeSelectOptGroup key={group.label} label={group.label}>
            {group.channels.map((channel) => (
              <NativeSelectOption key={channel} value={channel}>
                {channel}
              </NativeSelectOption>
            ))}
          </NativeSelectOptGroup>
        ))}
      </NativeSelect>
      <p id="native-select-06-hint" className="text-xs text-muted-foreground">
        Hold Ctrl or Cmd to pick more than one.
      </p>
      <div className="flex min-h-7 flex-wrap items-center gap-1.5">
        {channels.map((channel) => (
          <Badge key={channel} variant="secondary" className="gap-1 pr-1">
            {channel}
            <button
              type="button"
              onClick={() => remove(channel)}
              aria-label={`Remove ${channel}`}
              className="rounded-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            >
              <XIcon aria-hidden="true" className="size-3" />
            </button>
          </Badge>
        ))}
        {channels.length > 0 ? (
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={() => setChannels([])}
          >
            Clear all
          </Button>
        ) : (
          <span className="text-xs text-muted-foreground">
            No channels will be notified.
          </span>
        )}
      </div>
    </div>
  );
}
