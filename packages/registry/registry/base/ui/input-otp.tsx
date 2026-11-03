"use client";

import * as React from "react";
import { OTPField as OTPFieldPrimitive } from "@base-ui/react/otp-field";
import { cn } from "cn";
import { MinusIcon } from "lucide-react";

function InputOTP({
  className,
  ...props
}: React.ComponentProps<typeof OTPFieldPrimitive.Root>) {
  return (
    <OTPFieldPrimitive.Root
      data-slot="input-otp"
      className={cn(
        "cn-input-otp flex items-center gap-1.5 has-disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

function InputOTPGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-otp-group"
      className={cn(
        "flex items-center gap-1.5",
        className,
      )}
      {...props}
    />
  );
}

function InputOTPSlot({
  className,
  ...props
}: React.ComponentProps<typeof OTPFieldPrimitive.Input>) {
  return (
    <OTPFieldPrimitive.Input
      data-slot="input-otp-slot"
      className={cn(
        "relative size-[var(--control-h,2.125rem)] rounded-lg bg-surface-inset text-center text-[length:var(--control-text,0.8125rem)] text-foreground tabular-nums caret-foreground border border-hairline-strong shadow-[0_0_#0000,var(--elevation-inset,0_0_#0000)] transition-[border-color,box-shadow] duration-150 outline-none motion-reduce:transition-none",
        "focus:z-10 focus-visible:focus-ring",
        "aria-invalid:border-destructive/60 aria-invalid:[--focus-color:var(--destructive)]",
        className,
      )}
      {...props}
    />
  );
}

function InputOTPSeparator({
  className,
  ...props
}: React.ComponentProps<typeof OTPFieldPrimitive.Separator>) {
  return (
    <OTPFieldPrimitive.Separator
      data-slot="input-otp-separator"
      className={cn(
        "flex items-center px-0.5 text-muted-foreground [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      <MinusIcon />
    </OTPFieldPrimitive.Separator>
  );
}

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator };
