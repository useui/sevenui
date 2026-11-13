"use client";

import * as React from "react";
import {
  Field as FieldPrimitive,
  FieldDescription as FieldDescriptionPrimitive,
  FieldError as FieldErrorPrimitive,
  FieldGroup as FieldGroupPrimitive,
  FieldLabel as FieldLabelPrimitive,
  FieldLegend as FieldLegendPrimitive,
  FieldSet as FieldSetPrimitive,
  type ValidityKey,
} from "@ui-sdk/react/field";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";

import { Separator } from "@/registry/ui-sdk/ui/separator";

type ValidationMode = "onSubmit" | "onBlur" | "onChange";
type Validator = (
  value: unknown,
  formValues: Record<string, unknown>,
) => string | string[] | null | Promise<string | string[] | null>;

// What `Form` (form.tsx) shares with the fields inside it. UI SDK has no Form,
// so the two files meet through a context both reach by a global symbol: the
// public exports stay those of the base flavour, and neither file imports the
// other.
type FormRegistration = {
  name: string | undefined;
  value: () => unknown;
  validate: () => Promise<boolean> | boolean;
  focus: () => void;
  element: () => HTMLElement | null;
};
type FormContextValue = {
  errors?: Record<string, string | string[]>;
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

// The message a bare FieldError shows when the wrapper, not the browser,
// decides the field is invalid (`validate`, or a Form `errors` entry).
const FieldMessageContext = React.createContext<string[] | null>(null);

// The value Base UI hands `validate` and `onFormSubmit`: a checkbox or switch
// gives its checked state, a radio group its checked value, a number field a
// number, anything else its text.
function readValue(root: HTMLElement | null): unknown {
  const control = root?.querySelector<
    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  >("input, textarea, select");
  if (!root || !control) return undefined;
  if (control instanceof HTMLInputElement) {
    if (control.type === "radio") {
      return (
        root.querySelector<HTMLInputElement>("input[type=radio]:checked")
          ?.value ?? null
      );
    }
    if (control.type === "checkbox") return control.checked;
    // A number input submits its raw number from a hidden input.
    const raw = control
      .closest("[data-slot=number-input]")
      ?.querySelector<HTMLInputElement>(
        "[data-slot=number-input-hidden-input]",
      );
    if (raw) return raw.value === "" ? null : Number(raw.value);
  }
  return control.value;
}

function focusControl(root: HTMLElement | null) {
  root
    ?.querySelector<HTMLElement>(
      "input:not([type=hidden]):not([aria-hidden=true]), textarea, select, button, [tabindex]",
    )
    ?.focus();
}

function toMessages(error: string | string[] | null | undefined) {
  if (!error || (Array.isArray(error) && error.length === 0)) return null;
  return Array.isArray(error) ? error : [error];
}

function FieldSet({
  className,
  ...props
}: Omit<React.ComponentProps<typeof FieldSetPrimitive>, "className"> & {
  className?: string;
}) {
  return (
    <FieldSetPrimitive
      data-slot="field-set"
      className={cn(
        "flex flex-col gap-4 has-[>[data-slot=checkbox-group]]:gap-3 has-[>[data-slot=radio-group]]:gap-3",
        className,
      )}
      {...props}
    />
  );
}

function FieldLegend({
  className,
  variant = "legend",
  ...props
}: Omit<React.ComponentProps<typeof FieldLegendPrimitive>, "className"> & {
  className?: string;
  variant?: "legend" | "label";
}) {
  return (
    <FieldLegendPrimitive
      data-slot="field-legend"
      data-variant={variant}
      className={cn(
        "mb-1.5 font-medium data-[variant=label]:text-sm data-[variant=legend]:text-base",
        className,
      )}
      {...props}
    />
  );
}

function FieldGroup({
  className,
  ...props
}: Omit<React.ComponentProps<typeof FieldGroupPrimitive>, "className"> & {
  className?: string;
}) {
  return (
    <FieldGroupPrimitive
      data-slot="field-group"
      className={cn(
        "group/field-group @container/field-group flex w-full flex-col gap-5 data-[slot=checkbox-group]:gap-3 *:data-[slot=field-group]:gap-4",
        className,
      )}
      {...props}
    />
  );
}

const fieldVariants = cva(
  "group/field flex w-full gap-[var(--control-gap,0.5rem)] data-[invalid]:text-destructive",
  {
    variants: {
      orientation: {
        vertical: "flex-col *:w-full [&>.sr-only]:w-auto",
        horizontal:
          "flex-row items-center has-[>[data-slot=field-content]]:items-start *:data-[slot=field-label]:flex-auto has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
        responsive:
          "flex-col *:w-full @md/field-group:flex-row @md/field-group:items-center @md/field-group:*:w-auto @md/field-group:has-[>[data-slot=field-content]]:items-start @md/field-group:*:data-[slot=field-label]:flex-auto [&>.sr-only]:w-auto @md/field-group:has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
      },
    },
    defaultVariants: {
      orientation: "vertical",
    },
  },
);

type FieldPrimitiveProps = React.ComponentProps<typeof FieldPrimitive>;

type FieldProps = Omit<FieldPrimitiveProps, "className" | "render"> &
  VariantProps<typeof fieldVariants> & {
    className?: string;
    render?: FieldPrimitiveProps["render"] | React.ReactElement<unknown>;
    // Base UI's validation API, run by the wrapper (UI SDK validates natively).
    validate?: Validator;
    validationMode?: ValidationMode;
    validationDebounceTime?: number;
    // Base UI's externally controlled state flags, mirrored as attributes.
    dirty?: boolean;
    touched?: boolean;
    actionsRef?: React.RefObject<{ validate: () => void } | null>;
  };

function Field({
  className,
  orientation = "vertical",
  name,
  invalid,
  validate,
  validationMode,
  validationDebounceTime = 0,
  dirty,
  touched,
  actionsRef,
  render,
  ref,
  ...props
}: FieldProps) {
  const form = React.useContext(FormContext);
  const mode = validationMode ?? form?.validationMode ?? "onSubmit";
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const [error, setError] = React.useState<string[] | null>(null);
  const [shown, setShown] = React.useState(false);
  const run = React.useRef(0);
  const latest = React.useRef({ validate, form, shown, mode });
  latest.current = { validate, form, shown, mode };

  const runValidate = React.useCallback((): Promise<boolean> | boolean => {
    const { validate: check, form: owner } = latest.current;
    if (!check) return true;
    const ticket = ++run.current;
    const result = check(readValue(rootRef.current), owner?.values() ?? {});
    const settle = (next: string | string[] | null) => {
      if (ticket !== run.current) return true;
      const messages = toMessages(next);
      setError(messages);
      setShown(true);
      return messages === null;
    };
    return result instanceof Promise ? result.then(settle) : settle(result);
  }, []);

  React.useImperativeHandle(actionsRef, () => ({
    validate: () => void runValidate(),
  }));

  React.useEffect(() => {
    if (!form) return;
    return form.register({
      name,
      value: () => readValue(rootRef.current),
      validate: runValidate,
      focus: () => focusControl(rootRef.current),
      element: () => rootRef.current,
    });
  }, [form, name, runValidate]);

  // Value changes and blur reach the root as native events from whichever
  // control the field holds (input, checkbox, radio group, number field…).
  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const onValueChange = () => {
      const { form: owner, shown: wasShown, mode: current } = latest.current;
      if (name) owner?.clearError(name);
      if (current === "onChange" || wasShown) {
        clearTimeout(timer);
        if (current === "onChange" && validationDebounceTime > 0) {
          timer = setTimeout(() => void runValidate(), validationDebounceTime);
        } else {
          void runValidate();
        }
      }
    };
    const onFocusOut = (event: FocusEvent) => {
      if (root.contains(event.relatedTarget as Node | null)) return;
      if (latest.current.mode === "onBlur") void runValidate();
    };
    root.addEventListener("input", onValueChange);
    root.addEventListener("change", onValueChange);
    root.addEventListener("focusout", onFocusOut);
    return () => {
      clearTimeout(timer);
      root.removeEventListener("input", onValueChange);
      root.removeEventListener("change", onValueChange);
      root.removeEventListener("focusout", onFocusOut);
    };
  }, [name, runValidate, validationDebounceTime]);

  const external = name ? toMessages(form?.errors?.[name]) : null;
  const message = external ?? (shown ? error : null);
  // Base UI's `invalid={false}` is inert (`invalid === true || failed`);
  // UI SDK's would hide every error, so only `true` or a message is passed.
  const forcedInvalid = invalid === true || message ? true : undefined;

  return (
    <FieldMessageContext.Provider value={message}>
      <FieldPrimitive
        ref={(node: HTMLDivElement | null) => {
          rootRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        name={name}
        invalid={forcedInvalid}
        data-slot="field"
        data-orientation={orientation}
        data-dirty={dirty ? "" : undefined}
        data-touched={touched ? "" : undefined}
        className={cn(fieldVariants({ orientation }), className)}
        render={render as FieldPrimitiveProps["render"]}
        {...props}
      />
    </FieldMessageContext.Provider>
  );
}

function FieldContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-content"
      className={cn(
        "group/field-content flex flex-1 flex-col gap-0.5 leading-snug",
        className,
      )}
      {...props}
    />
  );
}

