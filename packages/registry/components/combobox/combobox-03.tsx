"use client";

import { LanguagesIcon } from "lucide-react";

import { Badge } from "@/registry/base/ui/badge";
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
  FieldLabel,
} from "@/registry/base/ui/field";
import { InputGroupAddon } from "@/registry/base/ui/input-group";

const languages = [
  { value: "en", native: "English", english: "English", beta: false },
  { value: "de", native: "Deutsch", english: "German", beta: false },
  { value: "es", native: "Español", english: "Spanish", beta: false },
  { value: "fr", native: "Français", english: "French", beta: false },
  { value: "ja", native: "日本語", english: "Japanese", beta: false },
  { value: "pt-BR", native: "Português (Brasil)", english: "Portuguese", beta: false },
  { value: "tr", native: "Türkçe", english: "Turkish", beta: true },
  { value: "ko", native: "한국어", english: "Korean", beta: true },
  { value: "uk", native: "Українська", english: "Ukrainian", beta: true },
];

type Language = (typeof languages)[number];

// Match the native name and the English name, so "german" finds Deutsch.
function matchesLanguage(item: Language, query: string) {
  const needle = query.trim().toLowerCase();
  return (
    item.native.toLowerCase().includes(needle) ||
    item.english.toLowerCase().includes(needle) ||
    item.value.toLowerCase().startsWith(needle)
  );
}

export default function Combobox03() {
  return (
    <Field className="w-full max-w-xs">
      <FieldLabel htmlFor="combobox-03-language">Interface language</FieldLabel>
      <Combobox
        items={languages}
        defaultValue={languages[1]}
        itemToStringLabel={(item: Language) => item.native}
        filter={matchesLanguage}
      >
        <ComboboxInput
          id="combobox-03-language"
          placeholder="Search in any language"
          className="w-full"
        >
          <InputGroupAddon align="inline-start">
            <LanguagesIcon aria-hidden="true" />
          </InputGroupAddon>
        </ComboboxInput>
        <ComboboxContent>
          <ComboboxEmpty>We don't support that language yet.</ComboboxEmpty>
          <ComboboxList>
            {(item: Language) => (
              <ComboboxItem
                key={item.value}
                value={item}
                lang={item.value}
                className="py-1.5"
              >
                <span className="grid min-w-0 flex-1 leading-tight">
                  <span className="truncate font-medium">{item.native}</span>
                  {item.native !== item.english ? (
                    <span lang="en" className="truncate text-xs text-muted-foreground">
                      {item.english}
                    </span>
                  ) : null}
                </span>
                {item.beta ? (
                  <Badge variant="outline" className="shrink-0">
                    Beta
                  </Badge>
                ) : null}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      <FieldDescription>
        Beta translations may still show some English.
      </FieldDescription>
    </Field>
  );
}
