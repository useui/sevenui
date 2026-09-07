"use client";

import * as React from "react";

import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/registry/base/ui/combobox";

const languages = [
  { value: "en", label: "English" },
  { value: "tr", label: "Turkish" },
  { value: "de", label: "German" },
  { value: "fr", label: "French" },
  { value: "es", label: "Spanish" },
  { value: "ja", label: "Japanese" },
];

type Language = (typeof languages)[number];

export default function ComboboxMultiple() {
  const anchor = useComboboxAnchor();

  return (
    <Combobox items={languages} multiple defaultValue={[languages[0]]}>
      <ComboboxChips ref={anchor} className="w-72">
        <ComboboxValue>
          {(value: Language[]) => (
            <React.Fragment>
              {value.map((language) => (
                <ComboboxChip key={language.value} aria-label={language.label}>
                  {language.label}
                </ComboboxChip>
              ))}
              <ComboboxChipsInput
                placeholder={value.length > 0 ? "" : "Select languages..."}
              />
            </React.Fragment>
          )}
        </ComboboxValue>
      </ComboboxChips>
      <ComboboxContent anchor={anchor}>
        <ComboboxEmpty>No languages found.</ComboboxEmpty>
        <ComboboxList>
          {(item: Language) => (
            <ComboboxItem key={item.value} value={item}>
              {item.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
