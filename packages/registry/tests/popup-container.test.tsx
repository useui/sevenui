import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type * as React from "react";
import { describe, expect, it } from "vitest";

import { AlertDialog, AlertDialogContent, AlertDialogTitle } from "@/registry/base/ui/alert-dialog";
import { Button } from "@/registry/base/ui/button";
import { ButtonGroup } from "@/registry/base/ui/button-group";
import { Combobox, ComboboxContent, ComboboxInput, ComboboxItem, ComboboxList } from "@/registry/base/ui/combobox";
import { Dialog, DialogContent, DialogTitle } from "@/registry/base/ui/dialog";
import { DirectionProvider } from "@/registry/base/ui/direction";
import { Drawer, DrawerContent, DrawerTitle } from "@/registry/base/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/registry/base/ui/dropdown-menu";
import { Field, FieldLabel } from "@/registry/base/ui/field";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/registry/base/ui/hover-card";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/registry/base/ui/navigation-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/registry/base/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/registry/base/ui/select";
import { Sheet, SheetContent, SheetTitle } from "@/registry/base/ui/sheet";
import { createToastManager, Toaster } from "@/registry/base/ui/toast";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/registry/base/ui/tooltip";

// Base UI portals every popup to <body>. UI SDK renders popups in place, so
// in the flavour a popup placed in a Field, ButtonGroup or card would be that
// parent's DOM child, and the parent's child rules (`*:w-full`, first/last
// corners) would reach it. These cases pin that, in both flavours, an open
// popup is not inside the element that holds its trigger. Real layout is
// checked in a browser (scripts/check-home.mjs --browser).

const FRUITS = [
  { label: "Apple", value: "apple" },
  { label: "Banana", value: "banana" },
];

