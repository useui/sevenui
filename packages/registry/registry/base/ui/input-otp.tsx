"use client";

import * as React from "react";
import { OTPField as OTPFieldPrimitive } from "@base-ui/react/otp-field";

import { cn } from "@/registry/base/lib/utils";

function InputOTP({
  className,
  ...props
}: React.ComponentProps<typeof OTPFieldPrimitive.Root>) {
  return (
    <OTPFieldPrimitive.Root
      className={cn(
        "flex items-center gap-2 has-[:disabled]:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

function InputOTPGroup({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex items-center", className)} {...props} />;
}

function InputOTPSlot({
  className,
  ...props
}: React.ComponentProps<typeof OTPFieldPrimitive.Input>) {
  return (
    <OTPFieldPrimitive.Input
      className={cn(
        "relative size-9 border-y border-r border-input text-center text-sm shadow-xs transition-shadow outline-none first:rounded-l-md first:border-l last:rounded-r-md focus:z-10 focus:ring-2 focus:ring-ring/50 data-[invalid]:border-destructive",
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
      className={cn("text-muted-foreground", className)}
      {...props}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="size-4"
      >
        <path d="M5 12h14" />
      </svg>
    </OTPFieldPrimitive.Separator>
  );
}

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator };
