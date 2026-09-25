"use client";

import * as React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/registry/base/ui/avatar";
import { Button } from "@/registry/base/ui/button";
import { Input } from "@/registry/base/ui/input";
import { Label } from "@/registry/base/ui/label";
import { Skeleton } from "@/registry/base/ui/skeleton";

const profile = {
  name: "Priya Raman",
  email: "priya@northwind.io",
  title: "Staff Product Designer",
};

const fields = [
  { key: "name", label: "Full name", type: "text", autoComplete: "name" },
  { key: "email", label: "Email", type: "email", autoComplete: "email" },
  {
    key: "title",
    label: "Job title",
    type: "text",
    autoComplete: "organization-title",
  },
] as const;

export default function Skeleton09() {
  const id = React.useId();
  const [loading, setLoading] = React.useState(true);
  const [saved, setSaved] = React.useState(profile);
  const [values, setValues] = React.useState(profile);
  const [justSaved, setJustSaved] = React.useState(false);
  const [photo, setPhoto] = React.useState("/placeholder.svg");
  const fileRef = React.useRef<HTMLInputElement>(null);

  // Release the previous preview URL when the photo changes or on unmount.
  React.useEffect(() => {
    if (!photo.startsWith("blob:")) return;
    return () => URL.revokeObjectURL(photo);
  }, [photo]);

  React.useEffect(() => {
    if (!loading) return;
    const timer = window.setTimeout(() => setLoading(false), 1400);
    return () => window.clearTimeout(timer);
  }, [loading]);

  const dirty = (Object.keys(profile) as (keyof typeof profile)[]).some(
    (key) => values[key] !== saved[key],
  );

  return (
    <form
      aria-labelledby={`${id}-title`}
      aria-busy={loading}
      onSubmit={(event) => {
        event.preventDefault();
        setSaved(values);
        setJustSaved(true);
      }}
      className="w-full max-w-md rounded-xl border border-border bg-card text-card-foreground"
    >
      <div className="flex flex-col gap-1 border-b border-border p-5">
        <h3 id={`${id}-title`} className="text-base font-semibold">
          Profile
        </h3>
        <p className="text-sm text-muted-foreground">
          This is how teammates see you across the workspace.
        </p>
      </div>

      <p role="status" className="sr-only">
        {loading ? "Loading your profile" : ""}
      </p>

      {loading ? (
        <div aria-hidden="true" className="flex flex-col gap-5 p-5">
          <div className="flex items-center gap-4">
            <Skeleton className="size-14 rounded-full" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-7 w-28 rounded-lg" />
              <Skeleton className="h-3 w-36" />
            </div>
          </div>
          {fields.map((field) => (
            <div key={field.key} className="flex flex-col gap-2">
              <Skeleton className="h-3.5 w-20" />
              <Skeleton className="h-8 w-full rounded-lg" />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-5 p-5">
          <div className="flex items-center gap-4">
            <Avatar className="size-14">
              <AvatarImage src={photo} alt="" />
              <AvatarFallback>PR</AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start gap-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileRef.current?.click()}
              >
                Change photo
              </Button>
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg"
                tabIndex={-1}
                aria-hidden="true"
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) setPhoto(URL.createObjectURL(file));
                  event.target.value = "";
                }}
              />
              <p className="text-xs text-muted-foreground">
                PNG or JPG, up to 2 MB.
              </p>
            </div>
          </div>
          {fields.map((field) => (
            <div key={field.key} className="flex flex-col gap-2">
              <Label htmlFor={`${id}-${field.key}`}>{field.label}</Label>
              <Input
                id={`${id}-${field.key}`}
                type={field.type}
                autoComplete={field.autoComplete}
                value={values[field.key]}
                onChange={(event) => {
                  setJustSaved(false);
                  setValues((current) => ({
                    ...current,
                    [field.key]: event.target.value,
                  }));
                }}
              />
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-3">
        <p
          role="status"
          className="mr-auto text-xs text-muted-foreground"
        >
          {justSaved && !dirty ? "Changes saved" : ""}
        </p>
        <Button
          type="button"
          variant="ghost"
          disabled={loading || !dirty}
          onClick={() => setValues(saved)}
        >
          Discard
        </Button>
        <Button type="submit" disabled={loading || !dirty}>
          Save changes
        </Button>
      </div>
    </form>
  );
}
