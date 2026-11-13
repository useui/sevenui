"use client";

import * as React from "react";
import {
  OTPInput as OTPInputPrimitive,
  OTPInputGroup as OTPInputGroupPrimitive,
  OTPInputSeparator as OTPInputSeparatorPrimitive,
  OTPInputSlot as OTPInputSlotPrimitive,
} from "@ui-sdk/react/otp-input";
import { type RenderProp, renderElement } from "@ui-sdk/react/primitive";
import { cn } from "cn";
import { MinusIcon } from "lucide-react";

type OTPInputPrimitiveProps = React.ComponentProps<typeof OTPInputPrimitive>;
type ChangeDetails = Parameters<
  NonNullable<OTPInputPrimitiveProps["onValueChange"]>
>[1];
type CommitDetails = Parameters<
  NonNullable<OTPInputPrimitiveProps["onValueCommit"]>
>[1];

// UI SDK's parts render their own `otp-input-*` slots; SevenUI's are
// `input-otp-*`. A data-slot on the element `render` returns wins.
function withSlot<State>(
  slot: string,
  tag: string,
  render?: RenderProp<State>,
): RenderProp<State> {
  return (props, state) =>
    renderElement(tag, { ...props, "data-slot": slot }, render, state);
}

// Base UI's validation types, as UI SDK patterns.
const patterns = {
  numeric: "digits",
  alpha: "letters",
  alphanumeric: "alphanumeric",
  none: /[\s\S]/,
} as const;

// Base UI numbers its slots by order; UI SDK needs each slot's `index`. The
// root reads the slots' order from the page after each render, and the first
// render (and the server's) falls back to the order the slots rendered in.
type SlotOrder = {
  indexOf: (key: string) => number;
  mask: boolean;
};
const SlotOrderContext = React.createContext<SlotOrder | null>(null);

type InputOTPProps = Omit<
  OTPInputPrimitiveProps,
  "maxLength" | "pattern" | "onValueCommit" | "className"
> & {
  className?: string;
  // Base UI names: `length` is UI SDK's `maxLength`, `validationType` its
  // `pattern`, and `onValueComplete` its `onValueCommit`.
  length: number;
  validationType?: keyof typeof patterns;
  onValueComplete?: (value: string, details: CommitDetails) => void;
  // Base UI only, applied by the wrapper: a transform of every new value,
  // and drawing filled slots as dots.
  normalizeValue?: (value: string) => string;
  mask?: boolean;
  // Base UI only, accepted and not mapped.
  onValueInvalid?: (value: string, details: ChangeDetails) => void;
  autoSubmit?: boolean;
};

