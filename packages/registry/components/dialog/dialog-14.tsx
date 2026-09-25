"use client";

import * as React from "react";
import { Check, ShoppingBag, Star, Truck } from "lucide-react";

import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/registry/base/ui/dialog";
import { Label } from "@/registry/base/ui/label";
import {
  NumberField,
  NumberFieldDecrement,
  NumberFieldGroup,
  NumberFieldIncrement,
  NumberFieldInput,
} from "@/registry/base/ui/number-field";
import { RadioGroup, RadioGroupItem } from "@/registry/base/ui/radio-group";
import { ToggleGroup, ToggleGroupItem } from "@/registry/base/ui/toggle-group";

const colors = [
  { value: "sand", label: "Sand", swatch: "bg-chart-2" },
  { value: "olive", label: "Olive", swatch: "bg-chart-3" },
  { value: "charcoal", label: "Charcoal", swatch: "bg-foreground" },
];

// Remaining stock per size; zero means sold out.
const sizes = [
  { value: "xs", label: "XS", stock: 4 },
  { value: "s", label: "S", stock: 12 },
  { value: "m", label: "M", stock: 2 },
  { value: "l", label: "L", stock: 0 },
  { value: "xl", label: "XL", stock: 7 },
];

const views = ["Front", "Back", "Detail"];

