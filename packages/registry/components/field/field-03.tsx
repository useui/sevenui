"use client";

import { CircleAlertIcon, CircleCheckIcon, LockIcon } from "lucide-react";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/registry/base/ui/field";
import { Input } from "@/registry/base/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/registry/base/ui/input-group";

export default function Field03() {
  return (
    <div className="grid w-full max-w-2xl gap-x-6 gap-y-7 sm:grid-cols-2">
      <Field name="teamName">
        <FieldLabel>Team name</FieldLabel>
        <Input placeholder="Growth squad" />
        <FieldDescription>Ready for input.</FieldDescription>
      </Field>

      <Field name="accountId">
        <FieldLabel>Account ID</FieldLabel>
        <InputGroup className="bg-muted/50 dark:bg-muted/30">
          <InputGroupInput readOnly defaultValue="acct_9F2kQ71xLm" />
          <InputGroupAddon align="inline-end">
            <LockIcon aria-hidden="true" />
          </InputGroupAddon>
        </InputGroup>
        <FieldDescription>
          Read-only. You can select and copy it.
        </FieldDescription>
      </Field>

      <Field name="billingEmail" disabled>
        <FieldLabel>Billing email</FieldLabel>
        <Input type="email" defaultValue="finance@orbital.io" />
        <FieldDescription>
          Managed by your organization's admin.
        </FieldDescription>
      </Field>

      <Field name="subdomain" invalid>
        <FieldLabel>Subdomain</FieldLabel>
        <InputGroup>
          <InputGroupInput defaultValue="orbital app" />
          <InputGroupAddon align="inline-end">
            <CircleAlertIcon aria-hidden="true" className="text-destructive" />
          </InputGroupAddon>
        </InputGroup>
        <FieldError>
          Use lowercase letters, numbers, and hyphens only.
        </FieldError>
      </Field>

      <Field name="vatNumber" className="sm:col-span-2">
        <FieldLabel>VAT number</FieldLabel>
        <InputGroup className="border-success/60 has-[[data-slot=input-group-control]:focus-visible]:border-success has-[[data-slot=input-group-control]:focus-visible]:ring-success/25">
          <InputGroupInput defaultValue="DE 811 907 980" />
          <InputGroupAddon align="inline-end">
            <CircleCheckIcon aria-hidden="true" className="text-success" />
          </InputGroupAddon>
        </InputGroup>
        <FieldDescription>
          <span className="font-medium text-success">Verified.</span> Matches
          the EU VIES registry for Orbital GmbH.
        </FieldDescription>
      </Field>
    </div>
  );
}