// Sets a caller's ref beside the wrapper's own, which a spread `ref` would
// otherwise replace.
function useMergedRef<T>(own: React.RefObject<T | null>, ref: React.Ref<T> | undefined) {
  return React.useCallback(
    (node: T | null) => {
      own.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [own, ref],
  );
}

function InputOTP({
  className,
  length,
  validationType = "numeric",
  onValueComplete,
  normalizeValue,
  mask = false,
  onValueInvalid: _onValueInvalid,
  autoSubmit: _autoSubmit,
  value,
  defaultValue,
  onValueChange,
  render,
  ref,
  ...props
}: InputOTPProps) {
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const mergedRef = useMergedRef(rootRef, ref);
  const fallback = React.useRef(new Map<string, number>());
  const [order, setOrder] = React.useState<string[]>([]);

  React.useLayoutEffect(() => {
    const keys = Array.from(
      rootRef.current?.querySelectorAll<HTMLElement>("[data-otp-key]") ?? [],
      (slot) => slot.dataset.otpKey ?? "",
    );
    setOrder((current) =>
      current.length === keys.length &&
      current.every((key, index) => key === keys[index])
        ? current
        : keys,
    );
  });

  const slotOrder = React.useMemo<SlotOrder>(
    () => ({
      mask,
      indexOf: (key) => {
        const placed = order.indexOf(key);
        if (placed !== -1) return placed;
        if (!fallback.current.has(key)) {
          fallback.current.set(key, fallback.current.size);
        }
        return fallback.current.get(key) ?? 0;
      },
    }),
    [order, mask],
  );

  // Base UI renders masked slots as password inputs. UI SDK's one native
  // input has no type option and React writes its type="text" back on every
  // update, so while masked an observer turns it back into a password input
  // before the next paint: screen readers do not read the code out and
  // browsers do not offer to save it.
  React.useLayoutEffect(() => {
    const input = rootRef.current?.querySelector<HTMLInputElement>(
      "input:not([type=hidden])",
    );
    if (!input || !mask) return;
    const previous = input.type;
    const conceal = () => {
      if (input.type !== "password") input.type = "password";
    };
    conceal();
    const observer = new MutationObserver(conceal);
    observer.observe(input, { attributes: true, attributeFilter: ["type"] });
    return () => {
      observer.disconnect();
      input.type = previous;
    };
  }, [mask]);

  // A normalised value has to be held here, so it is what the slots show.
  const [inner, setInner] = React.useState(defaultValue ?? "");
  const normalized = normalizeValue
    ? {
        value: value ?? inner,
        onValueChange: (next: string, details: ChangeDetails) => {
          const result = normalizeValue(next);
          if (value === undefined) setInner(result);
          onValueChange?.(result, details);
        },
      }
    : { value, defaultValue, onValueChange };

  return (
    <SlotOrderContext.Provider value={slotOrder}>
      <OTPInputPrimitive
        ref={mergedRef}
        render={withSlot("input-otp", "div", render)}
        maxLength={length}
        pattern={patterns[validationType]}
        onValueCommit={
          onValueComplete &&
          ((next, details) =>
            onValueComplete(normalizeValue ? normalizeValue(next) : next, details))
        }
        className={cn(
          "cn-input-otp flex items-center has-disabled:opacity-50",
          // UI SDK keeps the native input disabled inside the root, where
          // has-disabled finds it; data-disabled covers the slots' look.
          "data-disabled:opacity-50",
          className,
        )}
        {...normalized}
        {...props}
      />
    </SlotOrderContext.Provider>
  );
}

function InputOTPGroup({
  className,
  ...props
}: Omit<React.ComponentProps<typeof OTPInputGroupPrimitive>, "className"> & {
  className?: string;
}) {
  return (
    <OTPInputGroupPrimitive
      render={withSlot("input-otp-group", "div")}
      className={cn(
        "flex items-center rounded-lg has-aria-invalid:border-destructive has-aria-invalid:ring-3 has-aria-invalid:ring-destructive/20 dark:has-aria-invalid:ring-destructive/40",
        className,
      )}
      {...props}
    />
  );
}

type OTPInputSlotPrimitiveProps = React.ComponentProps<
  typeof OTPInputSlotPrimitive
>;

function InputOTPSlot({
  className,
  index,
  render,
  children,
  ...props
}: Omit<OTPInputSlotPrimitiveProps, "index" | "className" | "children"> & {
  className?: string;
  // UI SDK numbers slots explicitly; without it, the order on the page does.
  index?: number;
  children?: OTPInputSlotPrimitiveProps["children"];
}) {
  const key = React.useId();
  const order = React.useContext(SlotOrderContext);
  const slotIndex = index ?? order?.indexOf(key) ?? 0;

  return (
    <OTPInputSlotPrimitive
      index={slotIndex}
      data-otp-key={key}
      render={withSlot("input-otp-slot", "div", render)}
      className={cn(
        "relative size-[var(--control-h,2.125rem)] border-y border-r border-input text-center text-[length:var(--control-text,0.8125rem)] tabular-nums caret-foreground transition-[border-color,box-shadow] duration-150 outline-none motion-reduce:transition-none first:rounded-l-lg first:border-l last:rounded-r-lg aria-invalid:border-destructive focus:z-10 focus:border-ring focus:ring-3 focus:ring-ring/50 focus:aria-invalid:border-destructive focus:aria-invalid:ring-destructive/20 dark:bg-input/30 dark:focus:aria-invalid:ring-destructive/40",
        // A slot is a box that shows one character of a single native input,
        // so the focus look follows the active slot, not :focus.
        "flex items-center justify-center data-active:z-10 data-active:border-ring data-active:ring-3 data-active:ring-ring/50 data-active:aria-invalid:border-destructive data-active:aria-invalid:ring-destructive/20 dark:data-active:aria-invalid:ring-destructive/40",
        className,
      )}
      {...props}
    >
      {children ??
        ((state) => (
          <>
            {state.char !== null && (order?.mask ? "•" : state.char)}
            {state.hasFakeCaret && (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 flex items-center justify-center"
              >
                <span className="h-[1em] w-px animate-pulse bg-foreground motion-reduce:animate-none" />
              </span>
            )}
          </>
        ))}
    </OTPInputSlotPrimitive>
  );
}

function InputOTPSeparator({
  className,
  ...props
}: Omit<
  React.ComponentProps<typeof OTPInputSeparatorPrimitive>,
  "className"
> & {
  className?: string;
}) {
  return (
    <OTPInputSeparatorPrimitive
      render={withSlot("input-otp-separator", "div")}
      className={cn(
        "flex items-center px-0.5 text-muted-foreground [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      <MinusIcon />
    </OTPInputSeparatorPrimitive>
  );
}

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator };
