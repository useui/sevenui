"use client";

import * as React from "react";
import { ReceiptTextIcon, SendIcon } from "lucide-react";

import { Avatar, AvatarFallback } from "@/registry/base/ui/avatar";
import { Button } from "@/registry/base/ui/button";
import { Checkbox } from "@/registry/base/ui/checkbox";
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
import { Separator } from "@/registry/base/ui/separator";
import { Slider } from "@/registry/base/ui/slider";

const subtotal = 164.8;

const friends = [
  { id: "you", name: "You", initials: "ME" },
  { id: "amara", name: "Amara Nwosu", initials: "AN" },
  { id: "jonas", name: "Jonas Weber", initials: "JW" },
  { id: "lucia", name: "Lucía Romero", initials: "LR" },
  { id: "kenji", name: "Kenji Sato", initials: "KS" },
];

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default function Drawer13() {
  const [open, setOpen] = React.useState(false);
  const [included, setIncluded] = React.useState<string[]>(
    friends.map((friend) => friend.id),
  );
  const [tipPercent, setTipPercent] = React.useState(18);
  const [sent, setSent] = React.useState<{
    count: number;
    share: number;
  } | null>(null);

  const tip = subtotal * (tipPercent / 100);
  const total = subtotal + tip;
  const share = included.length > 0 ? total / included.length : 0;
  const others = included.filter((id) => id !== "you").length;

  function toggle(id: string, checked: boolean) {
    setIncluded((current) =>
      checked ? [...current, id] : current.filter((item) => item !== id),
    );
  }

  return (
    <div className="flex w-full max-w-xs flex-col gap-4 rounded-xl border bg-card p-4 text-card-foreground">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
          <ReceiptTextIcon aria-hidden="true" className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-medium">Osteria Lume</p>
          <p className="text-sm text-muted-foreground">Fri, Sep 25 · Table 12</p>
        </div>
        <span className="font-medium tabular-nums">
          {money.format(subtotal)}
        </span>
      </div>
      {sent !== null ? (
        <p role="status" className="rounded-lg bg-muted px-3 py-2 text-sm">
          Requested {money.format(sent.share)} each from {sent.count}{" "}
          {sent.count === 1 ? "friend" : "friends"}. Payments land in your
          balance.
        </p>
      ) : null}
      <Drawer open={open} onOpenChange={setOpen} showSwipeHandle>
        <DrawerTrigger
          render={
            <Button variant={sent === null ? "default" : "outline"}>
              {sent === null ? "Split the bill" : "Edit split"}
            </Button>
          }
        />
        <DrawerContent>
          <div className="mx-auto flex min-h-0 w-full max-w-sm flex-col">
            <DrawerHeader>
              <DrawerTitle>Split the bill</DrawerTitle>
              <DrawerDescription>
                Everyone pays the same share, tip included.
              </DrawerDescription>
            </DrawerHeader>
            <div className="flex min-h-0 flex-col gap-5 overflow-y-auto p-4">
              <fieldset className="grid gap-1">
                <legend className="mb-2 text-sm font-medium">Who’s in</legend>
                {friends.map((friend) => {
                  const id = `drawer-13-${friend.id}`;
                  const checked = included.includes(friend.id);
                  return (
                    <label
                      key={friend.id}
                      htmlFor={id}
                      className="-mx-2 flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted/50"
                    >
                      <Avatar size="sm">
                        <AvatarFallback className="text-[0.625rem]">
                          {friend.initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="min-w-0 flex-1 truncate text-sm">
                        {friend.name}
                      </span>
                      <span className="text-sm text-muted-foreground tabular-nums">
                        {checked ? money.format(share) : "—"}
                      </span>
                      <Checkbox
                        id={id}
                        checked={checked}
                        onCheckedChange={(value) => toggle(friend.id, value)}
                      />
                    </label>
                  );
                })}
              </fieldset>
              <Separator />
              <div className="grid gap-3">
                <div className="flex items-center justify-between gap-3">
                  <span id="drawer-13-tip" className="text-sm font-medium">
                    Tip
                  </span>
                  <span className="text-sm text-muted-foreground tabular-nums">
                    {tipPercent}% · {money.format(tip)}
                  </span>
                </div>
                <Slider
                  aria-labelledby="drawer-13-tip"
                  min={0}
                  max={30}
                  step={1}
                  value={tipPercent}
                  onValueChange={(value) =>
                    setTipPercent(Array.isArray(value) ? value[0] : value)
                  }
                />
              </div>
              <dl className="grid gap-1.5 rounded-lg bg-muted/50 p-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd className="tabular-nums">{money.format(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Tip</dt>
                  <dd className="tabular-nums">{money.format(tip)}</dd>
                </div>
                <div className="flex justify-between font-medium">
                  <dt>Total</dt>
                  <dd className="tabular-nums">{money.format(total)}</dd>
                </div>
              </dl>
            </div>
            <DrawerFooter>
              <Button
                size="lg"
                disabled={others === 0}
                onClick={() => {
                  setSent({ count: others, share });
                  setOpen(false);
                }}
              >
                <SendIcon aria-hidden="true" data-icon="inline-start" />
                {others === 0
                  ? "Add at least one friend"
                  : `Request ${money.format(share)} from ${others}`}
              </Button>
              <DrawerClose
                render={
                  <Button variant="ghost" size="lg">
                    Cancel
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