const product = {
  name: "Harbor Waxed Field Jacket",
  price: 189,
  compareAt: 240,
  rating: 4.7,
  reviews: 312,
};

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default function Dialog14() {
  const [open, setOpen] = React.useState(false);
  const [view, setView] = React.useState(views[0]);
  const [color, setColor] = React.useState("olive");
  const [size, setSize] = React.useState<string | null>(null);
  const [quantity, setQuantity] = React.useState(1);
  const [sizeError, setSizeError] = React.useState(false);
  const [cartCount, setCartCount] = React.useState(0);
  const [lastAdded, setLastAdded] = React.useState("");

  const sizeInfo = sizes.find((entry) => entry.value === size);
  const maxQuantity = sizeInfo ? Math.min(sizeInfo.stock, 5) : 5;
  const colorLabel = colors.find((entry) => entry.value === color)?.label;

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      setView(views[0]);
      setSize(null);
      setQuantity(1);
      setSizeError(false);
    }
  };

  const addToBag = () => {
    if (!sizeInfo) {
      setSizeError(true);
      return;
    }
    setCartCount((current) => current + quantity);
    setLastAdded(
      `${quantity} × ${product.name}, ${colorLabel}, size ${sizeInfo.label} added to your bag.`,
    );
    setOpen(false);
  };

  return (
    <div className="w-full max-w-64">
      <div className="mb-3 flex items-center justify-end">
        <span
          role="status"
          className="inline-flex items-center gap-1.5 rounded-full border bg-background px-2.5 py-1 text-xs"
        >
          <ShoppingBag aria-hidden="true" className="size-3.5" />
          <span className="tabular-nums">{cartCount}</span>
          <span className="sr-only">items in bag</span>
        </span>
      </div>

      <article className="group/product overflow-hidden rounded-xl border bg-card text-card-foreground">
        <div className="relative aspect-4/5 bg-muted">
          <img
            src="/placeholder.svg"
            alt=""
            className="size-full object-cover"
          />
          <Badge className="absolute top-2 left-2">−21%</Badge>
          <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger
              render={
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute inset-x-2 bottom-2 transition-opacity pointer-fine:opacity-0 pointer-fine:group-hover/product:opacity-100 pointer-fine:focus-visible:opacity-100"
                  aria-label={`Quick view ${product.name}`}
                >
                  Quick view
                </Button>
              }
            />
            <DialogContent className="max-h-[90vh] overflow-y-auto p-0 sm:max-w-3xl md:grid-cols-2 md:gap-0 [&>[data-slot=dialog-close]]:bg-background/80 [&>[data-slot=dialog-close]]:backdrop-blur-sm">
              <div className="flex flex-col gap-2 bg-muted/50 p-3">
                <div className="aspect-4/5 overflow-hidden rounded-lg bg-muted max-md:max-h-56 max-md:w-full">
                  <img
                    src="/placeholder.svg"
                    alt={`${product.name} in ${colorLabel}, ${view.toLowerCase()} view`}
                    className="size-full object-cover"
                  />
                </div>
                <ToggleGroup
                  aria-label="Product images"
                  spacing={1}
                  value={[view]}
                  onValueChange={(value) => value[0] && setView(value[0])}
                  className="grid w-full grid-cols-3"
                >
                  {views.map((entry) => (
                    <ToggleGroupItem
                      key={entry}
                      value={entry}
                      aria-label={`${entry} view`}
                      className="h-auto overflow-hidden p-0 ring-offset-2 ring-offset-background data-pressed:ring-2 data-pressed:ring-primary"
                    >
                      <img
                        src="/placeholder.svg"
                        alt=""
                        className="aspect-square w-full object-cover"
                      />
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>

              <div className="flex flex-col gap-5 p-4 md:p-6">
                <DialogHeader className="gap-1.5 pr-6">
                  <DialogTitle className="text-lg leading-tight">
                    {product.name}
                  </DialogTitle>
                  <DialogDescription className="flex items-center gap-1.5">
                    <Star
                      aria-hidden="true"
                      className="size-3.5 fill-current text-foreground"
                    />
                    <span className="text-foreground">{product.rating}</span>
                    <span>· {product.reviews} reviews</span>
                  </DialogDescription>
                  <p className="flex items-baseline gap-2">
                    <span className="text-xl font-medium tabular-nums">
                      {currency.format(product.price)}
                    </span>
                    <s className="text-sm text-muted-foreground tabular-nums">
                      <span className="sr-only">Was </span>
                      {currency.format(product.compareAt)}
                    </s>
                  </p>
                </DialogHeader>

                <fieldset className="grid gap-2">
                  <legend className="mb-2 text-sm font-medium">
                    Color <span className="font-normal text-muted-foreground">{colorLabel}</span>
                  </legend>
                  <RadioGroup
                    value={color}
                    onValueChange={(value) => setColor(value as string)}
                    className="flex gap-2"
                  >
                    {colors.map((entry) => (
                      <Label
                        key={entry.value}
                        className="relative cursor-pointer rounded-full p-0.5 ring-1 ring-transparent has-focus-visible:ring-ring has-data-checked:ring-foreground"
                      >
                        <RadioGroupItem
                          value={entry.value}
                          aria-label={entry.label}
                          className="sr-only!"
                        />
                        <span
                          aria-hidden="true"
                          className={`block size-7 rounded-full border border-border ${entry.swatch}`}
                        />
                      </Label>
                    ))}
                  </RadioGroup>
                </fieldset>

                <fieldset className="grid gap-2">
                  <legend className="mb-2 flex w-full items-center justify-between text-sm font-medium">
                    Size
                    {sizeInfo && sizeInfo.stock <= 3 && (
                      <span className="text-xs font-normal text-warning">
                        Only {sizeInfo.stock} left
                      </span>
                    )}
                  </legend>
                  <RadioGroup
                    value={size}
                    onValueChange={(value) => {
                      setSize(value as string);
                      setSizeError(false);
                      setQuantity(1);
                    }}
                    aria-invalid={sizeError || undefined}
                    aria-describedby={sizeError ? "dialog-14-size-error" : undefined}
                    className="grid grid-cols-5 gap-1.5"
                  >
                    {sizes.map((entry) => (
                      <Label
                        key={entry.value}
                        className="h-9 cursor-pointer justify-center rounded-lg border text-sm tabular-nums transition-colors hover:bg-muted has-focus-visible:ring-3 has-focus-visible:ring-ring/50 has-data-checked:border-primary has-data-checked:bg-primary has-data-checked:text-primary-foreground has-data-disabled:cursor-not-allowed has-data-disabled:text-muted-foreground has-data-disabled:line-through has-data-disabled:hover:bg-transparent"
                      >
                        <RadioGroupItem
                          value={entry.value}
                          disabled={entry.stock === 0}
                          aria-label={
                            entry.stock === 0
                              ? `${entry.label}, sold out`
                              : entry.label
                          }
                          className="sr-only!"
                        />
                        {entry.label}
                      </Label>
                    ))}
                  </RadioGroup>
                  {sizeError && (
                    <p
                      id="dialog-14-size-error"
                      role="alert"
                      className="text-sm text-destructive"
                    >
                      Choose a size to add this jacket to your bag.
                    </p>
                  )}
                </fieldset>

                <div className="flex items-end gap-3">
                  <NumberField
                    value={quantity}
                    onValueChange={(value) => setQuantity(value ?? 1)}
                    min={1}
                    max={maxQuantity}
                    className="shrink-0"
                  >
                    <Label>Quantity</Label>
                    <NumberFieldGroup>
                      <NumberFieldDecrement />
                      <NumberFieldInput />
                      <NumberFieldIncrement />
                    </NumberFieldGroup>
                  </NumberField>
                  <Button size="lg" className="flex-1" onClick={addToBag}>
                    <ShoppingBag aria-hidden="true" data-icon="inline-start" />
                    Add to bag · {currency.format(product.price * quantity)}
                  </Button>
                </div>

                <ul className="grid gap-1.5 border-t pt-4 text-xs text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Truck aria-hidden="true" className="size-3.5" />
                    Free shipping over $150, arrives Oct 1–3
                  </li>
                  <li className="flex items-center gap-2">
                    <Check aria-hidden="true" className="size-3.5" />
                    Free returns within 30 days
                  </li>
                </ul>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <div className="grid gap-0.5 p-3">
          <h3 className="truncate text-sm font-medium">{product.name}</h3>
          <p className="flex items-baseline gap-1.5 text-sm">
            <span className="tabular-nums">{currency.format(product.price)}</span>
            <s className="text-xs text-muted-foreground tabular-nums">
              {currency.format(product.compareAt)}
            </s>
          </p>
        </div>
      </article>

      <p aria-live="polite" className="mt-3 text-xs text-muted-foreground">
        {lastAdded}
      </p>
    </div>
  );
}
