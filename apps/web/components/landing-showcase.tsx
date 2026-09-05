"use client";

import * as React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/registry/base/ui/avatar";
import { Button } from "@/registry/base/ui/button";
import { Checkbox } from "@/registry/base/ui/checkbox";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/registry/base/ui/combobox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/registry/base/ui/dialog";
import { Field, FieldDescription, FieldLabel } from "@/registry/base/ui/field";
import { Input } from "@/registry/base/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/registry/base/ui/input-otp";
import { Kbd } from "@/registry/base/ui/kbd";
import { Label } from "@/registry/base/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/registry/base/ui/popover";
import { Progress } from "@/registry/base/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/registry/base/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/base/ui/select";
import { Separator } from "@/registry/base/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/registry/base/ui/sheet";
import { Slider } from "@/registry/base/ui/slider";
import { Switch } from "@/registry/base/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/registry/base/ui/table";
import { Toaster, toast } from "@/registry/base/ui/toast";
import { ToggleGroup, ToggleGroupItem } from "@/registry/base/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/registry/base/ui/tooltip";

const roles = [
  { label: "Design", value: "design" },
  { label: "Engineering", value: "engineering" },
  { label: "Product", value: "product" },
];

const searchable = [
  { value: "button", label: "Button" },
  { value: "combobox", label: "Combobox" },
  { value: "context-menu", label: "Context Menu" },
  { value: "dialog", label: "Dialog" },
  { value: "dropdown-menu", label: "Dropdown Menu" },
  { value: "input-otp", label: "Input OTP" },
  { value: "sheet", label: "Sheet" },
  { value: "slider", label: "Slider" },
  { value: "table", label: "Table" },
  { value: "toast", label: "Toast" },
];

const invoices = [
  { invoice: "INV-001", status: "Paid", amount: "$250.00" },
  { invoice: "INV-002", status: "Pending", amount: "$150.00" },
  { invoice: "INV-003", status: "Unpaid", amount: "$350.00" },
];

/**
 * One tile of the showcase mosaic. Tiles draw their own end + bottom
 * borders; the wrapper in LandingShowcase pulls the grid 1px past its
 * clipping box so the outermost borders vanish against the page rails.
 */
function Tile({
  title,
  items,
  className = "",
  children,
}: {
  title?: string;
  items: string[];
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`flex flex-col border-e border-b border-border ${className}`}>
      <div className="flex flex-1 flex-col gap-5 p-6">
        {title ? <h3 className="font-medium">{title}</h3> : null}
        {children}
      </div>
      <p className="border-t border-border px-6 py-2.5 font-mono text-xs text-muted-foreground">
        {items.join(" · ")}
      </p>
    </div>
  );
}

export default function LandingShowcase() {
  const [volume, setVolume] = React.useState(60);
  const [otp, setOtp] = React.useState("");

  return (
    <div className="overflow-hidden">
      <Toaster />
      <div className="-me-px -mb-px grid sm:grid-cols-2 lg:grid-cols-3">
        <Tile
          title="Create your account"
          items={["field", "input", "label", "select", "checkbox", "button"]}
          className="lg:row-span-2"
        >
          <Field name="email">
            <FieldLabel>Email</FieldLabel>
            <Input type="email" placeholder="you@company.com" />
            <FieldDescription>
              Work email — we never send marketing.
            </FieldDescription>
          </Field>
          <div className="flex flex-col gap-2">
            <Label htmlFor="showcase-role">Team</Label>
            <Select items={roles}>
              <SelectTrigger id="showcase-role" className="w-full">
                <SelectValue placeholder="Choose a team" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Label className="font-normal">
            <Checkbox defaultChecked /> Email me about releases
          </Label>
          <Button className="mt-auto w-full">Create account</Button>
        </Tile>

        <Tile
          title="Preferences"
          items={["switch", "separator", "radio-group"]}
        >
          <Label className="justify-between font-normal">
            Public profile <Switch defaultChecked />
          </Label>
          <Label className="justify-between font-normal">
            Weekly digest <Switch />
          </Label>
          <Separator />
          <RadioGroup defaultValue="system" className="flex items-center gap-4">
            {["light", "dark", "system"].map((mode) => (
              <Label key={mode} className="font-normal capitalize">
                <RadioGroupItem value={mode} /> {mode}
              </Label>
            ))}
          </RadioGroup>
        </Tile>

        <Tile items={["slider", "progress", "toggle-group", "kbd"]}>
          <h3 className="flex items-center justify-between font-medium">
            Volume
            <span className="font-mono text-sm font-normal text-muted-foreground">
              {volume}%
            </span>
          </h3>
          <Slider
            value={volume}
            onValueChange={(value) =>
              setVolume(Array.isArray(value) ? value[0] : value)
            }
          />
          <Progress value={volume} />
          <div className="mt-auto flex items-center justify-between">
            <ToggleGroup defaultValue={["bold"]}>
              <ToggleGroupItem value="bold" aria-label="Bold">
                <span className="font-bold">B</span>
              </ToggleGroupItem>
              <ToggleGroupItem value="italic" aria-label="Italic">
                <span className="italic">I</span>
              </ToggleGroupItem>
              <ToggleGroupItem value="underline" aria-label="Underline">
                <span className="underline">U</span>
              </ToggleGroupItem>
            </ToggleGroup>
            <Kbd>⌘K</Kbd>
          </div>
        </Tile>

        <Tile
          title="Open the overlays"
          items={["dialog", "sheet", "popover", "tooltip"]}
        >
          <div className="flex flex-wrap gap-2">
            <Dialog>
              <DialogTrigger render={<Button variant="outline">Dialog</Button>} />
              <DialogContent className="sm:max-w-106">
                <DialogHeader>
                  <DialogTitle>Edit profile</DialogTitle>
                  <DialogDescription>
                    Every part of this dialog installs with one command.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-2">
                  <Label htmlFor="showcase-name">Name</Label>
                  <Input id="showcase-name" defaultValue="Ada Lovelace" />
                </div>
                <DialogFooter>
                  <DialogClose render={<Button variant="outline">Cancel</Button>} />
                  <Button type="submit">Save changes</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Sheet>
              <SheetTrigger render={<Button variant="outline">Sheet</Button>} />
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Edit profile</SheetTitle>
                  <SheetDescription>
                    Slides in from the edge, traps focus, restores it on
                    close.
                  </SheetDescription>
                </SheetHeader>
                <div className="grid flex-1 auto-rows-min gap-6 px-4">
                  <div className="grid gap-2">
                    <Label htmlFor="showcase-sheet-name">Name</Label>
                    <Input id="showcase-sheet-name" defaultValue="Ada Lovelace" />
                  </div>
                </div>
                <SheetFooter>
                  <Button type="submit">Save changes</Button>
                  <SheetClose render={<Button variant="outline">Close</Button>} />
                </SheetFooter>
              </SheetContent>
            </Sheet>

            <Popover>
              <PopoverTrigger
                render={<Button variant="outline">Popover</Button>}
              />
              <PopoverContent className="w-64">
                <p className="text-sm text-muted-foreground">
                  Anchored, dismissable, and fully accessible — a Base UI
                  Popover underneath.
                </p>
              </PopoverContent>
            </Popover>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger
                  render={<Button variant="outline">Tooltip</Button>}
                />
                <TooltipContent>Built on Base UI 1.7</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </Tile>

        <Tile title="Notify" items={["toast", "button"]}>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() =>
                toast("Component added", {
                  description: "button.tsx landed in your repo.",
                })
              }
            >
              Toast
            </Button>
            <Button
              variant="outline"
              onClick={() => toast.success("Changes saved")}
            >
              Success
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                toast.promise(
                  new Promise((resolve) => setTimeout(resolve, 1600)),
                  {
                    loading: "Installing…",
                    success: "Installed",
                    error: "Failed to install",
                  },
                )
              }
            >
              Promise
            </Button>
          </div>
        </Tile>

        <Tile title="Find a component" items={["combobox"]}>
          <Combobox items={searchable}>
            <ComboboxInput placeholder="Search components…" className="w-full" />
            <ComboboxContent>
              <ComboboxEmpty>Nothing found — yet.</ComboboxEmpty>
              <ComboboxList>
                {(item: (typeof searchable)[number]) => (
                  <ComboboxItem key={item.value} value={item}>
                    {item.label}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </Tile>

        <Tile title="Verify it's you" items={["input-otp"]}>
          <InputOTP length={6} value={otp} onValueChange={setOtp}>
            <InputOTPGroup>
              {Array.from({ length: 3 }).map((_, index) => (
                <InputOTPSlot
                  key={index}
                  aria-label={index === 0 ? undefined : `Digit ${index + 1} of 6`}
                />
              ))}
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              {Array.from({ length: 3 }).map((_, index) => (
                <InputOTPSlot
                  key={index}
                  aria-label={`Digit ${index + 4} of 6`}
                />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </Tile>

        <Tile title="Recent invoices" items={["table", "avatar"]}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.invoice}>
                  <TableCell className="font-medium">{invoice.invoice}</TableCell>
                  <TableCell>{invoice.status}</TableCell>
                  <TableCell className="text-right">{invoice.amount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-auto flex items-center justify-between">
            <div className="flex -space-x-2">
              <Avatar className="border-2 border-background">
                <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <Avatar className="border-2 border-background">
                <AvatarImage src="" alt="@ada" />
                <AvatarFallback>AL</AvatarFallback>
              </Avatar>
              <Avatar className="border-2 border-background">
                <AvatarImage src="" alt="@grace" />
                <AvatarFallback>GH</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </Tile>
      </div>
    </div>
  );
}
