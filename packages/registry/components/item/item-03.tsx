"use client";

import * as React from "react";
import { AudioLinesIcon } from "lucide-react";

import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/registry/base/ui/item";

const tracks = [
  { title: "Harbor Lights", artist: "The Low Tides", duration: "3:42" },
  { title: "Paper Satellites", artist: "Mara Quinn", duration: "4:05" },
  { title: "Northbound", artist: "Glass Arcade", duration: "2:58" },
  { title: "Slow Weather", artist: "June Alder", duration: "5:11" },
];

export default function Item03() {
  const [playing, setPlaying] = React.useState(tracks[1].title);

  return (
    <ul aria-label="Up next" className="flex w-full max-w-sm flex-col gap-1">
      {tracks.map((track) => {
        const isPlaying = track.title === playing;
        return (
          <li key={track.title}>
            <Item
              size="sm"
              variant={isPlaying ? "muted" : "default"}
              render={
                <button
                  type="button"
                  aria-pressed={isPlaying}
                  aria-label={`Play ${track.title} by ${track.artist}`}
                  onClick={() => setPlaying(track.title)}
                />
              }
              className="cursor-pointer text-left hover:bg-muted/60"
            >
              <ItemMedia variant="image">
                <img src="/placeholder.svg" alt="" />
              </ItemMedia>
              <ItemContent className="min-w-0 gap-0.5">
                <ItemTitle>{track.title}</ItemTitle>
                <ItemDescription className="line-clamp-1 text-xs">
                  {track.artist}
                </ItemDescription>
              </ItemContent>
              <ItemActions className="text-xs text-muted-foreground tabular-nums">
                {isPlaying ? (
                  <AudioLinesIcon
                    aria-hidden="true"
                    className="size-4 animate-pulse text-primary motion-reduce:animate-none"
                  />
                ) : null}
                <span>{track.duration}</span>
              </ItemActions>
            </Item>
          </li>
        );
      })}
    </ul>
  );
}
