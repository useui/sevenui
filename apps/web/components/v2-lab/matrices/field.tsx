"use client";

import { Checkbox } from "@/registry/base/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from "@/registry/base/ui/field";
import { Input } from "@/registry/base/ui/input";
import { RadioGroup, RadioGroupItem } from "@/registry/base/ui/radio-group";
import { Switch } from "@/registry/base/ui/switch";
import { LabSection } from "../lab-frame";

export default function FieldMatrix() {
  return (
    <div>
      <LabSection title="orientation=vertical (default / description / invalid / disabled)">
        <div className="grid w-full gap-6 sm:grid-cols-2">
          <Field>
            <FieldLabel>Workspace name</FieldLabel>
            <Input placeholder="Acme Inc" />
          </Field>
          <Field>
            <FieldLabel>Email</FieldLabel>
            <Input type="email" placeholder="you@example.com" />
            <FieldDescription>We send order updates here.</FieldDescription>
          </Field>
          <Field invalid>
            <FieldLabel>Username</FieldLabel>
            <Input defaultValue="ab" aria-invalid />
            <FieldError>Must be at least 3 characters.</FieldError>
          </Field>
          <Field disabled>
            <FieldLabel>Plan</FieldLabel>
            <Input defaultValue="Pro" disabled />
            <FieldDescription>Managed by your admin.</FieldDescription>
          </Field>
        </div>
      </LabSection>

      <LabSection title="field rows: orientation=horizontal inside FieldGroup">
        <FieldGroup className="w-full max-w-md">
          <Field orientation="horizontal">
            <FieldContent>
              <FieldLabel htmlFor="lab-field-notify">Notifications</FieldLabel>
              <FieldDescription>Email me when a build fails.</FieldDescription>
            </FieldContent>
            <Switch id="lab-field-notify" defaultChecked />
          </Field>
          <Field orientation="horizontal">
            <FieldContent>
              <FieldLabel htmlFor="lab-field-digest">Weekly digest</FieldLabel>
              <FieldDescription>A summary every Monday.</FieldDescription>
            </FieldContent>
            <Switch id="lab-field-digest" />
          </Field>
          <Field orientation="horizontal" disabled>
            <FieldContent>
              <FieldLabel htmlFor="lab-field-beta">Beta features</FieldLabel>
              <FieldDescription>Not available on this plan.</FieldDescription>
            </FieldContent>
            <Switch id="lab-field-beta" disabled />
          </Field>
        </FieldGroup>
      </LabSection>

      <LabSection title="orientation=horizontal checkbox / orientation=responsive">
        <FieldGroup className="w-full max-w-md">
          <Field orientation="horizontal">
            <Checkbox id="lab-field-terms" defaultChecked />
            <FieldLabel htmlFor="lab-field-terms">Accept the terms</FieldLabel>
          </Field>
          <Field orientation="responsive">
            <FieldContent>
              <FieldLabel>Display name</FieldLabel>
              <FieldDescription>Shown on your profile.</FieldDescription>
            </FieldContent>
            <Input placeholder="Ada" />
          </Field>
        </FieldGroup>
      </LabSection>

      <LabSection title="FieldSet + legend + choice cards (checked / unchecked)">
        <FieldSet className="w-full max-w-md">
          <FieldLegend>Compute</FieldLegend>
          {/* Field parts (FieldLabel, FieldDescription) need a Field ancestor in
              Base UI, so each card sits in one and the set has no bare description. */}
          <RadioGroup defaultValue="standard">
            <Field>
              <FieldLabel htmlFor="lab-field-standard">
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldTitle>Standard</FieldTitle>
                    <FieldDescription>2 vCPU, 4 GB</FieldDescription>
                  </FieldContent>
                  <RadioGroupItem value="standard" id="lab-field-standard" />
                </Field>
              </FieldLabel>
            </Field>
            <Field>
              <FieldLabel htmlFor="lab-field-performance">
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldTitle>Performance</FieldTitle>
                    <FieldDescription>8 vCPU, 16 GB</FieldDescription>
                  </FieldContent>
                  <RadioGroupItem value="performance" id="lab-field-performance" />
                </Field>
              </FieldLabel>
            </Field>
          </RadioGroup>
        </FieldSet>
      </LabSection>

      <LabSection title="FieldSeparator (plain / with content) + multi-error">
        <div className="flex w-full max-w-md flex-col gap-6">
          <FieldSeparator />
          <FieldSeparator>Or continue with</FieldSeparator>
          <Field invalid>
            <FieldLabel>Password</FieldLabel>
            <Input type="password" defaultValue="abc" aria-invalid />
            <FieldError
              errors={[
                { message: "Must be at least 8 characters." },
                { message: "Must include a number." },
              ]}
            />
          </Field>
        </div>
      </LabSection>
    </div>
  );
}
