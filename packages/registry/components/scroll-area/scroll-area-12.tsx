"use client";

import * as React from "react";
import { Bell, CreditCard, ShieldCheck, TriangleAlert, User } from "lucide-react";
import { cn } from "cn";

import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import { Input } from "@/registry/base/ui/input";
import { Label } from "@/registry/base/ui/label";
import { ScrollArea } from "@/registry/base/ui/scroll-area";
import { Switch } from "@/registry/base/ui/switch";

const sections = [
  { id: "profile", label: "Profile", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: ShieldCheck },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "danger", label: "Danger zone", icon: TriangleAlert },
] as const;

type SectionId = (typeof sections)[number]["id"];

const emailSettings = [
  {
    id: "weekly",
    label: "Weekly digest",
    description: "A Monday summary of activity across your projects.",
    defaultChecked: true,
  },
  {
    id: "mentions",
    label: "Mentions and replies",
    description: "When someone mentions you or replies to your comment.",
    defaultChecked: true,
  },
  {
    id: "product",
    label: "Product updates",
    description: "New features and improvements, about once a month.",
    defaultChecked: false,
  },
];

const sessions = [
  { device: "MacBook Pro · Safari", place: "Lisbon, PT", current: true },
  { device: "iPhone 16 · Northwind app", place: "Lisbon, PT", current: false },
  { device: "Windows · Chrome", place: "Porto, PT", current: false },
];

