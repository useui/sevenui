"use client";

import * as React from "react";
import { Field as FieldPrimitive } from "@base-ui/react/field";
import {
  Controller,
  FormProvider,
  useFormContext,
  useFormState,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

import { cn } from "@/registry/base/lib/utils";

const Form = FormProvider;

type FormFieldContextValue = { name: string };

const FormFieldContext = React.createContext<FormFieldContextValue | null>(
  null,
);

function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: ControllerProps<TFieldValues, TName>) {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
}

function useFormField() {
  const fieldContext = React.useContext(FormFieldContext);
  if (!fieldContext) {
    throw new Error("useFormField must be used within <FormField>");
  }
  const { getFieldState } = useFormContext();
  const formState = useFormState({ name: fieldContext.name });
  const fieldState = getFieldState(fieldContext.name, formState);
  return { name: fieldContext.name, ...fieldState };
}

function FormItem({
  className,
  ...props
}: React.ComponentProps<typeof FieldPrimitive.Root>) {
  const { invalid } = useFormField();
  return (
    <FieldPrimitive.Root
      invalid={invalid}
      className={cn("grid gap-2", className)}
      {...props}
    />
  );
}

function FormLabel({
  className,
  ...props
}: React.ComponentProps<typeof FieldPrimitive.Label>) {
  return (
    <FieldPrimitive.Label
      className={cn(
        "flex select-none items-center gap-2 text-sm leading-none font-medium data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[invalid]:text-destructive",
        className,
      )}
      {...props}
    />
  );
}

function FormControl({ children }: { children: React.ReactNode }) {
  // Base UI Field wires ids and aria to the nested control automatically;
  // this exists only to keep shadcn's component surface.
  return <>{children}</>;
}

function FormDescription({
  className,
  ...props
}: React.ComponentProps<typeof FieldPrimitive.Description>) {
  return (
    <FieldPrimitive.Description
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

function FormMessage({
  className,
  children,
  ...props
}: React.ComponentProps<typeof FieldPrimitive.Error>) {
  const { error } = useFormField();
  const body = error ? String(error.message ?? "") : children;
  if (!body) {
    return null;
  }
  return (
    <FieldPrimitive.Error
      match={true}
      className={cn("text-sm font-medium text-destructive", className)}
      {...props}
    >
      {body}
    </FieldPrimitive.Error>
  );
}

export {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  useFormField,
};
