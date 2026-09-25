"use client";

import * as React from "react";
import { CircleCheckIcon, LockIcon } from "lucide-react";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/registry/base/ui/combobox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/registry/base/ui/field";
import { InputGroupAddon } from "@/registry/base/ui/input-group";

type Option = { value: string; label: string };

const warehouses: Option[] = [
  { value: "rtm", label: "Rotterdam fulfillment center" },
  { value: "lej", label: "Leipzig cross-dock" },
  { value: "mad", label: "Madrid returns hub" },
];

const currencies: Option[] = [
  { value: "eur", label: "EUR — Euro" },
  { value: "usd", label: "USD — US Dollar" },
];

const carriers: Option[] = [
  { value: "dhl", label: "DHL Express" },
  { value: "ups", label: "UPS Standard" },
];

const regions: Option[] = [
  { value: "benelux", label: "Benelux" },
  { value: "dach", label: "DACH" },
  { value: "iberia", label: "Iberia" },
  { value: "nordics", label: "Nordics" },
];

function OptionList({ empty }: { empty: string }) {
  return (
    <ComboboxContent>
      <ComboboxEmpty>{empty}</ComboboxEmpty>
      <ComboboxList>
        {(item: Option) => (
          <ComboboxItem key={item.value} value={item}>
            {item.label}
          </ComboboxItem>
        )}
      </ComboboxList>
    </ComboboxContent>
  );
}

export default function Combobox02() {
  const [region, setRegion] = React.useState<Option | null>(null);
  const regionMissing = region === null;

  return (
    <FieldGroup className="w-full max-w-xs gap-5">
      <Field>
        <FieldLabel htmlFor="combobox-02-warehouse">Ship from</FieldLabel>
        <Combobox items={warehouses} defaultValue={warehouses[0]}>
          <ComboboxInput id="combobox-02-warehouse" className="w-full">
            <InputGroupAddon align="inline-start">
              <CircleCheckIcon aria-hidden="true" className="text-success" />
            </InputGroupAddon>
          </ComboboxInput>
          <OptionList empty="No warehouse found." />
        </Combobox>
        <FieldDescription>Stock verified 4 minutes ago.</FieldDescription>
      </Field>

      <Field>
        <FieldLabel htmlFor="combobox-02-currency">Billing currency</FieldLabel>
        <Combobox items={currencies} defaultValue={currencies[0]} readOnly>
          <ComboboxInput
            id="combobox-02-currency"
            className="w-full bg-muted/40"
            showTrigger={false}
          >
            <InputGroupAddon align="inline-end">
              <LockIcon aria-hidden="true" />
            </InputGroupAddon>
          </ComboboxInput>
          <OptionList empty="No currency found." />
        </Combobox>
        <FieldDescription>Set by your workspace plan.</FieldDescription>
      </Field>

      <Field disabled>
        <FieldLabel htmlFor="combobox-02-carrier">Carrier</FieldLabel>
        <Combobox items={carriers} disabled>
          <ComboboxInput
            id="combobox-02-carrier"
            placeholder="Choose a carrier"
            className="w-full"
            disabled
          />
          <OptionList empty="No carrier found." />
        </Combobox>
        <FieldDescription>Available after you add a return address.</FieldDescription>
      </Field>

      <Field invalid={regionMissing}>
        <FieldLabel htmlFor="combobox-02-region">Sales region</FieldLabel>
        <Combobox items={regions} value={region} onValueChange={setRegion}>
          <ComboboxInput
            id="combobox-02-region"
            placeholder="Choose a region"
            className="w-full [&_[data-slot=input-group-button]]:border-transparent [&_[data-slot=input-group-button]]:ring-0"
            aria-invalid={regionMissing || undefined}
          />
          <OptionList empty="No region found." />
        </Combobox>
        {regionMissing ? (
          <FieldError match>Select a region so we can calculate VAT.</FieldError>
        ) : (
          <FieldDescription>VAT is calculated for {region.label}.</FieldDescription>
        )}
      </Field>
    </FieldGroup>
  );
}
