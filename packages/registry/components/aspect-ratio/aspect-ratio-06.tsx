"use client";

import { cn } from "cn";
import { Mic, MicOff, PhoneOff, Pin, Video, VideoOff } from "lucide-react";
import * as React from "react";

import { AspectRatio } from "@/registry/base/ui/aspect-ratio";
import { Avatar, AvatarFallback } from "@/registry/base/ui/avatar";
import { Button } from "@/registry/base/ui/button";
import { Toggle } from "@/registry/base/ui/toggle";

const participants = [
  { id: "maya", name: "Maya Chen", initials: "MC", camera: true, muted: false },
  { id: "jonas", name: "Jonas Weber", initials: "JW", camera: false, muted: true },
  { id: "amara", name: "Amara Osei", initials: "AO", camera: true, muted: true },
];

// The participant currently talking gets the speaking ring.
const SPEAKER_ID = "maya";

export default function AspectRatio06() {
  const [pinnedId, setPinnedId] = React.useState<string | null>(null);
  const [micOn, setMicOn] = React.useState(true);
  const [cameraOn, setCameraOn] = React.useState(true);
  const [left, setLeft] = React.useState(false);
  const leaveRef = React.useRef<HTMLButtonElement>(null);
  const rejoinRef = React.useRef<HTMLButtonElement>(null);
  const moveFocus = React.useRef(false);

  // Leaving or rejoining swaps the controls, so hand focus to the new button.
  React.useEffect(() => {
    if (!moveFocus.current) return;
    moveFocus.current = false;
    (left ? rejoinRef : leaveRef).current?.focus();
  }, [left]);

  const tiles = [
    ...participants,
    {
      id: "you",
      name: "You",
      initials: "SL",
      camera: cameraOn,
      muted: !micOn,
    },
  ];
  // The pinned tile moves to the front and spans the full row.
  const ordered = pinnedId
    ? [
        ...tiles.filter((tile) => tile.id === pinnedId),
        ...tiles.filter((tile) => tile.id !== pinnedId),
      ]
    : tiles;

  return (
    <section
      aria-labelledby="aspect-ratio-06-title"
      className="w-full max-w-lg rounded-xl border bg-card text-card-foreground"
    >
      <div className="px-4 pt-4 pb-3">
        <h3 id="aspect-ratio-06-title" className="truncate font-medium">
          Q3 roadmap review
        </h3>
        <p className="text-xs text-muted-foreground tabular-nums">
          {left
            ? `You left · ${participants.length} still in call`
            : `${tiles.length} in call · 24:08`}
        </p>
      </div>
      {left ? (
        <div className="flex flex-col items-center gap-3 px-4 pt-2 pb-6 text-center">
          <p className="text-sm text-muted-foreground" aria-live="polite">
            You left the call.
          </p>
          <Button
            ref={rejoinRef}
            size="sm"
            onClick={() => {
              moveFocus.current = true;
              setLeft(false);
            }}
          >
            Rejoin
          </Button>
        </div>
      ) : (
        <>
          <ul aria-label="Participants" className="grid grid-cols-2 gap-2 px-4">
            {ordered.map((tile) => {
              const pinned = tile.id === pinnedId;
              const speaking = tile.id === SPEAKER_ID && !tile.muted;
              return (
                <li key={tile.id} className={pinned ? "col-span-2" : undefined}>
                  <AspectRatio
                    ratio={16 / 9}
                    className={cn(
                      "group overflow-hidden rounded-lg bg-muted ring-1 ring-foreground/10 transition-shadow",
                      speaking && "ring-2 ring-primary",
                    )}
                  >
                    {tile.camera ? (
                      <img
                        src="/placeholder.svg"
                        alt=""
                        className="absolute inset-0 size-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Avatar size={pinned ? "lg" : "default"}>
                          <AvatarFallback className="bg-background text-foreground">
                            {tile.initials}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    )}
                    <span className="absolute bottom-1.5 left-1.5 flex max-w-[calc(100%-0.75rem)] items-center gap-1 rounded-md bg-background/90 px-1.5 py-0.5 text-xs font-medium text-foreground">
                      {tile.muted ? (
                        <MicOff
                          aria-hidden="true"
                          className="size-3 shrink-0 text-destructive"
                        />
                      ) : null}
                      <span className="truncate">{tile.name}</span>
                      <span className="sr-only">
                        {tile.muted ? ", muted" : ""}
                        {tile.camera ? "" : ", camera off"}
                        {speaking ? ", speaking" : ""}
                      </span>
                    </span>
                    <Button
                      variant="outline"
                      size="icon-xs"
                      aria-label={
                        pinned ? `Unpin ${tile.name}` : `Pin ${tile.name}`
                      }
                      aria-pressed={pinned}
                      onClick={() => setPinnedId(pinned ? null : tile.id)}
                      className="absolute top-1.5 right-1.5 bg-background/90 dark:bg-background/90 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 aria-pressed:opacity-100 pointer-coarse:opacity-100"
                    >
                      <Pin aria-hidden="true" />
                    </Button>
                  </AspectRatio>
                </li>
              );
            })}
          </ul>
          <div className="flex items-center justify-center gap-2 p-4">
            <Toggle
              variant="outline"
              aria-label="Microphone"
              pressed={micOn}
              onPressedChange={setMicOn}
            >
              {micOn ? <Mic aria-hidden="true" /> : <MicOff aria-hidden="true" />}
            </Toggle>
            <Toggle
              variant="outline"
              aria-label="Camera"
              pressed={cameraOn}
              onPressedChange={setCameraOn}
            >
              {cameraOn ? (
                <Video aria-hidden="true" />
              ) : (
                <VideoOff aria-hidden="true" />
              )}
            </Toggle>
            <Button
              ref={leaveRef}
              variant="destructive"
              size="sm"
              onClick={() => {
                moveFocus.current = true;
                setLeft(true);
                setPinnedId(null);
              }}
            >
              <PhoneOff aria-hidden="true" data-icon="inline-start" />
              Leave
            </Button>
          </div>
        </>
      )}
    </section>
  );
}