const OPEN_POPUPS: Array<[string, () => React.ReactElement]> = [
  [
    "Select",
    () => (
      <Select defaultOpen items={FRUITS}>
        <SelectTrigger aria-label="Fruit">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {FRUITS.map((fruit) => (
            <SelectItem key={fruit.value} value={fruit.value}>
              {fruit.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    ),
  ],
  [
    "Popover",
    () => (
      <Popover defaultOpen>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>Popup body</PopoverContent>
      </Popover>
    ),
  ],
  [
    "Combobox",
    () => (
      <Combobox defaultOpen items={FRUITS.map((fruit) => fruit.label)}>
        <ComboboxInput aria-label="Fruit" />
        <ComboboxContent>
          <ComboboxList>
            {(item: string) => (
              <ComboboxItem key={item} value={item}>
                {item}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    ),
  ],
  [
    "DropdownMenu",
    () => (
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Popup body</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  ],
  [
    "Tooltip",
    () => (
      <Tooltip defaultOpen>
        <TooltipTrigger>Hint</TooltipTrigger>
        <TooltipContent>Popup body</TooltipContent>
      </Tooltip>
    ),
  ],
  [
    "HoverCard",
    () => (
      <HoverCard defaultOpen>
        <HoverCardTrigger href="#">Profile</HoverCardTrigger>
        <HoverCardContent>Popup body</HoverCardContent>
      </HoverCard>
    ),
  ],
  [
    "Dialog",
    () => (
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle>Popup body</DialogTitle>
        </DialogContent>
      </Dialog>
    ),
  ],
  [
    "AlertDialog",
    () => (
      <AlertDialog defaultOpen>
        <AlertDialogContent>
          <AlertDialogTitle>Popup body</AlertDialogTitle>
        </AlertDialogContent>
      </AlertDialog>
    ),
  ],
  [
    "Sheet",
    () => (
      <Sheet defaultOpen>
        <SheetContent>
          <SheetTitle>Popup body</SheetTitle>
        </SheetContent>
      </Sheet>
    ),
  ],
  [
    "Drawer",
    () => (
      <Drawer defaultOpen>
        <DrawerContent>
          <DrawerTitle>Popup body</DrawerTitle>
        </DrawerContent>
      </Drawer>
    ),
  ],
  [
    "NavigationMenu",
    () => (
      <NavigationMenu defaultValue="products">
        <NavigationMenuList>
          <NavigationMenuItem value="products">
            <NavigationMenuTrigger>Products</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink href="#">Popup body</NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    ),
  ],
];

// The open popup's own element: the listbox for the two lists, else the
// nearest positioned or dialog part around the body text.
async function findPopup(name: string): Promise<HTMLElement> {
  if (name === "Select" || name === "Combobox") return screen.findByRole("listbox");
  const text = await screen.findByText("Popup body");
  const popup = text.closest<HTMLElement>(
    '[data-slot$="-content"], [data-slot="drawer-popup"], [data-slot="navigation-menu-viewport"], [data-side], [role="dialog"], [role="alertdialog"]',
  );
  if (!popup) throw new Error(`${name}: no popup element around the body text`);
  return popup;
}

describe("popups render outside the element that holds their trigger", () => {
  for (const [name, Popup] of OPEN_POPUPS) {
    it(`${name} in a Field`, async () => {
      render(
        <Field data-testid="field">
          <FieldLabel>Label</FieldLabel>
          <Popup />
        </Field>,
      );
      const popup = await findPopup(name);
      const field = screen.getByTestId("field");
      expect(popup.isConnected).toBe(true);
      expect(field.contains(popup)).toBe(false);
    });
  }

  it("Dialog overlay in a Field", async () => {
    render(
      <Field data-testid="field">
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle>Popup body</DialogTitle>
          </DialogContent>
        </Dialog>
      </Field>,
    );
    await screen.findByText("Popup body");
    const overlay = document.querySelector('[data-slot="dialog-overlay"]');
    expect(overlay).not.toBeNull();
    expect(screen.getByTestId("field").contains(overlay)).toBe(false);
  });

  it("a popup inside a dialog's Field (the date picker in a form dialog)", async () => {
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle>New release</DialogTitle>
          <Field data-testid="field">
            <FieldLabel>Ship date</FieldLabel>
            <Popover defaultOpen>
              <PopoverTrigger>Pick a day</PopoverTrigger>
              <PopoverContent>Popup body</PopoverContent>
            </Popover>
          </Field>
        </DialogContent>
      </Dialog>,
    );
    const popup = await findPopup("Popover");
    expect(screen.getByTestId("field").contains(popup)).toBe(false);
  });

  it("the toast viewport", async () => {
    render(
      <div data-testid="parent">
        <Toaster toastManager={createToastManager()} />
      </div>,
    );
    await waitFor(() => expect(document.querySelector('[data-slot="toast-viewport"]')).not.toBeNull());
    const viewport = document.querySelector('[data-slot="toast-viewport"]');
    expect(screen.getByTestId("parent").contains(viewport)).toBe(false);
  });
});

describe("ButtonGroup corners with a select in the group", () => {
  // The group rounds the end of its last slotted child. UI SDK keeps the
  // select's hidden form input beside the trigger with a data-slot of its own
  // (Base UI's has none), so the rule must skip hidden inputs or the trigger
  // loses its rounded end.
  it("the select trigger is the child the end-corner rule rounds", () => {
    render(
      <ButtonGroup data-testid="group">
        <Button variant="outline">First</Button>
        <Select items={FRUITS}>
          <SelectTrigger aria-label="Fruit">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FRUITS.map((fruit) => (
              <SelectItem key={fruit.value} value={fruit.value}>
                {fruit.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </ButtonGroup>,
    );
    const group = screen.getByTestId("group");
    const rule = group.className.split(/\s+/).find((token) => /^\[&>.*\]:rounded-r-lg!$/.test(token));
    expect(rule).toBeDefined();
    const selector = `:scope>${(rule as string).slice(3, -":rounded-r-lg!".length - 1).replace(/_/g, " ")}`;
    const rounded = [...group.querySelectorAll(selector)];
    const trigger = screen.getByRole("combobox", { name: "Fruit" });
    expect(rounded).toContain(trigger);
    expect(rounded).not.toContain(screen.getByRole("button", { name: "First" }));
  });
});

describe("popups under a DirectionProvider", () => {
  // Base UI reads the direction from React context; UI SDK from the page, so
  // the flavour's popups must stay under the provider's dir wrapper.
  it("an rtl submenu opens with ArrowLeft", async () => {
    const user = userEvent.setup();
    render(
      <DirectionProvider direction="rtl">
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>More</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem>Archive</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>
      </DirectionProvider>,
    );
    const more = await screen.findByRole("menuitem", { name: "More" });
    more.focus();
    await user.keyboard("{ArrowLeft}");
    expect(await screen.findByRole("menuitem", { name: "Archive" })).toBeTruthy();
  });
});
