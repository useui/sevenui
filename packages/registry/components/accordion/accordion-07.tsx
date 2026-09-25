"use client";

import {
  CheckIcon,
  FingerprintIcon,
  KeyRoundIcon,
  LaptopIcon,
  SmartphoneIcon,
} from "lucide-react";
import * as React from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/registry/base/ui/accordion";
import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";

const options = [
  {
    value: "authenticator",
    icon: SmartphoneIcon,
    title: "Authenticator app",
    summary: "Codes from 1Password, Authy, or Google Authenticator",
    body: "Scan a QR code once and enter a six-digit code each time you sign in from a new device. Works offline.",
    action: "Set up app",
  },
  {
    value: "passkey",
    icon: FingerprintIcon,
    title: "Passkey",
    summary: "Face ID, Touch ID, or Windows Hello",
    body: "Sign in with the biometric lock already on your device. Passkeys can't be phished and sync through your platform keychain.",
    action: "Add passkey",
  },
  {
    value: "security-key",
    icon: KeyRoundIcon,
    title: "Hardware security key",
    summary: "YubiKey or any FIDO2 key",
    body: "Plug in or tap your key when prompted. Register a second key as a backup in case the first one is lost.",
    action: "Register key",
  },
  {
    value: "trusted-device",
    icon: LaptopIcon,
    title: "Trusted device",
    summary: "Skip checks on this browser for 30 days",
    body: "We still ask for a second factor on unfamiliar networks or when you change your password.",
    action: "Trust this browser",
  },
];

export default function Accordion07() {
  const [enabled, setEnabled] = React.useState<string[]>([]);

  function toggle(value: string) {
    setEnabled((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  }

  return (
    <Accordion
      defaultValue={["passkey"]}
      className="w-full max-w-md gap-1.5 rounded-2xl bg-muted/60 p-1.5"
    >
      {options.map((option) => {
        const isOn = enabled.includes(option.value);
        return (
        <AccordionItem
          key={option.value}
          value={option.value}
          className="rounded-xl not-last:border-b-0 transition-[background-color,box-shadow] duration-200 data-open:bg-card data-open:shadow-sm data-open:ring-1 data-open:ring-foreground/10"
        >
          <AccordionTrigger className="items-center gap-3 px-3 py-3 hover:no-underline">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-background ring-1 ring-foreground/10 group-aria-expanded/accordion-trigger:bg-primary group-aria-expanded/accordion-trigger:text-primary-foreground group-aria-expanded/accordion-trigger:ring-0">
              <option.icon className="size-4" aria-hidden="true" />
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="flex items-center gap-2">
                {option.title}
                {isOn ? (
                  <Badge variant="secondary">
                    <CheckIcon aria-hidden="true" data-icon="inline-start" />
                    On
                  </Badge>
                ) : null}
              </span>
              <span className="text-xs font-normal text-muted-foreground">
                {option.summary}
              </span>
            </span>
          </AccordionTrigger>
          <AccordionContent className="flex flex-col items-start gap-3 px-3 pb-3 pl-14 text-muted-foreground">
            <div>{option.body}</div>
            <Button
              size="sm"
              variant={isOn ? "outline" : "default"}
              onClick={() => toggle(option.value)}
            >
              {isOn ? "Turn off" : option.action}
              {isOn ? <span className="sr-only"> {option.title}</span> : null}
            </Button>
          </AccordionContent>
        </AccordionItem>
        );
      })}
    </Accordion>
  );
}
