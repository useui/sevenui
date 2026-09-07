"use client";

import { Controller, useForm } from "react-hook-form";

import { Button } from "@/registry/base/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/registry/base/ui/field";
import { Input } from "@/registry/base/ui/input";

type FormValues = { username: string };

export default function FieldRhf() {
  const form = useForm<FormValues>({
    defaultValues: { username: "" },
  });

  function onSubmit(values: FormValues) {
    console.log(values);
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="grid w-full max-w-sm gap-4"
      noValidate
    >
      <Controller
        control={form.control}
        name="username"
        rules={{
          required: "Username is required.",
          minLength: {
            value: 3,
            message: "Username must be at least 3 characters.",
          },
        }}
        render={({ field, fieldState }) => (
          <Field
            name={field.name}
            invalid={fieldState.invalid}
            touched={fieldState.isTouched}
            dirty={fieldState.isDirty}
          >
            <FieldLabel>Username</FieldLabel>
            <Input placeholder="sevenui" {...field} />
            <FieldDescription>
              This is your public display name.
            </FieldDescription>
            <FieldError
              errors={fieldState.error ? [fieldState.error] : undefined}
            />
          </Field>
        )}
      />
      <Button type="submit">Submit</Button>
    </form>
  );
}
