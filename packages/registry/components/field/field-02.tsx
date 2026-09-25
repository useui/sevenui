"use client";

import { useState } from "react";
import { CheckIcon } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/registry/base/ui/field";
import { Input } from "@/registry/base/ui/input";
import { Textarea } from "@/registry/base/ui/textarea";

// Fixed label column once the group is wide enough; stacked below that.
const labelColumn = "@md/field-group:flex-[0_0_11rem]";
const controlColumn = "@md/field-group:flex-1";

export default function Field02() {
  const [saved, setSaved] = useState(false);

  return (
    <form
      className="w-full max-w-2xl"
      onSubmit={(event) => {
        event.preventDefault();
        setSaved(true);
      }}
      onChange={() => setSaved(false)}
      onReset={() => setSaved(false)}
    >
      <FieldGroup>
        <Field name="fullName" orientation="responsive">
          <FieldContent className={labelColumn}>
            <FieldLabel>Full name</FieldLabel>
            <FieldDescription>As it appears on your ID.</FieldDescription>
          </FieldContent>
          <Input
            className={controlColumn}
            defaultValue="Priya Raman"
            autoComplete="name"
          />
        </Field>
        <FieldSeparator />
        <Field name="workEmail" orientation="responsive">
          <FieldContent className={labelColumn}>
            <FieldLabel>Work email</FieldLabel>
            <FieldDescription>Where approvals are sent.</FieldDescription>
          </FieldContent>
          <Input
            className={controlColumn}
            type="email"
            defaultValue="priya@lumen.dev"
            autoComplete="email"
          />
        </Field>
        <FieldSeparator />
        <Field name="bio" orientation="responsive">
          <FieldContent className={labelColumn}>
            <FieldLabel>Bio</FieldLabel>
            <FieldDescription>A line or two for your profile.</FieldDescription>
          </FieldContent>
          <Textarea
            className={controlColumn}
            defaultValue="Platform engineer. I keep the build green and the on-call rotation quiet."
          />
        </Field>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {saved ? (
            <p
              role="status"
              className="mr-auto flex items-center gap-1.5 text-sm text-muted-foreground"
            >
              <CheckIcon aria-hidden="true" className="size-4 text-success" />
              Profile saved
            </p>
          ) : null}
          <Button type="reset" variant="ghost">
            Reset
          </Button>
          <Button type="submit">Save profile</Button>
        </div>
      </FieldGroup>
    </form>
  );
}
