"use client";

import * as React from "react";
import { LockIcon, PencilIcon } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/registry/base/ui/field";
import { Form } from "@/registry/base/ui/form";
import { Input } from "@/registry/base/ui/input";

type Contact = {
  name: string;
  relationship: string;
  phone: string;
  email: string;
};

const initialContact: Contact = {
  name: "Rosa Delgado",
  relationship: "Partner",
  phone: "+1 415 555 0132",
  email: "rosa.delgado@fastmail.com",
};

const fields: {
  name: keyof Contact;
  label: string;
  type?: string;
  autoComplete: string;
  required?: boolean;
}[] = [
  { name: "name", label: "Full name", autoComplete: "off", required: true },
  { name: "relationship", label: "Relationship", autoComplete: "off" },
  {
    name: "phone",
    label: "Phone",
    type: "tel",
    autoComplete: "off",
    required: true,
  },
  { name: "email", label: "Email", type: "email", autoComplete: "off" },
];

export default function Form05() {
  const [contact, setContact] = React.useState(initialContact);
  const [editing, setEditing] = React.useState(false);
  const [version, setVersion] = React.useState(0);
  const firstInput = React.useRef<HTMLInputElement>(null);
  const editButton = React.useRef<HTMLButtonElement>(null);
  const hasEdited = React.useRef(false);

  // Move focus into the form when editing starts and back to the Edit button
  // when it ends, so keyboard users never land on a removed element.
  React.useEffect(() => {
    if (editing) {
      hasEdited.current = true;
      firstInput.current?.focus();
    } else if (hasEdited.current) {
      editButton.current?.focus();
    }
  }, [editing]);

  function cancel() {
    // Remount the fields so they pick up the last saved values again.
    setVersion((current) => current + 1);
    setEditing(false);
  }

  return (
    <div className="w-full max-w-lg rounded-xl border border-border bg-card">
      <div className="flex items-start justify-between gap-3 border-b border-border p-5">
        <div className="grid gap-1">
          <h2 id="form-05-title" className="font-semibold">
            Emergency contact
          </h2>
          <p className="text-sm text-muted-foreground">
            Who we call if something happens at work. Visible to HR only.
          </p>
        </div>
        {editing ? null : (
          <Button
            ref={editButton}
            variant="outline"
            size="sm"
            onClick={() => setEditing(true)}
          >
            <PencilIcon aria-hidden="true" data-icon="inline-start" />
            Edit
          </Button>
        )}
      </div>
      <Form
        key={version}
        aria-labelledby="form-05-title"
        className="gap-5 p-5"
        onKeyDown={(event) => {
          if (event.key === "Escape" && editing) cancel();
        }}
        onFormSubmit={(values) => {
          setContact(values as Contact);
          // Remount so the read-only fields take the saved values as defaults.
          setVersion((current) => current + 1);
          setEditing(false);
        }}
      >
        <FieldGroup className="grid gap-4 sm:grid-cols-2">
          {fields.map((field, index) => (
            <Field key={field.name} name={field.name}>
              <FieldLabel>{field.label}</FieldLabel>
              <Input
                ref={index === 0 ? firstInput : undefined}
                type={field.type}
                required={field.required}
                readOnly={!editing}
                autoComplete={field.autoComplete}
                defaultValue={contact[field.name]}
                className="read-only:cursor-default read-only:border-transparent read-only:bg-muted/60 read-only:px-2.5 read-only:focus-visible:border-ring dark:read-only:bg-muted/40"
              />
              <FieldError match="valueMissing">
                {field.label} is required.
              </FieldError>
              <FieldError match="typeMismatch">
                Enter an address like name@company.com.
              </FieldError>
            </Field>
          ))}
        </FieldGroup>
        {editing ? (
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="ghost" onClick={cancel}>
              Cancel
            </Button>
            <Button type="submit">Save contact</Button>
          </div>
        ) : (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <LockIcon aria-hidden="true" className="size-3.5" />
            Read-only. Select Edit to change these details.
          </p>
        )}
      </Form>
    </div>
  );
}