export default function ScrollArea12() {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const sectionRefs = React.useRef<Partial<Record<SectionId, HTMLElement>>>(
    {},
  );
  // True while a nav jump is scrolling; the spy stays quiet until it settles.
  const jumpingRef = React.useRef(false);
  const settleTimer = React.useRef<number | undefined>(undefined);
  const [active, setActive] = React.useState<SectionId>("profile");
  const [signedOut, setSignedOut] = React.useState<string[]>([]);
  const [cardLinkSent, setCardLinkSent] = React.useState(false);
  const [deleteStep, setDeleteStep] = React.useState<
    "idle" | "confirm" | "scheduled"
  >("idle");

  function getViewport() {
    return rootRef.current?.querySelector<HTMLElement>(
      '[data-slot="scroll-area-viewport"]',
    );
  }

  function registerSection(id: SectionId) {
    return (el: HTMLElement | null) => {
      if (el) sectionRefs.current[id] = el;
      else delete sectionRefs.current[id];
    };
  }

  // Scroll-spy: the last section whose top has passed the viewport's top edge wins.
  function handleScroll(event: React.UIEvent<HTMLDivElement>) {
    const viewport = event.target as HTMLElement;
    if (viewport !== getViewport()) return;
    if (jumpingRef.current) {
      // Release once scroll events stop arriving.
      window.clearTimeout(settleTimer.current);
      settleTimer.current = window.setTimeout(() => {
        jumpingRef.current = false;
      }, 150);
      return;
    }
    const top = viewport.getBoundingClientRect().top;
    const atEnd =
      viewport.scrollTop + viewport.clientHeight >= viewport.scrollHeight - 4;
    let current: SectionId = sections[0].id;
    for (const section of sections) {
      const el = sectionRefs.current[section.id];
      if (el && el.getBoundingClientRect().top - top <= 48) {
        current = section.id;
      }
    }
    setActive(atEnd ? sections[sections.length - 1].id : current);
  }

  // Any manual scroll input hands control back to the spy.
  function releaseJump() {
    window.clearTimeout(settleTimer.current);
    jumpingRef.current = false;
  }

  React.useEffect(() => () => window.clearTimeout(settleTimer.current), []);

  function jumpTo(id: SectionId) {
    const viewport = getViewport();
    const el = sectionRefs.current[id];
    setActive(id);
    if (!viewport || !el) return;
    const offset =
      el.getBoundingClientRect().top -
      viewport.getBoundingClientRect().top +
      viewport.scrollTop;
    // Sections near the bottom cannot reach the top edge; aim for what is reachable.
    const target = Math.max(
      0,
      Math.min(offset - 8, viewport.scrollHeight - viewport.clientHeight),
    );
    window.clearTimeout(settleTimer.current);
    jumpingRef.current = Math.abs(viewport.scrollTop - target) > 1;
    const reduce = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    viewport.scrollTo?.({ top: target, behavior: reduce ? "auto" : "smooth" });
  }

  return (
    <div className="flex w-full max-w-2xl flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm sm:flex-row">
      <div className="border-b bg-muted/30 sm:w-44 sm:shrink-0 sm:border-r sm:border-b-0">
        <h3 className="hidden px-4 pt-4 pb-2 text-sm font-semibold sm:block">
          Settings
        </h3>
        <ScrollArea orientation="horizontal">
          <nav aria-label="Settings sections">
            <ul className="flex w-max gap-1 p-2 sm:w-full sm:flex-col">
              {sections.map((section) => {
                const Icon = section.icon;
                const isActive = active === section.id;
                return (
                  <li key={section.id}>
                    <button
                      type="button"
                      aria-current={isActive ? "location" : undefined}
                      onClick={() => jumpTo(section.id)}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-sm whitespace-nowrap text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50",
                        isActive && "bg-background font-medium text-foreground shadow-xs",
                      )}
                    >
                      <Icon aria-hidden="true" className="size-4" />
                      {section.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </ScrollArea>
      </div>

      <ScrollArea
        ref={rootRef}
        onScrollCapture={handleScroll}
        onWheelCapture={releaseJump}
        onTouchStartCapture={releaseJump}
        onPointerDownCapture={releaseJump}
        onKeyDownCapture={releaseJump}
        className="h-[26rem] min-w-0 sm:flex-1"
      >
        <div className="flex flex-col gap-8 p-5 pr-6">
          <section
            ref={registerSection("profile")}
            aria-labelledby="scroll-area-12-profile-title"
            className="flex flex-col gap-4"
          >
            <div>
              <h4 id="scroll-area-12-profile-title" className="font-semibold">
                Profile
              </h4>
              <p className="text-sm text-muted-foreground">
                How teammates see you across Northwind.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="scroll-area-12-name">Full name</Label>
                <Input id="scroll-area-12-name" defaultValue="Alex Morgan" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="scroll-area-12-title">Job title</Label>
                <Input id="scroll-area-12-title" defaultValue="Product designer" />
              </div>
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <Label htmlFor="scroll-area-12-email">Email</Label>
                <Input
                  id="scroll-area-12-email"
                  type="email"
                  defaultValue="alex@northwind.io"
                />
              </div>
            </div>
          </section>

          <section
            ref={registerSection("notifications")}
            aria-labelledby="scroll-area-12-notifications-title"
            className="flex flex-col gap-4"
          >
            <div>
              <h4
                id="scroll-area-12-notifications-title"
                className="font-semibold"
              >
                Notifications
              </h4>
              <p className="text-sm text-muted-foreground">
                Choose which emails land in your inbox.
              </p>
            </div>
            {emailSettings.map((setting) => (
              <div
                key={setting.id}
                className="flex items-start justify-between gap-4"
              >
                <div className="flex flex-col gap-0.5">
                  <Label htmlFor={`scroll-area-12-${setting.id}`}>
                    {setting.label}
                  </Label>
                  <span className="text-xs text-muted-foreground">
                    {setting.description}
                  </span>
                </div>
                <Switch
                  id={`scroll-area-12-${setting.id}`}
                  defaultChecked={setting.defaultChecked}
                />
              </div>
            ))}
          </section>

          <section
            ref={registerSection("security")}
            aria-labelledby="scroll-area-12-security-title"
            className="flex flex-col gap-4"
          >
            <div>
              <h4 id="scroll-area-12-security-title" className="font-semibold">
                Security
              </h4>
              <p className="text-sm text-muted-foreground">
                Two-factor authentication is on. Review where you're signed in.
              </p>
            </div>
            <ul className="divide-y rounded-lg border">
              {sessions
                .filter((session) => !signedOut.includes(session.device))
                .map((session) => (
                  <li
                    key={session.device}
                    className="flex items-center justify-between gap-3 px-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {session.device}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {session.place}
                      </p>
                    </div>
                    {session.current ? (
                      <Badge variant="secondary">This device</Badge>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setSignedOut((current) => [...current, session.device])
                        }
                      >
                        Sign out
                        <span className="sr-only"> {session.device}</span>
                      </Button>
                    )}
                  </li>
                ))}
            </ul>
            {signedOut.length > 0 ? (
              <p aria-live="polite" className="text-xs text-muted-foreground">
                Signed out of {signedOut.length}{" "}
                {signedOut.length === 1 ? "device" : "devices"}.
              </p>
            ) : null}
          </section>

          <section
            ref={registerSection("billing")}
            aria-labelledby="scroll-area-12-billing-title"
            className="flex flex-col gap-4"
          >
            <div>
              <h4 id="scroll-area-12-billing-title" className="font-semibold">
                Billing
              </h4>
              <p className="text-sm text-muted-foreground">
                Team plan · 12 seats · renews November 1, 2026.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border px-3 py-3">
              <div className="flex items-center gap-3">
                <CreditCard
                  aria-hidden="true"
                  className="size-5 text-muted-foreground"
                />
                <div>
                  <p className="text-sm font-medium">Visa ending in 4242</p>
                  <p className="text-xs text-muted-foreground">Expires 08/28</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={cardLinkSent}
                onClick={() => setCardLinkSent(true)}
              >
                {cardLinkSent ? "Link sent" : "Update card"}
              </Button>
            </div>
            <p aria-live="polite" className="text-xs text-muted-foreground">
              {cardLinkSent
                ? "We emailed alex@northwind.io a secure link to update your card."
                : ""}
            </p>
          </section>

          <section
            ref={registerSection("danger")}
            aria-labelledby="scroll-area-12-danger-title"
            className="flex flex-col gap-3 rounded-lg border border-destructive/40 p-4"
          >
            <div>
              <h4
                id="scroll-area-12-danger-title"
                className="font-semibold text-destructive"
              >
                Delete account
              </h4>
              <p className="text-sm text-muted-foreground">
                Permanently remove your account and personal data. Projects you
                own will be transferred to a workspace admin.
              </p>
            </div>
            {deleteStep === "idle" ? (
              <Button
                variant="destructive"
                className="self-start"
                onClick={() => setDeleteStep("confirm")}
              >
                Delete my account
              </Button>
            ) : null}
            {deleteStep === "confirm" ? (
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="destructive"
                  onClick={() => setDeleteStep("scheduled")}
                >
                  Yes, delete my account
                </Button>
                <Button variant="outline" onClick={() => setDeleteStep("idle")}>
                  Cancel
                </Button>
              </div>
            ) : null}
            {deleteStep === "scheduled" ? (
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p role="status" className="text-sm font-medium">
                  Deletion scheduled for October 9, 2026.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeleteStep("idle")}
                >
                  Undo
                </Button>
              </div>
            ) : null}
          </section>
        </div>
      </ScrollArea>
    </div>
  );
}
