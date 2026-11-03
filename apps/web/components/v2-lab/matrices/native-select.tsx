"use client";

import {
  NativeSelect,
  NativeSelectOptGroup,
  NativeSelectOption,
} from "@/registry/base/ui/native-select";
import { LabSection } from "../lab-frame";

const SIZES = ["default", "sm"] as const;

function Options() {
  return (
    <>
      <NativeSelectOption value="">Select a fruit</NativeSelectOption>
      <NativeSelectOptGroup label="Fruits">
        <NativeSelectOption value="apple">Apple</NativeSelectOption>
        <NativeSelectOption value="banana">Banana</NativeSelectOption>
      </NativeSelectOptGroup>
      <NativeSelectOption value="long">A very long option label that should not overlap the chevron</NativeSelectOption>
    </>
  );
}

export default function NativeSelectMatrix() {
  return (
    <div>
      {SIZES.map((size) => (
        <LabSection key={size} title={`size=${size}`}>
          <NativeSelect size={size} aria-label="placeholder">
            <Options />
          </NativeSelect>
          <NativeSelect size={size} aria-label="selected" defaultValue="apple">
            <Options />
          </NativeSelect>
          <NativeSelect size={size} aria-label="disabled" disabled defaultValue="banana">
            <Options />
          </NativeSelect>
          <NativeSelect size={size} aria-label="invalid" aria-invalid defaultValue="apple">
            <Options />
          </NativeSelect>
          <NativeSelect size={size} aria-label="long" defaultValue="long" className="w-48">
            <Options />
          </NativeSelect>
        </LabSection>
      ))}
    </div>
  );
}
