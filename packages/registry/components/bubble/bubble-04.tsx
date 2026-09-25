"use client";

import * as React from "react";
import { PauseIcon, PlayIcon } from "lucide-react";
import { cn } from "cn";

import { Avatar, AvatarFallback } from "@/registry/base/ui/avatar";
import { Bubble, BubbleContent } from "@/registry/base/ui/bubble";
import { Button } from "@/registry/base/ui/button";
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageHeader,
} from "@/registry/base/ui/message";

const duration = 24;

const waveform = [
  0.3, 0.5, 0.8, 0.6, 0.9, 0.4, 0.7, 1, 0.6, 0.3, 0.5, 0.8, 0.9, 0.7, 0.4, 0.6,
  0.8, 0.5, 0.3, 0.6, 0.9, 1, 0.7, 0.5, 0.4, 0.7, 0.8, 0.6, 0.4, 0.3, 0.5, 0.3,
];

const speeds = [1, 1.5, 2];

const transcript =
  "Quick update from the Northwind call. They signed off on the redesign, but want the mobile checkout in the first release. I told them we'd send a revised timeline by Wednesday.";

function formatTime(seconds: number) {
  const whole = Math.floor(seconds);
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
}

export default function Bubble04() {
  const [playing, setPlaying] = React.useState(false);
  const [elapsed, setElapsed] = React.useState(0);
  const [speed, setSpeed] = React.useState(1);
  const [showTranscript, setShowTranscript] = React.useState(false);

  React.useEffect(() => {
    if (!playing) return;
    const interval = window.setInterval(() => {
      setElapsed((current) => Math.min(current + 0.1 * speed, duration));
    }, 100);
    return () => window.clearInterval(interval);
  }, [playing, speed]);

  React.useEffect(() => {
    if (elapsed >= duration) setPlaying(false);
  }, [elapsed]);

  function togglePlay() {
    if (!playing && elapsed >= duration) setElapsed(0);
    setPlaying((current) => !current);
  }

  const progress = elapsed / duration;
  const started = playing || elapsed > 0;

  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <Bubble align="end">
        <BubbleContent>
          Can you give me the short version of the call?
        </BubbleContent>
      </Bubble>
      <Message>
        <MessageAvatar>
          <Avatar>
            <AvatarFallback>RA</AvatarFallback>
          </Avatar>
        </MessageAvatar>
        <MessageContent className="gap-1">
          <MessageHeader>Rosa Alvarez</MessageHeader>
          <Bubble variant="muted" className="w-72 max-w-full">
            <BubbleContent className="flex w-full items-center gap-2.5 py-2 pl-2">
              <Button
                size="icon"
                className="shrink-0 rounded-full"
                aria-label={
                  playing ? "Pause voice message" : "Play voice message"
                }
                onClick={togglePlay}
              >
                {playing ? (
                  <PauseIcon aria-hidden="true" />
                ) : (
                  <PlayIcon aria-hidden="true" />
                )}
              </Button>
              <div className="relative flex h-8 min-w-0 flex-1 items-center gap-0.5 rounded-md has-focus-visible:ring-2 has-focus-visible:ring-ring">
                {waveform.map((height, index) => (
                  <span
                    // biome-ignore lint/suspicious/noArrayIndexKey: static waveform
                    key={index}
                    aria-hidden="true"
                    style={{ height: `${height * 100}%` }}
                    className={cn(
                      "min-w-0 flex-1 rounded-full transition-colors",
                      index / waveform.length < progress
                        ? "bg-foreground"
                        : "bg-muted-foreground/40",
                    )}
                  />
                ))}
                <input
                  type="range"
                  min={0}
                  max={duration}
                  step={1}
                  value={Math.round(elapsed)}
                  onChange={(event) => setElapsed(Number(event.target.value))}
                  aria-label="Seek"
                  aria-valuetext={`${formatTime(elapsed)} of ${formatTime(duration)}`}
                  className="absolute inset-0 size-full cursor-pointer opacity-0"
                />
              </div>
              <span className="w-8 shrink-0 text-right text-xs text-muted-foreground tabular-nums">
                {formatTime(started ? elapsed : duration)}
              </span>
            </BubbleContent>
            {showTranscript ? (
              <BubbleContent
                id="bubble-04-transcript"
                className="text-muted-foreground"
              >
                {transcript}
              </BubbleContent>
            ) : null}
          </Bubble>
          <MessageFooter className="gap-1 px-1">
            <Button
              variant="ghost"
              size="xs"
              className="tabular-nums"
              aria-label={`Playback speed ${speed}x`}
              onClick={() =>
                setSpeed(
                  (current) =>
                    speeds[(speeds.indexOf(current) + 1) % speeds.length],
                )
              }
            >
              {speed}x
            </Button>
            <Button
              variant="ghost"
              size="xs"
              aria-expanded={showTranscript}
              aria-controls="bubble-04-transcript"
              onClick={() => setShowTranscript((current) => !current)}
            >
              {showTranscript ? "Hide transcript" : "Show transcript"}
            </Button>
          </MessageFooter>
        </MessageContent>
      </Message>
    </div>
  );
}
