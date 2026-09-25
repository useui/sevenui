"use client";

import { Checkbox } from "@/registry/base/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/registry/base/ui/field";

const preferences = [
  {
    name: "weeklyDigest",
    label: "Send me the weekly digest",
    description:
      "A Monday morning summary of new comments, mentions, and finished tasks.",
    defaultChecked: true,
  },
  {
    name: "productUpdates",
    label: "Product announcements",
    description: "Release notes and new features, about twice a month.",
    defaultChecked: false,
  },
];

export default function Checkbox01() {
  return (
    <FieldGroup className="w-full max-w-sm gap-4">
      {preferences.map((preference) => (
        <Field
          key={preference.name}
          name={preference.name}
          orientation="horizontal"
        >
          <Checkbox defaultChecked={preference.defaultChecked} />
          <FieldContent>
            <FieldLabel>{preference.label}</FieldLabel>
            <FieldDescription>{preference.description}</FieldDescription>
          </FieldContent>
        </Field>
      ))}
    </FieldGroup>
  );
}
