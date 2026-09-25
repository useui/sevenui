"use client";

import * as React from "react";

import { Input } from "@/registry/base/ui/input";
import { Label } from "@/registry/base/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/registry/base/ui/native-select";

type Country = {
  code: string;
  name: string;
  regionLabel: string;
  postalLabel: string;
  postalPlaceholder: string;
  regions: string[];
};

const countries: Country[] = [
  {
    code: "US",
    name: "United States",
    regionLabel: "State",
    postalLabel: "ZIP code",
    postalPlaceholder: "94103",
    regions: ["California", "New York", "Texas", "Washington"],
  },
  {
    code: "CA",
    name: "Canada",
    regionLabel: "Province",
    postalLabel: "Postal code",
    postalPlaceholder: "M5V 2T6",
    regions: ["Alberta", "British Columbia", "Ontario", "Quebec"],
  },
  {
    code: "GB",
    name: "United Kingdom",
    regionLabel: "County",
    postalLabel: "Postcode",
    postalPlaceholder: "SW1A 1AA",
    regions: ["Greater London", "Greater Manchester", "Kent", "West Yorkshire"],
  },
  {
    code: "AU",
    name: "Australia",
    regionLabel: "State or territory",
    postalLabel: "Postcode",
    postalPlaceholder: "2000",
    regions: ["New South Wales", "Queensland", "Victoria", "Western Australia"],
  },
];

export default function NativeSelect09() {
  const [countryCode, setCountryCode] = React.useState("US");
  const [region, setRegion] = React.useState("");

  const country =
    countries.find((item) => item.code === countryCode) ?? countries[0];

  return (
    <form
      className="grid w-full max-w-sm gap-4"
      onSubmit={(event) => event.preventDefault()}
    >
      <div className="grid gap-1">
        <h3 className="text-base font-medium">Shipping address</h3>
        <p className="text-sm text-muted-foreground">
          Fields adapt to the country you ship to.
        </p>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="native-select-09-country">Country</Label>
        <NativeSelect
          id="native-select-09-country"
          className="w-full"
          autoComplete="country"
          value={countryCode}
          onChange={(event) => {
            setCountryCode(event.target.value);
            setRegion("");
          }}
        >
          {countries.map((item) => (
            <NativeSelectOption key={item.code} value={item.code}>
              {item.name}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="native-select-09-street">Street address</Label>
        <Input
          id="native-select-09-street"
          autoComplete="street-address"
          placeholder="500 Market Street, Suite 2"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="native-select-09-region">{country.regionLabel}</Label>
          <NativeSelect
            id="native-select-09-region"
            className="w-full"
            autoComplete="address-level1"
            required
            value={region}
            onChange={(event) => setRegion(event.target.value)}
          >
            <NativeSelectOption value="" disabled>
              Select {country.regionLabel.toLowerCase()}
            </NativeSelectOption>
            {country.regions.map((item) => (
              <NativeSelectOption key={item} value={item}>
                {item}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="native-select-09-postal">{country.postalLabel}</Label>
          <Input
            id="native-select-09-postal"
            autoComplete="postal-code"
            placeholder={country.postalPlaceholder}
          />
        </div>
      </div>
    </form>
  );
}
