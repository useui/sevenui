"use client";

import { CheckIcon } from "lucide-react";

import { Label } from "@/registry/base/ui/label";
import { RadioGroup, RadioGroupItem } from "@/registry/base/ui/radio-group";

const languages = [
  { value: "en-US", native: "English", english: "United States" },
  { value: "de-DE", native: "Deutsch", english: "German" },
  { value: "es-ES", native: "Español", english: "Spanish" },
  { value: "ja-JP", native: "日本語", english: "Japanese" },
  { value: "pt-BR", native: "Português", english: "Portuguese, Brazil" },
];

export default function RadioGroup05() {
  return (
    <div className="flex w-full max-w-xs flex-col gap-2">
      <p
        id="radio-group-05-label"
        className="px-3 text-xs font-medium text-muted-foreground"
      >
        Interface language
      </p>
      <RadioGroup
        defaultValue="de-DE"
        aria-labelledby="radio-group-05-label"
        className="gap-0.5"
      >
        {languages.map((language) => (
          <Label
            key={language.value}
            lang={language.value}
            className="cursor-pointer justify-between gap-3 rounded-md px-3 py-2.5 font-normal transition-colors hover:bg-accent has-data-checked:bg-accent has-[:focus-visible]:bg-accent"
          >
            <span className="flex min-w-0 flex-col gap-1">
              <span className="font-medium">{language.native}</span>
              <span lang="en" className="text-xs text-muted-foreground">
                {language.english}
              </span>
            </span>
            {/* The stock dot is hidden; a check fades in on the sibling peer. */}
            <span className="relative flex size-5 shrink-0">
              <RadioGroupItem
                value={language.value}
                className="size-5 border-transparent bg-transparent shadow-none dark:bg-transparent [&_[data-slot=radio-group-indicator]]:hidden"
              />
              <CheckIcon
                aria-hidden="true"
                strokeWidth={2.5}
                className="pointer-events-none absolute inset-0 m-auto size-3 scale-50 text-primary-foreground opacity-0 transition-[opacity,scale] duration-200 ease-out peer-data-checked:scale-100 peer-data-checked:opacity-100 motion-reduce:transition-none"
              />
            </span>
          </Label>
        ))}
      </RadioGroup>
    </div>
  );
}
