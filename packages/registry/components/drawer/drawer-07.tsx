"use client";

import * as React from "react";
import { CreditCard, Plus } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/registry/base/ui/drawer";
import { Field, FieldGroup, FieldLabel } from "@/registry/base/ui/field";
import { Input } from "@/registry/base/ui/input";
import { Label } from "@/registry/base/ui/label";
import { RadioGroup, RadioGroupItem } from "@/registry/base/ui/radio-group";

type Card = {
  id: string;
  brand: string;
  last4: string;
  expires: string;
};

const initialCards: Card[] = [
  { id: "visa", brand: "Visa", last4: "4242", expires: "08/28" },
  { id: "mastercard", brand: "Mastercard", last4: "5100", expires: "02/27" },
];

export default function Drawer07() {
  const [cards, setCards] = React.useState(initialCards);
  const [selected, setSelected] = React.useState("visa");
  const [addOpen, setAddOpen] = React.useState(false);
  const [number, setNumber] = React.useState("");
  const [expiry, setExpiry] = React.useState("");

  const digits = number.replace(/\D/g, "");
  const canSave = digits.length >= 12 && /^\d{2}\/\d{2}$/.test(expiry);

  const addCard = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSave) return;
    const card: Card = {
      id: `card-${Date.now()}`,
      brand: digits.startsWith("4") ? "Visa" : "Card",
      last4: digits.slice(-4),
      expires: expiry,
    };
    setCards((prev) => [...prev, card]);
    setSelected(card.id);
    setNumber("");
    setExpiry("");
    setAddOpen(false);
  };

  const current = cards.find((card) => card.id === selected);

  return (
    <Drawer>
      <DrawerTrigger
        render={
          <Button variant="outline">
            <CreditCard aria-hidden="true" />
            {current ? `${current.brand} ·· ${current.last4}` : "Payment"}
          </Button>
        }
      />
      <DrawerContent>
        <div className="mx-auto flex w-full max-w-sm flex-col">
          <DrawerHeader>
            <DrawerTitle>Payment method</DrawerTitle>
            <DrawerDescription>
              Used for your Team plan, billed monthly.
            </DrawerDescription>
          </DrawerHeader>
          <div className="flex flex-col gap-2 p-4">
            <RadioGroup
              aria-label="Saved cards"
              value={selected}
              onValueChange={(value) => setSelected(String(value))}
              className="gap-2"
            >
              {cards.map((card) => (
                <Label
                  key={card.id}
                  htmlFor={`drawer-07-${card.id}`}
                  className="flex w-full cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50 has-focus-visible:border-ring has-focus-visible:ring-3 has-focus-visible:ring-ring/50 has-data-checked:border-primary/40 has-data-checked:bg-primary/5"
                >
                  <CreditCard
                    aria-hidden="true"
                    className="size-4 text-muted-foreground"
                  />
                  <span className="flex flex-1 flex-col gap-0.5">
                    <span className="font-medium">
                      {card.brand} ending in {card.last4}
                    </span>
                    <span className="text-xs font-normal text-muted-foreground">
                      Expires {card.expires}
                    </span>
                  </span>
                  <RadioGroupItem id={`drawer-07-${card.id}`} value={card.id} />
                </Label>
              ))}
            </RadioGroup>

            <Drawer open={addOpen} onOpenChange={setAddOpen}>
              <DrawerTrigger
                render={
                  <Button variant="ghost" className="justify-start">
                    <Plus aria-hidden="true" />
                    Add a new card
                  </Button>
                }
              />
              <DrawerContent>
                <form
                  onSubmit={addCard}
                  className="mx-auto flex w-full max-w-sm flex-col"
                >
                  <DrawerHeader>
                    <DrawerTitle>Add card</DrawerTitle>
                    <DrawerDescription>
                      You can remove it anytime from billing settings.
                    </DrawerDescription>
                  </DrawerHeader>
                  <FieldGroup className="p-4">
                    <Field>
                      <FieldLabel htmlFor="drawer-07-number">
                        Card number
                      </FieldLabel>
                      <Input
                        id="drawer-07-number"
                        inputMode="numeric"
                        autoComplete="cc-number"
                        placeholder="4242 4242 4242 4242"
                        value={number}
                        onChange={(event) => setNumber(event.target.value)}
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="drawer-07-expiry">
                        Expiry (MM/YY)
                      </FieldLabel>
                      <Input
                        id="drawer-07-expiry"
                        autoComplete="cc-exp"
                        placeholder="04/29"
                        maxLength={5}
                        value={expiry}
                        onChange={(event) => setExpiry(event.target.value)}
                      />
                    </Field>
                  </FieldGroup>
                  <DrawerFooter>
                    <Button type="submit" disabled={!canSave}>
                      Save card
                    </Button>
                    <DrawerClose
                      render={<Button variant="outline">Back</Button>}
                    />
                  </DrawerFooter>
                </form>
              </DrawerContent>
            </Drawer>
          </div>
          <DrawerFooter>
            <DrawerClose render={<Button>Use this card</Button>} />
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
