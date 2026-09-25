"use client";

import * as React from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/registry/base/ui/alert-dialog";
import { Button } from "@/registry/base/ui/button";
import { Input } from "@/registry/base/ui/input";
import { Label } from "@/registry/base/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/registry/base/ui/tabs";

type Profile = { name: string; handle: string };

const savedProfile: Profile = { name: "Amara Nwosu", handle: "amara" };

const sections = [
  { value: "profile", label: "Profile" },
  { value: "security", label: "Security" },
  { value: "sessions", label: "Sessions" },
];

export default function AlertDialog09() {
  const [tab, setTab] = React.useState("profile");
  const [saved, setSaved] = React.useState(savedProfile);
  const [draft, setDraft] = React.useState(savedProfile);
  const [pendingTab, setPendingTab] = React.useState<string | null>(null);
  // Remembered separately so the copy stays stable while the dialog animates out.
  const [lastRequested, setLastRequested] = React.useState("security");

  const dirty = draft.name !== saved.name || draft.handle !== saved.handle;

  const handleTabChange = (next: string) => {
    if (dirty && tab === "profile" && next !== "profile") {
      // Hold the navigation until the user decides what to do with the edits.
      setPendingTab(next);
      setLastRequested(next);
      return;
    }
    setTab(next);
  };

  const discardAndLeave = () => {
    setDraft(saved);
    if (pendingTab) setTab(pendingTab);
  };

  const pendingLabel =
    sections.find((section) => section.value === lastRequested)?.label ??
    "another section";

  return (
    <div className="w-full max-w-md rounded-xl border bg-card p-4 text-card-foreground">
      <Tabs
        value={tab}
        onValueChange={(value) => handleTabChange(String(value))}
      >
        <TabsList className="w-full">
          {sections.map((section) => (
            <TabsTrigger key={section.value} value={section.value}>
              {section.label}
              {section.value === "profile" && dirty ? (
                <>
                  <span
                    aria-hidden="true"
                    className="size-1.5 rounded-full bg-primary"
                  />
                  <span className="sr-only">(unsaved changes)</span>
                </>
              ) : null}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="profile">
          <form
            className="flex flex-col gap-4 pt-3"
            onSubmit={(event) => {
              event.preventDefault();
              setSaved(draft);
            }}
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="alert-dialog-09-name">Display name</Label>
              <Input
                id="alert-dialog-09-name"
                value={draft.name}
                onChange={(event) =>
                  setDraft((d) => ({ ...d, name: event.target.value }))
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="alert-dialog-09-handle">Username</Label>
              <Input
                id="alert-dialog-09-handle"
                value={draft.handle}
                onChange={(event) =>
                  setDraft((d) => ({ ...d, handle: event.target.value }))
                }
              />
              <p className="text-xs text-muted-foreground">
                Your profile lives at relay.app/{draft.handle || "username"}
              </p>
            </div>
            <div className="flex items-center justify-end gap-2">
              <p
                aria-live="polite"
                className="mr-auto text-xs text-muted-foreground"
              >
                {dirty ? "Unsaved changes" : "All changes saved"}
              </p>
              <Button
                type="button"
                variant="ghost"
                disabled={!dirty}
                onClick={() => setDraft(saved)}
              >
                Reset
              </Button>
              <Button type="submit" disabled={!dirty}>
                Save
              </Button>
            </div>
          </form>
        </TabsContent>
        <TabsContent
          value="security"
          className="pt-3 text-sm text-muted-foreground"
        >
          Two-factor authentication is on. Your password was last changed 41
          days ago.
        </TabsContent>
        <TabsContent
          value="sessions"
          className="pt-3 text-sm text-muted-foreground"
        >
          You are signed in on 2 devices: a MacBook Pro in Lagos and an iPhone
          15.
        </TabsContent>
      </Tabs>

      <AlertDialog
        open={pendingTab !== null}
        onOpenChange={(open) => {
          if (!open) setPendingTab(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave without saving?</AlertDialogTitle>
            <AlertDialogDescription>
              Your edits to the profile have not been saved. If you open{" "}
              {pendingLabel} now, they will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={discardAndLeave}>
              Discard changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
