"use client";

import * as React from "react";
import { BikeIcon, StarIcon } from "lucide-react";
import { cn } from "cn";

import { Button } from "@/registry/base/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/registry/base/ui/drawer";
import { Label } from "@/registry/base/ui/label";
import { Textarea } from "@/registry/base/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/registry/base/ui/toggle-group";

const ratingLabels = ["Terrible", "Poor", "Okay", "Good", "Excellent"];

const praise = ["Friendly courier", "Arrived hot", "Careful packing", "Fast"];
const problems = ["Late", "Missing items", "Arrived cold", "Wrong address"];

const tips = [0, 2, 4, 6];

type Review = { rating: number; tip: number };

export default function Drawer11() {
  const [open, setOpen] = React.useState(false);
  const [rating, setRating] = React.useState(0);
  const [tags, setTags] = React.useState<string[]>([]);
  const [tip, setTip] = React.useState(4);
  const [note, setNote] = React.useState("");
  const [review, setReview] = React.useState<Review | null>(null);

  const positive = rating >= 4;
  const tagOptions = rating === 0 ? [] : positive ? praise : problems;

  function submit() {
    if (rating === 0) return;
    setReview({ rating, tip });
    setOpen(false);
  }

  return (
    <div className="flex w-full max-w-xs flex-col gap-4 rounded-xl border bg-card p-4 text-card-foreground">
      <div className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
          <BikeIcon aria-hidden="true" className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="font-medium">Delivered at 7:42 PM</p>
          <p className="text-sm text-muted-foreground">
            Pho Saigon · 3 items · $38.60
          </p>
        </div>
      </div>
      {review ? (
        <p role="status" className="rounded-lg bg-muted px-3 py-2 text-sm">
          Thanks for rating Luis {review.rating} of 5
          {review.tip > 0 ? ` and tipping $${review.tip}` : ""}.
        </p>
      ) : null}
      <Drawer open={open} onOpenChange={setOpen} showSwipeHandle>
        {review ? null : (
          <DrawerTrigger
            render={<Button className="w-full">Rate delivery</Button>}
          />
        )}
        <DrawerContent>
          <div className="mx-auto flex min-h-0 w-full max-w-sm flex-col">
            <DrawerHeader>
              <DrawerTitle>How was your delivery?</DrawerTitle>
              <DrawerDescription>
                Luis brought your order from Pho Saigon.
              </DrawerDescription>
            </DrawerHeader>
            <div className="flex min-h-0 flex-col gap-5 overflow-y-auto p-4">
              <div className="flex flex-col items-center gap-1.5">
                <ToggleGroup
                  aria-label="Rating"
                  spacing={1}
                  value={rating ? [String(rating)] : []}
                  onValueChange={(value) => {
                    const next = Number(value[0] ?? 0);
                    if (next >= 4 !== rating >= 4) setTags([]);
                    setRating(next);
                  }}
                >
                  {ratingLabels.map((label, index) => (
                    <ToggleGroupItem
                      key={label}
                      value={String(index + 1)}
                      aria-label={`${index + 1} of 5, ${label}`}
                      className="size-11 data-[state=on]:bg-transparent aria-pressed:bg-transparent"
                    >
                      <StarIcon
                        aria-hidden="true"
                        className={cn(
                          "size-7 transition-colors",
                          index < rating
                            ? "fill-primary text-primary"
                            : "text-muted-foreground",
                        )}
                      />
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
                <p
                  aria-live="polite"
                  className={cn(
                    "min-h-5 text-sm",
                    rating ? "font-medium" : "text-muted-foreground",
                  )}
                >
                  {rating ? ratingLabels[rating - 1] : "Tap a star to rate"}
                </p>
              </div>

              {tagOptions.length > 0 ? (
                <div className="grid gap-2">
                  <span
                    id="drawer-11-tags"
                    className="text-sm font-medium"
                  >
                    {positive ? "What went well?" : "What went wrong?"}
                  </span>
                  <ToggleGroup
                    aria-labelledby="drawer-11-tags"
                    multiple
                    variant="outline"
                    size="sm"
                    spacing={2}
                    className="flex-wrap"
                    value={tags}
                    onValueChange={(value) => setTags(value as string[])}
                  >
                    {tagOptions.map((tag) => (
                      <ToggleGroupItem
                        key={tag}
                        value={tag}
                        className="rounded-full"
                      >
                        {tag}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                </div>
              ) : null}

              <div className="grid gap-2">
                <span id="drawer-11-tip" className="text-sm font-medium">
                  Add a tip for Luis
                </span>
                <ToggleGroup
                  aria-labelledby="drawer-11-tip"
                  variant="outline"
                  spacing={2}
                  className="grid w-full grid-cols-4"
                  value={[String(tip)]}
                  onValueChange={(value) => {
                    if (value[0] !== undefined) setTip(Number(value[0]));
                  }}
                >
                  {tips.map((amount) => (
                    <ToggleGroupItem
                      key={amount}
                      value={String(amount)}
                      className="w-full tabular-nums"
                    >
                      {amount === 0 ? "None" : `$${amount}`}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="drawer-11-note">Note for the restaurant</Label>
                <Textarea
                  id="drawer-11-note"
                  placeholder="Optional. Only Pho Saigon sees this."
                  rows={2}
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                />
              </div>
            </div>
            <DrawerFooter className="pt-2">
              <Button size="lg" disabled={rating === 0} onClick={submit}>
                {rating === 0
                  ? "Choose a rating"
                  : tip > 0
                    ? `Submit and tip $${tip}`
                    : "Submit rating"}
              </Button>
              <DrawerClose
                render={
                  <Button variant="ghost" size="lg">
                    Not now
                  </Button>
                }
              />
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
