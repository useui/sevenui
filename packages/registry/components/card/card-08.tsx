"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/registry/base/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/registry/base/ui/collapsible";
import { Input } from "@/registry/base/ui/input";
import { Label } from "@/registry/base/ui/label";

const fields = [
  { id: "card-08-build", label: "Build command", value: "pnpm run build" },
  { id: "card-08-output", label: "Output directory", value: "dist" },
  { id: "card-08-install", label: "Install command", value: "pnpm install --frozen-lockfile" },
];

export default function Card08() {
  const [open, setOpen] = React.useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="w-full max-w-sm">
      <Card className="gap-0">
        <CardHeader>
          <CardTitle>Build settings</CardTitle>
          <CardDescription>
            {open ? "Overrides apply to the next deployment." : "Using framework defaults for Vite."}
          </CardDescription>
          <CardAction>
            <CollapsibleTrigger
              render={
                <Button variant="ghost" size="icon-sm" aria-label={open ? "Collapse build settings" : "Expand build settings"}>
                  <ChevronDown
                    aria-hidden="true"
                    className="transition-transform duration-200 ease-out group-aria-expanded/button:rotate-180"
                  />
                </Button>
              }
            />
          </CardAction>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="flex flex-col gap-3 pt-4">
            {fields.map((field) => (
              <div key={field.id} className="flex flex-col gap-1.5">
                <Label htmlFor={field.id}>{field.label}</Label>
                <Input id={field.id} defaultValue={field.value} className="font-mono text-xs" />
              </div>
            ))}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
