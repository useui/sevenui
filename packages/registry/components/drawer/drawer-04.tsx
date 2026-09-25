"use client";

import * as React from "react";
import { Car, Check, MapPin, Navigation, Share2 } from "lucide-react";

import { Avatar, AvatarFallback } from "@/registry/base/ui/avatar";
import { Button } from "@/registry/base/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/registry/base/ui/drawer";
import { Separator } from "@/registry/base/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/registry/base/ui/toggle-group";

const snaps = [
  { value: "180px", label: "Peek" },
  { value: "0.55", label: "Half" },
  { value: "1", label: "Full" },
];

// Snap points are numbers (fraction of the viewport) or CSS lengths.
const snapPoints: (number | string)[] = ["180px", 0.55, 1];

const toKey = (point: number | string | null) =>
  point == null ? "" : String(point);

const fromKey = (key: string) =>
  key.endsWith("px") ? key : Number.parseFloat(key);

const stops = [
  { time: "8:42", place: "Pickup · 214 Harbor Street", icon: Navigation },
  { time: "8:51", place: "Stop · Central Library", icon: MapPin },
  { time: "9:04", place: "Drop-off · Terminal 2, Gate B", icon: MapPin },
];

const fare = [
  { label: "Base fare", amount: "$14.20" },
  { label: "Airport fee", amount: "$4.50" },
  { label: "Service fee", amount: "$2.15" },
];

export default function Drawer04() {
  const [snapPoint, setSnapPoint] = React.useState<number | string | null>(
    snapPoints[0],
  );
  const [shared, setShared] = React.useState(false);

  React.useEffect(() => {
    if (!shared) return;
    const timeout = window.setTimeout(() => setShared(false), 2000);
    return () => window.clearTimeout(timeout);
  }, [shared]);

  async function shareStatus() {
    try {
      await navigator.clipboard?.writeText("https://ride.example.com/t/7KXR219");
    } catch {
      // Clipboard can be blocked in sandboxed previews; still confirm intent.
    }
    setShared(true);
  }

  return (
    <Drawer
      snapPoints={snapPoints}
      snapPoint={snapPoint}
      onSnapPointChange={setSnapPoint}
      showSwipeHandle
      onOpenChange={(open) => {
        if (open) setSnapPoint(snapPoints[0]);
      }}
    >
      <DrawerTrigger render={<Button variant="outline">Track ride</Button>} />
      <DrawerContent>
        <div className="mx-auto flex min-h-0 w-full max-w-sm flex-1 flex-col">
          <DrawerHeader className="gap-3 pb-3 text-left">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>DK</AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-1 flex-col text-left">
                <DrawerTitle>Daniel arrives in 4 min</DrawerTitle>
                <DrawerDescription className="flex items-center gap-1.5">
                  <Car aria-hidden="true" className="size-3.5" />
                  Grey Toyota Prius · 7KXR 219
                </DrawerDescription>
              </div>
            </div>
            <ToggleGroup
              aria-label="Drawer height"
              variant="outline"
              size="sm"
              spacing={0}
              className="w-full *:flex-1"
              value={[toKey(snapPoint)]}
              onValueChange={(value) => {
                if (value[0]) setSnapPoint(fromKey(value[0]));
              }}
            >
              {snaps.map((snap) => (
                <ToggleGroupItem key={snap.value} value={snap.value}>
                  {snap.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </DrawerHeader>
          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4 pt-1">
            <section aria-labelledby="drawer-04-route">
              <h3
                id="drawer-04-route"
                className="mb-2 text-xs font-medium text-muted-foreground"
              >
                Route
              </h3>
              <ol className="flex flex-col gap-3">
                {stops.map((stop) => (
                  <li key={stop.place} className="flex items-center gap-3">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted">
                      <stop.icon aria-hidden="true" className="size-3.5" />
                    </span>
                    <span className="flex-1 text-sm">{stop.place}</span>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {stop.time}
                    </span>
                  </li>
                ))}
              </ol>
            </section>
            <Separator />
            <section aria-labelledby="drawer-04-fare">
              <h3
                id="drawer-04-fare"
                className="mb-2 text-xs font-medium text-muted-foreground"
              >
                Fare estimate
              </h3>
              <dl className="flex flex-col gap-1.5 text-sm">
                {fare.map((row) => (
                  <div key={row.label} className="flex justify-between">
                    <dt className="text-muted-foreground">{row.label}</dt>
                    <dd className="tabular-nums">{row.amount}</dd>
                  </div>
                ))}
                <div className="mt-1 flex justify-between border-t pt-2 font-medium">
                  <dt>Total</dt>
                  <dd className="tabular-nums">$20.85</dd>
                </div>
              </dl>
            </section>
            <Button
              variant="outline"
              className="mt-auto"
              aria-live="polite"
              onClick={shareStatus}
            >
              {shared ? (
                <Check aria-hidden="true" data-icon="inline-start" />
              ) : (
                <Share2 aria-hidden="true" data-icon="inline-start" />
              )}
              {shared ? "Trip link copied" : "Share trip status"}
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
