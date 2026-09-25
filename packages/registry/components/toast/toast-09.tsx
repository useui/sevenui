"use client";

import * as React from "react";

import { Button } from "@/registry/base/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/registry/base/ui/card";
import { Label } from "@/registry/base/ui/label";
import { Switch } from "@/registry/base/ui/switch";
import { Toaster, createToastManager } from "@/registry/base/ui/toast";

const toastManager = createToastManager();

const preferences = [
  {
    id: "mentions",
    label: "Mentions and replies",
    description: "When someone @mentions you or replies to your comment.",
  },
  {
    id: "assignments",
    label: "Task assignments",
    description: "When an issue is assigned to you or its due date moves.",
  },
  {
    id: "digest",
    label: "Weekly digest",
    description: "A Monday summary of activity across your projects.",
  },
] as const;

type PreferenceId = (typeof preferences)[number]["id"];
type PreferenceState = Record<PreferenceId, boolean>;

const initialState: PreferenceState = {
  mentions: true,
  assignments: true,
  digest: false,
};

export default function Toast09() {
  const [saved, setSaved] = React.useState<PreferenceState>(initialState);
  const [draft, setDraft] = React.useState<PreferenceState>(initialState);
  const [saving, setSaving] = React.useState(false);

  const dirty = preferences.some(({ id }) => draft[id] !== saved[id]);

  async function handleSave() {
    setSaving(true);
    const next = draft;
    const enabled = preferences.filter(({ id }) => next[id]).length;

    try {
      await toastManager.promise(
        new Promise<number>((resolve) => {
          setTimeout(() => resolve(enabled), 1200);
        }),
        {
          loading: {
            title: "Saving preferences…",
            description: "Syncing with your other devices.",
          },
          success: (count) => ({
            title: "Email preferences saved",
            description:
              count === 0
                ? "You won't receive any email notifications."
                : `You'll get email for ${count} of ${preferences.length} activity types.`,
          }),
          error: {
            title: "Couldn't save preferences",
            description: "Check your connection and try again.",
          },
        },
      );
      setSaved(next);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Toaster toastManager={toastManager} />
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Email notifications</CardTitle>
          <CardDescription>
            Choose which activity lands in your inbox.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col divide-y divide-border">
          {preferences.map((preference) => (
            <div
              key={preference.id}
              className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0"
            >
              <div className="flex min-w-0 flex-col gap-0.5">
                <Label htmlFor={`toast-09-${preference.id}`}>
                  {preference.label}
                </Label>
                <p
                  id={`toast-09-${preference.id}-description`}
                  className="text-xs text-muted-foreground"
                >
                  {preference.description}
                </p>
              </div>
              <Switch
                id={`toast-09-${preference.id}`}
                aria-describedby={`toast-09-${preference.id}-description`}
                checked={draft[preference.id]}
                disabled={saving}
                onCheckedChange={(checked) =>
                  setDraft((current) => ({
                    ...current,
                    [preference.id]: checked,
                  }))
                }
                className="mt-0.5"
              />
            </div>
          ))}
        </CardContent>
        <CardFooter className="justify-end gap-2">
          <Button
            variant="ghost"
            disabled={!dirty || saving}
            onClick={() => setDraft(saved)}
          >
            Discard
          </Button>
          <Button disabled={!dirty || saving} onClick={handleSave}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </CardFooter>
      </Card>
    </>
  );
}
