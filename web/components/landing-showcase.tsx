"use client";

import * as React from "react";

import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/registry/base/ui/card";
import { Checkbox } from "@/registry/base/ui/checkbox";
import { Field, FieldDescription, FieldLabel } from "@/registry/base/ui/field";
import { Input } from "@/registry/base/ui/input";
import { Kbd } from "@/registry/base/ui/kbd";
import { Label } from "@/registry/base/ui/label";
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
import { Slider } from "@/registry/base/ui/slider";
import { Switch } from "@/registry/base/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/registry/base/ui/toggle-group";

const roles = [
  { label: "Design", value: "design" },
  { label: "Engineering", value: "engineering" },
  { label: "Product", value: "product" },
];

/** Lists the registry items composing a card — the specimen's index line. */
function SpecimenIndex({ items }: { items: string[] }) {
  return (
    <p className="border-t px-6 pt-4 font-mono text-xs text-muted-foreground">
      {items.join(" · ")}
    </p>
  );
}

export default function LandingShowcase() {
  const [volume, setVolume] = React.useState(60);

  return (
    <div className="grid gap-4 lg:grid-cols-[3fr_2fr]">
      <Card className="justify-between">
        <div className="flex flex-col gap-6">
          <CardHeader>
            <CardTitle>Create your account</CardTitle>
            <CardDescription>
              Every part below installs with one command.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
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
            <Button className="w-full">Create account</Button>
          </CardContent>
        </div>
        <SpecimenIndex
          items={["field", "input", "label", "select", "checkbox", "button"]}
        />
      </Card>

      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Label className="justify-between font-normal">
              Public profile <Switch defaultChecked />
            </Label>
            <Label className="justify-between font-normal">
              Weekly digest <Switch />
            </Label>
            <Separator />
            <RadioGroup
              defaultValue="system"
              className="flex items-center gap-4"
            >
              {["light", "dark", "system"].map((mode) => (
                <Label key={mode} className="font-normal capitalize">
                  <RadioGroupItem value={mode} /> {mode}
                </Label>
              ))}
            </RadioGroup>
          </CardContent>
          <SpecimenIndex items={["switch", "separator", "radio-group"]} />
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Volume
              <span className="font-mono text-sm font-normal text-muted-foreground">
                {volume}%
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <Slider
              value={volume}
              onValueChange={(value) =>
                setVolume(Array.isArray(value) ? value[0] : value)
              }
            />
            <Progress value={volume} />
            <div className="flex items-center justify-between">
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
              <div className="flex items-center gap-2">
                <Badge variant="secondary">v0.2.0</Badge>
                <Kbd>⌘K</Kbd>
              </div>
            </div>
          </CardContent>
          <SpecimenIndex
            items={["slider", "progress", "toggle-group", "badge", "kbd"]}
          />
        </Card>
      </div>
    </div>
  );
}
