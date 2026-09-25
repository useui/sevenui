"use client";

import {
  Disc3,
  Heart,
  ListEnd,
  ListMusic,
  ListPlus,
  ListStart,
  MicVocal,
  Play,
  Plus,
  RotateCcw,
  Trash2,
} from "lucide-react";
import * as React from "react";

import { cn } from "cn";

import { Button } from "@/registry/base/ui/button";
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/registry/base/ui/context-menu";

// macOS browsers never turn Shift+F10 into a contextmenu event (Windows and
// Linux do), so the shortcut the hint advertises is forwarded by hand there.
function openMenuWithShiftF10(event: React.KeyboardEvent<HTMLElement>) {
  if (event.key !== "F10" || !event.shiftKey) return;
  if (!/Mac|iPhone|iPad/.test(navigator.userAgent)) return;
  event.preventDefault();
  const rect = event.currentTarget.getBoundingClientRect();
  event.currentTarget.dispatchEvent(
    new MouseEvent("contextmenu", {
      bubbles: true,
      cancelable: true,
      clientX: rect.left + 8,
      clientY: rect.top + 8,
    }),
  );
}

type Track = {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  liked: boolean;
  playlists: string[];
};

const playlists = ["Deep work", "Sunday drive", "Run club 5K"];

const initialTracks: Track[] = [
  {
    id: "t1",
    title: "Glass Harbor",
    artist: "Lune Avenue",
    album: "Low Tide Lights",
    duration: "3:42",
    liked: true,
    playlists: ["Deep work"],
  },
  {
    id: "t2",
    title: "Paper Satellites",
    artist: "The Quiet Arcade",
    album: "Orbit Songs",
    duration: "4:05",
    liked: false,
    playlists: [],
  },
  {
    id: "t3",
    title: "Northbound",
    artist: "Mara Solis",
    album: "Northbound",
    duration: "2:58",
    liked: false,
    playlists: ["Sunday drive"],
  },
];

