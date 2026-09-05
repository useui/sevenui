"use client";

import * as React from "react";

import { Button } from "@/registry/base/ui/button";
import { Field, FieldError, FieldLabel } from "@/registry/base/ui/field";
import { Form } from "@/registry/base/ui/form";
import { Input } from "@/registry/base/ui/input";

export default function FormDemo() {
  const [errors, setErrors] = React.useState({});

  return (
    <div className="w-full max-w-sm">
      <Form
        errors={errors}
        onFormSubmit={() => {
          // Simulate a server-side validation error for demonstration.
          setErrors({ url: "This URL is already taken." });
        }}
      >
        <Field name="url">
          <FieldLabel>Website</FieldLabel>
          <Input required type="url" placeholder="https://example.com" />
          <FieldError />
        </Field>
        <Button type="submit">Submit</Button>
      </Form>
    </div>
  );
}
