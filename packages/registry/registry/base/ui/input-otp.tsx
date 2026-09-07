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
        "cn-input-otp flex items-center has-disabled:opacity-50",
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
        "flex items-center rounded-lg has-aria-invalid:border-destructive has-aria-invalid:ring-3 has-aria-invalid:ring-destructive/20 dark:has-aria-invalid:ring-destructive/40",
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
        "relative size-8 border-y border-r border-input text-center text-sm transition-all outline-none first:rounded-l-lg first:border-l last:rounded-r-lg aria-invalid:border-destructive focus:z-10 focus:border-ring focus:ring-3 focus:ring-ring/50 focus:aria-invalid:border-destructive focus:aria-invalid:ring-destructive/20 dark:bg-input/30 dark:focus:aria-invalid:ring-destructive/40",
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
        "flex items-center [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      <MinusIcon />
    </OTPFieldPrimitive.Separator>
  );
}

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator };
