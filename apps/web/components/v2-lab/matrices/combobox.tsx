"use client";

import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxSeparator,
  ComboboxValue,
  useComboboxAnchor,
} from "@/registry/base/ui/combobox";
import { LabSection } from "../lab-frame";

const FRUITS = ["Apple", "Banana", "Cherry", "Grape", "Mango", "Orange"];

function Popup() {
  return (
    <ComboboxContent>
      <ComboboxEmpty>No fruit found.</ComboboxEmpty>
      <ComboboxList>
        {(item: string) => (
          <ComboboxItem key={item} value={item}>
            {item}
          </ComboboxItem>
        )}
      </ComboboxList>
    </ComboboxContent>
  );
}

function Basic(props: {
  defaultValue?: string | null;
  disabled?: boolean;
  invalid?: boolean;
  showClear?: boolean;
}) {
  return (
    <Combobox items={FRUITS} defaultValue={props.defaultValue ?? null}>
      <ComboboxInput
        placeholder="Search fruit"
        className="w-48"
        disabled={props.disabled}
        aria-invalid={props.invalid || undefined}
        showClear={props.showClear}
      />
      <Popup />
    </Combobox>
  );
}

function Chips() {
  const anchor = useComboboxAnchor();
  return (
    <Combobox items={FRUITS} multiple defaultValue={["Apple", "Cherry"]}>
      <ComboboxChips ref={anchor} className="w-64">
        <ComboboxValue>
          {(values: string[]) =>
            values.map((value) => <ComboboxChip key={value}>{value}</ComboboxChip>)
          }
        </ComboboxValue>
        <ComboboxChipsInput placeholder="Add fruit" />
      </ComboboxChips>
      <ComboboxContent anchor={anchor}>
        <ComboboxEmpty>No fruit found.</ComboboxEmpty>
        <ComboboxList>
          {(item: string) => (
            <ComboboxItem key={item} value={item}>
              {item}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

function Grouped() {
  return (
    <Combobox items={FRUITS} defaultValue="Cherry">
      <ComboboxInput placeholder="Grouped" className="w-48" />
      <ComboboxContent>
        <ComboboxList>
          <ComboboxGroup>
            <ComboboxLabel>Fruit</ComboboxLabel>
            {FRUITS.slice(0, 3).map((item) => (
              <ComboboxItem key={item} value={item}>
                {item}
              </ComboboxItem>
            ))}
          </ComboboxGroup>
          <ComboboxSeparator />
          <ComboboxGroup>
            <ComboboxLabel>More</ComboboxLabel>
            {FRUITS.slice(3).map((item) => (
              <ComboboxItem key={item} value={item} disabled={item === "Orange"}>
                {item}
              </ComboboxItem>
            ))}
          </ComboboxGroup>
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

export default function ComboboxMatrix() {
  return (
    <div>
      <p className="text-muted-foreground mb-4 text-xs">
        The popup portals to the document body, so it takes the page theme and
        density, not the cell&apos;s. Open it from a cell to inspect items,
        highlight and the brand check.
      </p>
      <LabSection title="input">
        <Basic />
        <Basic defaultValue="Cherry" />
        <Basic defaultValue="Banana" showClear />
      </LabSection>
      <LabSection title="states">
        <Basic disabled />
        <Basic invalid />
      </LabSection>
      <LabSection title="chips (multiple)">
        <Chips />
      </LabSection>
      <LabSection title="grouped + separator + disabled item">
        <Grouped />
      </LabSection>
    </div>
  );
}
