"use client";

import { Button } from "@/registry/base/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/registry/base/ui/field";
import { Form } from "@/registry/base/ui/form";
import { Input } from "@/registry/base/ui/input";
import { LabSection } from "../lab-frame";

export default function FormMatrix() {
  return (
    <div>
      <LabSection title="form with fields (clean)">
        <Form className="w-full max-w-sm" onFormSubmit={() => {}}>
          <Field name="name">
            <FieldLabel>Name</FieldLabel>
            <Input placeholder="Ada Lovelace" />
          </Field>
          <Field name="email">
            <FieldLabel>Email</FieldLabel>
            <Input type="email" placeholder="ada@example.com" />
            <FieldDescription>We never share it.</FieldDescription>
          </Field>
          <Button type="submit">Create account</Button>
        </Form>
      </LabSection>

      <LabSection title="form with external errors (errors prop)">
        <Form
          className="w-full max-w-sm"
          errors={{ email: "Email is already taken.", username: "Username is reserved." }}
        >
          <Field name="email">
            <FieldLabel>Email</FieldLabel>
            <Input type="email" defaultValue="ada@example.com" />
            <FieldError />
          </Field>
          <Field name="username">
            <FieldLabel>Username</FieldLabel>
            <Input defaultValue="admin" />
            <FieldError />
          </Field>
          <Button type="submit">Save</Button>
        </Form>
      </LabSection>
    </div>
  );
}
