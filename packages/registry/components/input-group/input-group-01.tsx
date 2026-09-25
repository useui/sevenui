"use client";

import { useId } from "react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/registry/base/ui/input-group";
import { Label } from "@/registry/base/ui/label";

const fields = [
  {
    key: "seat-price",
    label: "Price per seat",
    prefix: "$",
    suffix: "USD / month",
    defaultValue: "12.00",
    inputMode: "decimal",
  },
  {
    key: "trial-length",
    label: "Free trial",
    prefix: null,
    suffix: "days",
    defaultValue: "14",
    inputMode: "numeric",
  },
  {
    key: "annual-discount",
    label: "Annual discount",
    prefix: null,
    suffix: "%",
    defaultValue: "20",
    inputMode: "numeric",
  },
] as const;

export default function InputGroup01() {
  const id = useId();

  return (
    <form
      className="flex w-full max-w-sm flex-col gap-5"
      onSubmit={(event) => event.preventDefault()}
    >
      {fields.map((field) => {
        const inputId = `${id}-${field.key}`;
        return (
          <div key={field.key} className="flex flex-col gap-2">
            <Label htmlFor={inputId}>{field.label}</Label>
            <InputGroup>
              {field.prefix ? (
                <InputGroupAddon>
                  <InputGroupText>{field.prefix}</InputGroupText>
                </InputGroupAddon>
              ) : null}
              <InputGroupInput
                id={inputId}
                inputMode={field.inputMode}
                defaultValue={field.defaultValue}
                className="tabular-nums"
              />
              <InputGroupAddon align="inline-end">
                <InputGroupText>{field.suffix}</InputGroupText>
              </InputGroupAddon>
            </InputGroup>
          </div>
        );
      })}
    </form>
  );
}
