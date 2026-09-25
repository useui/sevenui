"use client";

import * as React from "react";
import { Headphones, Pause, Play } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/registry/base/ui/card";

export default function Card09() {
  const [playing, setPlaying] = React.useState(false);

  return (
    <div className="@container w-full max-w-xl">
      {/* Stacks vertically in narrow containers, switches to a side-by-side layout from 28rem. */}
      <Card className="gap-0 py-0 @md:flex-row">
        <div className="relative aspect-video shrink-0 bg-muted @md:aspect-auto @md:w-44">
          <img
            src="/placeholder.svg"
            alt="Podcast cover art for Shipping Weekly"
            className="absolute inset-0 size-full object-cover"
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-3 py-4">
          <CardHeader>
            <CardTitle className="text-balance">
              Feature flags without the flag debt
            </CardTitle>
            <CardDescription className="flex items-center gap-1.5 text-xs">
              <Headphones aria-hidden="true" className="size-3.5" />
              Shipping Weekly · Episode 42 · 38 min
            </CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground text-pretty">
            Two platform engineers on expiring flags, ownership labels, and the
            cleanup ritual that keeps their codebase honest.
          </CardContent>
          <CardFooter className="mt-auto border-t-0 bg-transparent py-0">
            <Button
              size="sm"
              variant={playing ? "secondary" : "default"}
              onClick={() => setPlaying((value) => !value)}
            >
              {playing ? (
                <Pause aria-hidden="true" data-icon="inline-start" />
              ) : (
                <Play aria-hidden="true" data-icon="inline-start" />
              )}
              {playing ? "Pause episode" : "Play episode"}
            </Button>
          </CardFooter>
        </div>
      </Card>
    </div>
  );
}