// Base renders the label through SevenUI's Label (`render={<Label />}`), so
// its classes come first; UI SDK's FieldLabel is already the native <label>.
function FieldLabel({
  className,
  ...props
}: Omit<React.ComponentProps<typeof FieldLabelPrimitive>, "className"> & {
  className?: string;
}) {
  return (
    <FieldLabelPrimitive
      data-slot="field-label"
      className={cn(
        "flex items-center gap-2 text-[length:var(--control-text,0.8125rem)] leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-60 peer-disabled:cursor-not-allowed peer-disabled:opacity-60 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60 has-data-disabled:opacity-60",
        "group/field-label peer/field-label flex w-fit gap-[var(--control-gap,0.5rem)] leading-snug group-data-[disabled]/field:opacity-50 has-data-checked:border-primary/30 has-data-checked:bg-primary/5 has-[>[data-slot=field]]:rounded-lg has-[>[data-slot=field]]:border has-[>[data-slot=field]]:not-has-[:disabled,[data-disabled]]:hover:bg-muted/50 has-[>[data-slot=field]]:has-[:focus-visible]:border-ring has-[>[data-slot=field]]:has-[:focus-visible]:ring-3 has-[>[data-slot=field]]:has-[:focus-visible]:ring-ring/50 *:data-[slot=field]:p-2.5 dark:has-data-checked:border-primary/20 dark:has-data-checked:bg-primary/10",
        "has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col",
        className,
      )}
      {...props}
    />
  );
}

function FieldTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-label"
      className={cn(
        "flex w-fit items-center gap-[var(--control-gap,0.5rem)] text-sm font-medium group-data-[disabled]/field:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

function FieldDescription({
  className,
  ...props
}: Omit<
  React.ComponentProps<typeof FieldDescriptionPrimitive>,
  "className"
> & {
  className?: string;
}) {
  return (
    <FieldDescriptionPrimitive
      data-slot="field-description"
      className={cn(
        "text-left text-xs leading-normal font-normal text-muted-foreground group-data-[orientation=horizontal]/field:text-balance [[data-variant=legend]+&]:-mt-1.5",
        "last:mt-0 nth-last-2:-mt-1",
        "[&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary",
        className,
      )}
      {...props}
    />
  );
}

function FieldSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  children?: React.ReactNode;
}) {
  return (
    <div
      data-slot="field-separator"
      data-content={!!children}
      className={cn(
        "relative -my-2 h-5 text-sm group-data-[variant=outline]/field-group:-mb-2",
        className,
      )}
      {...props}
    >
      <Separator className="absolute inset-0 top-1/2" />
      {children && (
        <span
          className="relative mx-auto block w-fit bg-background px-2 text-muted-foreground"
          data-slot="field-separator-content"
        >
          {children}
        </span>
      )}
    </div>
  );
}

function renderMessages(messages: Array<string | undefined>) {
  if (messages.length === 1) return messages[0];
  return (
    <ul className="ml-4 flex list-disc flex-col gap-1">
      {messages.map(
        (message, index) => message && <li key={index}>{message}</li>,
      )}
    </ul>
  );
}

function FieldError({
  className,
  children,
  errors,
  match,
  ...props
}: Omit<
  React.ComponentProps<typeof FieldErrorPrimitive>,
  "className" | "match" | "children"
> & {
  className?: string;
  children?: React.ReactNode;
  // Base UI also accepts `"valid"`, which UI SDK has no flag for.
  match?: boolean | ValidityKey | "valid";
  errors?: Array<{ message?: string } | undefined>;
}) {
  const fieldMessage = React.useContext(FieldMessageContext);
  const content = React.useMemo(() => {
    if (children) {
      return children;
    }

    if (!errors?.length) {
      return null;
    }

    const uniqueErrors = [
      ...new Map(errors.map((error) => [error?.message, error])).values(),
    ];

    return renderMessages(uniqueErrors.map((error) => error?.message));
  }, [children, errors]);

  // External errors / literal children requested but empty: render nothing.
  if ((children || errors) && !content) {
    return null;
  }

  // A bare error shows the wrapper's own message (validate / Form errors)
  // while it has one, else the browser's.
  const own =
    content == null && match === undefined && fieldMessage
      ? renderMessages(fieldMessage)
      : null;
  const shown = content ?? own;

  return (
    <FieldErrorPrimitive
      role="alert"
      data-slot="field-error"
      match={
        match === "valid"
          ? false
          : (match ?? (shown != null ? true : undefined))
      }
      className={cn("text-xs font-normal text-destructive", className)}
      {...props}
      // An explicit `children: undefined` would override the message UI SDK
      // renders from the browser, so only pass children when we have content.
      {...(shown != null ? { children: shown } : null)}
    />
  );
}

export {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldContent,
  FieldTitle,
};
