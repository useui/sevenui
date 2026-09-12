"use client";

import {
  NativeSelect,
  NativeSelectOptGroup,
  NativeSelectOption,
} from "@/registry/base/ui/native-select";

export default function NativeSelectGroups() {
  return (
    <NativeSelect defaultValue="button" aria-label="Component">
      <NativeSelectOptGroup label="Form">
        <NativeSelectOption value="button">Button</NativeSelectOption>
        <NativeSelectOption value="input">Input</NativeSelectOption>
        <NativeSelectOption value="checkbox">Checkbox</NativeSelectOption>
      </NativeSelectOptGroup>
      <NativeSelectOptGroup label="Overlay">
        <NativeSelectOption value="dialog">Dialog</NativeSelectOption>
        <NativeSelectOption value="popover">Popover</NativeSelectOption>
        <NativeSelectOption value="tooltip" disabled>
          Tooltip (soon)
        </NativeSelectOption>
      </NativeSelectOptGroup>
    </NativeSelect>
  );
}