export default function ContextMenu05() {
  const [tracks, setTracks] = React.useState(initialTracks);
  const [playingId, setPlayingId] = React.useState("t1");
  const [queue, setQueue] = React.useState<string[]>([]);
  const [status, setStatus] = React.useState("");

  function patch(id: string, next: Partial<Track>) {
    setTracks((current) =>
      current.map((track) => (track.id === id ? { ...track, ...next } : track)),
    );
  }

  function enqueue(track: Track, position: "next" | "last") {
    setQueue((current) => {
      const rest = current.filter((id) => id !== track.id);
      return position === "next" ? [track.id, ...rest] : [...rest, track.id];
    });
    setStatus(
      position === "next"
        ? `${track.title} plays next.`
        : `${track.title} added to the end of the queue.`,
    );
  }

  return (
    <section
      aria-labelledby="context-menu-05-title"
      className="w-full max-w-md rounded-xl border bg-card text-card-foreground"
    >
      <header className="flex items-center gap-3 border-b p-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-md bg-muted">
          <ListMusic
            aria-hidden="true"
            className="size-5 text-muted-foreground"
          />
        </div>
        <div className="min-w-0">
          <h3
            id="context-menu-05-title"
            className="truncate text-sm font-semibold"
          >
            Late night coding
          </h3>
          <p className="text-xs text-muted-foreground tabular-nums">
            {tracks.length} songs · {queue.length} queued
          </p>
        </div>
      </header>
      {tracks.length === 0 ? (
        <div className="flex flex-col items-center gap-3 px-4 py-10 text-center">
          <p className="text-sm text-muted-foreground">
            This playlist is empty. Add songs from search or your library.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setTracks(initialTracks);
              setPlayingId("t1");
              setStatus("Playlist restored.");
            }}
          >
            <RotateCcw aria-hidden="true" />
            Restore songs
          </Button>
        </div>
      ) : (
        <ol className="p-1.5">
          {tracks.map((track, index) => {
            const playing = track.id === playingId;
            return (
              <li key={track.id}>
                <ContextMenu>
                  <ContextMenuTrigger
                    onKeyDown={openMenuWithShiftF10}
                    tabIndex={0}
                    aria-label={`${track.title} by ${track.artist}, ${track.duration}${playing ? ", now playing" : ""}${track.liked ? ", liked" : ""}`}
                    className="flex items-center gap-3 rounded-md px-2.5 py-2 outline-none transition-colors hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50 data-popup-open:bg-muted"
                  >
                    <span className="w-4 shrink-0 text-center text-xs text-muted-foreground tabular-nums">
                      {playing ? (
                        <Play
                          aria-hidden="true"
                          className="size-3.5 fill-current text-primary"
                        />
                      ) : (
                        index + 1
                      )}
                    </span>
                    <img
                      src="/placeholder.svg"
                      alt=""
                      className="size-9 shrink-0 rounded-sm bg-muted object-cover"
                    />
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span
                        className={cn(
                          "truncate text-sm font-medium",
                          playing && "text-primary",
                        )}
                      >
                        {track.title}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {track.artist}
                      </span>
                    </span>
                    {track.liked ? (
                      <Heart
                        aria-hidden="true"
                        className="size-3.5 shrink-0 fill-current text-primary"
                      />
                    ) : null}
                    <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                      {track.duration}
                    </span>
                  </ContextMenuTrigger>
                  <ContextMenuContent className="w-60">
                    <div className="flex items-center gap-2.5 px-1.5 py-1.5">
                      <img
                        src="/placeholder.svg"
                        alt=""
                        className="size-10 shrink-0 rounded-sm bg-muted object-cover"
                      />
                      <span className="flex min-w-0 flex-col">
                        <span className="truncate text-sm font-medium">
                          {track.title}
                        </span>
                        <span className="truncate text-xs text-muted-foreground">
                          {track.artist} · {track.album}
                        </span>
                      </span>
                    </div>
                    <ContextMenuSeparator />
                    <ContextMenuItem
                      disabled={playing}
                      onClick={() => {
                        setPlayingId(track.id);
                        setStatus(`Now playing ${track.title}.`);
                      }}
                    >
                      <Play aria-hidden="true" />
                      {playing ? "Now playing" : "Play"}
                    </ContextMenuItem>
                    <ContextMenuItem
                      disabled={playing}
                      onClick={() => enqueue(track, "next")}
                    >
                      <ListStart aria-hidden="true" />
                      Play next
                    </ContextMenuItem>
                    <ContextMenuItem
                      disabled={playing}
                      onClick={() => enqueue(track, "last")}
                    >
                      <ListEnd aria-hidden="true" />
                      Add to queue
                    </ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuCheckboxItem
                      checked={track.liked}
                      onCheckedChange={(checked) => {
                        patch(track.id, { liked: checked });
                        setStatus(
                          checked
                            ? `${track.title} saved to Liked songs.`
                            : `${track.title} removed from Liked songs.`,
                        );
                      }}
                    >
                      <Heart aria-hidden="true" />
                      Save to Liked songs
                    </ContextMenuCheckboxItem>
                    <ContextMenuSub>
                      <ContextMenuSubTrigger>
                        <ListPlus aria-hidden="true" />
                        Add to playlist
                      </ContextMenuSubTrigger>
                      <ContextMenuSubContent className="w-48">
                        <ContextMenuItem
                          onClick={() =>
                            setStatus(
                              `New playlist started with ${track.title}.`,
                            )
                          }
                        >
                          <Plus aria-hidden="true" />
                          New playlist
                        </ContextMenuItem>
                        <ContextMenuSeparator />
                        <ContextMenuGroup>
                          <ContextMenuLabel>Your playlists</ContextMenuLabel>
                          {playlists.map((playlist) => (
                            <ContextMenuCheckboxItem
                              key={playlist}
                              closeOnClick={false}
                              checked={track.playlists.includes(playlist)}
                              onCheckedChange={(checked) =>
                                patch(track.id, {
                                  playlists: checked
                                    ? [...track.playlists, playlist]
                                    : track.playlists.filter(
                                        (name) => name !== playlist,
                                      ),
                                })
                              }
                            >
                              {playlist}
                            </ContextMenuCheckboxItem>
                          ))}
                        </ContextMenuGroup>
                      </ContextMenuSubContent>
                    </ContextMenuSub>
                    <ContextMenuSeparator />
                    <ContextMenuItem
                      onClick={() => setStatus(`Opened ${track.artist}.`)}
                    >
                      <MicVocal aria-hidden="true" />
                      Go to artist
                    </ContextMenuItem>
                    <ContextMenuItem
                      onClick={() => setStatus(`Opened ${track.album}.`)}
                    >
                      <Disc3 aria-hidden="true" />
                      Go to album
                    </ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuItem
                      variant="destructive"
                      onClick={() => {
                        setTracks((current) =>
                          current.filter((item) => item.id !== track.id),
                        );
                        setQueue((current) =>
                          current.filter((id) => id !== track.id),
                        );
                        setStatus(`${track.title} removed from this playlist.`);
                      }}
                    >
                      <Trash2 aria-hidden="true" />
                      Remove from this playlist
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              </li>
            );
          })}
        </ol>
      )}
      <p
        aria-live="polite"
        className="min-h-10 border-t px-4 py-2.5 text-xs text-muted-foreground"
      >
        {status || "Right-click a song, or focus it and press Shift+F10."}
      </p>
    </section>
  );
}
