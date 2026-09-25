"use client";

import { Check } from "lucide-react";
import * as React from "react";

import { Button } from "@/registry/base/ui/button";
import { Input } from "@/registry/base/ui/input";
import { Label } from "@/registry/base/ui/label";

const fields = [
  {
    id: "label-07-email",
    label: "Work email",
    type: "email",
    autoComplete: "email",
    defaultValue: "maya@northwind.io",
  },
  {
    id: "label-07-password",
    label: "Password",
    type: "password",
    autoComplete: "current-password",
    defaultValue: "",
  },
];

export default function Label07() {
  const [signedInAs, setSignedInAs] = React.useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setSignedInAs(String(data.get("label-07-email") ?? ""));
  }

  return (
    <form
      className="flex w-full max-w-sm flex-col gap-3"
      onSubmit={handleSubmit}
      onChange={() => setSignedInAs(null)}
    >
      {fields.map((field) => (
        <div key={field.id} className="relative">
          {/* A blank placeholder lets :placeholder-shown detect the empty state. */}
          <Input
            id={field.id}
            name={field.id}
            type={field.type}
            autoComplete={field.autoComplete}
            defaultValue={field.defaultValue}
            required
            placeholder=" "
            className="peer h-12 px-3 pt-5 pb-1.5"
          />
          <Label
            htmlFor={field.id}
            className="pointer-events-none absolute top-2 left-3 origin-left text-xs font-normal text-muted-foreground transition-[top,font-size,color] duration-200 ease-out peer-placeholder-shown:top-4.5 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-xs peer-focus:text-foreground motion-reduce:transition-none"
          >
            {field.label}
          </Label>
        </div>
      ))}
      <Button type="submit" className="mt-1 h-10">
        {signedInAs ? (
          <>
            <Check aria-hidden="true" />
            Signed in
          </>
        ) : (
          "Sign in"
        )}
      </Button>
      <p
        aria-live="polite"
        className={
          signedInAs ? "text-center text-xs text-muted-foreground" : "sr-only"
        }
      >
        {signedInAs ? `Welcome back, ${signedInAs}.` : null}
      </p>
    </form>
  );
}
