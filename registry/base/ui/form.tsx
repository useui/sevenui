"use client";

import * as React from "react";
import { Form as FormPrimitive } from "@base-ui/react/form";

import { cn } from "@/registry/base/lib/utils";

function Form({
  className,
  ...props
}: React.ComponentProps<typeof FormPrimitive>) {
  return <FormPrimitive className={cn("grid gap-4", className)} {...props} />;
}

export { Form };
