"use client";

import { useId, useState } from "react";
import { CheckIcon, ShoppingBagIcon } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/registry/base/ui/field";
import {
  NumberField,
  NumberFieldDecrement,
  NumberFieldGroup,
  NumberFieldIncrement,
  NumberFieldInput,
} from "@/registry/base/ui/number-field";
import { RadioGroup, RadioGroupItem } from "@/registry/base/ui/radio-group";
import { Switch } from "@/registry/base/ui/switch";
import { Textarea } from "@/registry/base/ui/textarea";

const sizes = [
  { value: "xs", label: "XS", stock: 4, chest: "34–36 in" },
  { value: "s", label: "S", stock: 12, chest: "36–38 in" },
  { value: "m", label: "M", stock: 2, chest: "38–40 in" },
  { value: "l", label: "L", stock: 0, chest: "40–42 in" },
  { value: "xl", label: "XL", stock: 7, chest: "42–44 in" },
];

const unitPrice = 68;
const giftNoteLimit = 140;

export default function Field12() {
  const noteId = useId();
  const guideId = useId();
  const [showGuide, setShowGuide] = useState(false);
  const [added, setAdded] = useState<string | null>(null);
  const [size, setSize] = useState("m");
  const [quantity, setQuantity] = useState<number | null>(1);
  const [isGift, setIsGift] = useState(false);
  const [note, setNote] = useState("");
  const selected = sizes.find((item) => item.value === size);
  const maxQuantity = Math.max(selected?.stock ?? 1, 1);
  const count = Math.min(quantity ?? 1, maxQuantity);
  const total = count * unitPrice + (isGift ? 5 : 0);

  return (
    <form
      className="flex w-full max-w-sm flex-col gap-5"
      onSubmit={(event) => {
        event.preventDefault();
        setAdded(`${count} × ${selected?.label ?? ""}`);
      }}
      onChange={() => setAdded(null)}
    >
      <div className="flex gap-4">
        <img
          src="/placeholder.svg"
          alt="Merino crewneck sweater in oat"
          className="size-20 shrink-0 rounded-lg bg-muted object-cover"
        />
        <div className="flex flex-col gap-1">
          <h3 className="font-semibold">Merino crewneck</h3>
          <p className="text-sm text-muted-foreground">Oat · Midweight knit</p>
          <p className="text-sm font-medium tabular-nums">${unitPrice}.00</p>
        </div>
      </div>

      <FieldGroup className="gap-5">
        <FieldSet>
          <div className="flex items-baseline justify-between gap-2">
            <FieldLegend variant="label" className="mb-0">
              Size
            </FieldLegend>
            <button
              type="button"
              aria-expanded={showGuide}
              aria-controls={guideId}
              onClick={() => setShowGuide((current) => !current)}
              className="text-xs text-muted-foreground underline underline-offset-4 outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            >
              {showGuide ? "Hide size guide" : "Size guide"}
            </button>
          </div>
          <RadioGroup
            value={size}
            onValueChange={(value) => {
              setSize(value as string);
              setAdded(null);
            }}
            className="grid grid-cols-5 gap-2"
          >
            {sizes.map((item) => (
              // biome-ignore lint/a11y/noLabelWithoutControl: the label wraps the Base UI radio control
              <label
                key={item.value}
                className="relative flex h-10 cursor-pointer items-center justify-center rounded-lg border border-input text-sm font-medium transition-colors hover:bg-muted has-data-checked:border-primary has-data-checked:bg-primary has-data-checked:text-primary-foreground has-data-disabled:cursor-not-allowed has-data-disabled:text-muted-foreground has-data-disabled:line-through has-data-disabled:hover:bg-transparent has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50"
              >
                <RadioGroupItem
                  value={item.value}
                  disabled={item.stock === 0}
                  className="absolute opacity-0"
                />
                {item.label}
              </label>
            ))}
          </RadioGroup>
          {showGuide ? (
            <dl
              id={guideId}
              className="grid grid-cols-5 gap-2 rounded-lg bg-muted/50 px-2 py-2.5 text-center text-xs"
            >
              {sizes.map((item) => (
                <div key={item.value} className="flex flex-col gap-0.5">
                  <dt className="font-medium text-foreground">{item.label}</dt>
                  <dd className="text-muted-foreground tabular-nums">
                    {item.chest}
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}
          <p aria-live="polite" className="text-sm text-muted-foreground">
            {selected && selected.stock <= 3
              ? `Only ${selected.stock} left in ${selected.label}. Fits true to size.`
              : "Fits true to size. Size L restocks October 6."}
          </p>
        </FieldSet>

        <Field>
          <FieldLabel>Quantity</FieldLabel>
          <NumberField
            value={count}
            onValueChange={(value) => {
              setQuantity(value);
              setAdded(null);
            }}
            min={1}
            max={maxQuantity}
            className="w-32"
          >
            <NumberFieldGroup>
              <NumberFieldDecrement />
              <NumberFieldInput />
              <NumberFieldIncrement />
            </NumberFieldGroup>
          </NumberField>
        </Field>

        <Field orientation="horizontal">
          <FieldContent>
            <FieldLabel>This is a gift</FieldLabel>
            <FieldDescription>
              Wrapped in recycled paper with a handwritten card, +$5.
            </FieldDescription>
          </FieldContent>
          <Switch
            checked={isGift}
            onCheckedChange={(checked) => {
              setIsGift(checked);
              setAdded(null);
            }}
          />
        </Field>

        {isGift ? (
          <Field>
            <FieldLabel htmlFor={noteId}>Card message</FieldLabel>
            <Textarea
              id={noteId}
              rows={3}
              maxLength={giftNoteLimit}
              value={note}
              placeholder="Happy birthday, Sam. Stay cozy this winter."
              onChange={(event) => setNote(event.target.value)}
            />
            <FieldDescription className="tabular-nums">
              {giftNoteLimit - note.length} characters left
            </FieldDescription>
          </Field>
        ) : null}
      </FieldGroup>

      <div className="flex flex-col gap-2">
        <Button type="submit" size="lg" className="w-full">
          <ShoppingBagIcon aria-hidden="true" data-icon="inline-start" />
          Add to bag · <span className="tabular-nums">${total}.00</span>
        </Button>
        <p
          role="status"
          className="flex min-h-5 items-center justify-center gap-1.5 text-sm text-muted-foreground"
        >
          {added ? (
            <>
              <CheckIcon aria-hidden="true" className="size-4 text-success" />
              Added {added} to your bag
            </>
          ) : null}
        </p>
      </div>
    </form>
  );
}
