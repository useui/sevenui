"use client";

import * as React from "react";
import type { RenderProp } from "@ui-sdk/react/primitive";
import { renderElement } from "@ui-sdk/react/primitive";

import { cn } from "cn";

type ValidationMode = "onSubmit" | "onBlur" | "onChange";
type FormErrors = Record<string, string | string[]>;

// Shared with field.tsx through a global symbol (see the note there): UI SDK
// has no Form, so this one is a native <form> that runs the fields' Base UI
// style `validate` before `onFormSubmit`, and hands `errors` to the fields.
type FormRegistration = {
  name: string | undefined;
  value: () => unknown;
  validate: () => Promise<boolean> | boolean;
  focus: () => void;
};
type FormContextValue = {
  errors?: FormErrors;
  clearError: (name: string) => void;
  validationMode?: ValidationMode;
  register: (field: FormRegistration) => () => void;
  values: () => Record<string, unknown>;
};
const formContextKey = Symbol.for("sevenui.ui-sdk.form");
const contexts = globalThis as {
  [key: symbol]: React.Context<FormContextValue | null> | undefined;
};
contexts[formContextKey] ??= React.createContext<FormContextValue | null>(null);
const FormContext = contexts[formContextKey] as React.Context<FormContextValue | null>;

const noNames = new Set<string>();

type FormSubmitEventDetails = {
  reason: "none";
  event: React.SubmitEvent<HTMLFormElement>["nativeEvent"];
};

type FormProps<FormValues extends Record<string, any> = Record<string, any>> =
  Omit<React.ComponentProps<"form">, "className"> & {
    className?: string;
    render?: RenderProp<{}> | React.ReactElement<unknown>;
    validationMode?: ValidationMode;
    errors?: FormErrors;
    onFormSubmit?: (
      formValues: FormValues,
      eventDetails: FormSubmitEventDetails,
    ) => void;
    actionsRef?: React.RefObject<{
      validate: (fieldName?: string) => void;
    } | null>;
  };

function Form<FormValues extends Record<string, any> = Record<string, any>>({
  className,
  render,
  validationMode,
  errors,
  onFormSubmit,
  actionsRef,
  onSubmit,
  ...props
}: FormProps<FormValues>) {
  const fields = React.useRef(new Set<FormRegistration>());
  // An external error clears once its field changes, until `errors` changes.
  const [cleared, setCleared] = React.useState<{
    errors?: FormErrors;
    names: Set<string>;
  }>({ errors, names: new Set() });
  const clearedNames = cleared.errors === errors ? cleared.names : noNames;
  const visibleErrors = React.useMemo(() => {
    if (!errors || clearedNames.size === 0) return errors;
    return Object.fromEntries(
      Object.entries(errors).filter(([name]) => !clearedNames.has(name)),
    );
  }, [errors, clearedNames]);

  const values = React.useCallback(() => {
    const result: Record<string, unknown> = {};
    for (const field of fields.current) {
      if (field.name) result[field.name] = field.value();
    }
    return result;
  }, []);

  const validate = React.useCallback((fieldName?: string) => {
    const targets = [...fields.current].filter(
      (field) => fieldName === undefined || field.name === fieldName,
    );
    return targets.map((field) => ({ field, valid: field.validate() }));
  }, []);

  React.useImperativeHandle(actionsRef, () => ({
    validate: (fieldName?: string) => void validate(fieldName),
  }));

  const context = React.useMemo<FormContextValue>(
    () => ({
      errors: visibleErrors,
      validationMode,
      values,
      register: (field) => {
        fields.current.add(field);
        return () => fields.current.delete(field);
      },
      clearError: (name) =>
        setCleared((current) => {
          const names = current.errors === errors ? current.names : noNames;
          if (!errors?.[name] || names.has(name)) return current;
          return { errors, names: new Set(names).add(name) };
        }),
    }),
    [visibleErrors, validationMode, values, errors],
  );

  const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
    onSubmit?.(event);
    if (!onFormSubmit) return;
    event.preventDefault();
    // Synchronous validators block the submit, as in Base UI; asynchronous
    // ones only show their result.
    const results = validate();
    const invalid = results.find((result) => result.valid === false);
    if (invalid) {
      invalid.field.focus();
      return;
    }
    onFormSubmit(values() as FormValues, {
      reason: "none",
      event: event.nativeEvent,
    });
  };

  return (
    <FormContext.Provider value={context}>
      {renderElement(
        "form",
        {
          ...props,
          className: cn("grid gap-4", className),
          onSubmit: handleSubmit,
        },
        render as RenderProp<{}> | undefined,
        {},
      )}
    </FormContext.Provider>
  );
}

export { Form };
