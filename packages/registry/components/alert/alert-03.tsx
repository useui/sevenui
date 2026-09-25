"use client";

import { ShieldAlertIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/registry/base/ui/alert";

const emphasis = [
  {
    label: "Filled",
    className: "border-primary bg-primary text-primary-foreground",
    descriptionClassName: "text-primary-foreground/80",
  },
  {
    label: "Subtle",
    className: "border-transparent bg-muted",
    descriptionClassName: "",
  },
  {
    label: "Outline",
    className: "bg-transparent",
    descriptionClassName: "",
  },
  {
    label: "Ghost",
    className: "border-transparent bg-transparent px-0",
    descriptionClassName: "",
  },
];

export default function Alert03() {
  return (
    <div className="grid w-full max-w-md gap-5">
      {emphasis.map((item) => (
        <div key={item.label} className="grid gap-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            {item.label}
          </span>
          <Alert className={item.className}>
            <ShieldAlertIcon aria-hidden="true" />
            <AlertTitle>Two-factor authentication is off</AlertTitle>
            <AlertDescription className={item.descriptionClassName}>
              Protect your workspace with an authenticator app or security key.
            </AlertDescription>
          </Alert>
        </div>
      ))}
    </div>
  );
}
