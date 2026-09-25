"use client";

import { MailIcon, MapPinIcon, PhoneIcon, XIcon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/registry/base/ui/avatar";
import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
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

const contact = [
  { icon: MailIcon, label: "Email", value: "priya.raman@lumen.io" },
  { icon: PhoneIcon, label: "Phone", value: "+1 415 555 0132" },
  {
    icon: MapPinIcon,
    label: "Office",
    value: "San Francisco, Pacific time",
  },
];

const skills = ["Design systems", "Prototyping", "Accessibility"];

export default function Sheet03() {
  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button variant="outline" className="gap-2 pl-1.5">
            <Avatar size="sm">
              <AvatarImage src="/placeholder.svg" alt="" />
              <AvatarFallback>PR</AvatarFallback>
            </Avatar>
            View Priya Raman
          </Button>
        }
      />
      <SheetContent
        showCloseButton={false}
        className="gap-0 overflow-hidden data-[side=right]:inset-y-2 data-[side=right]:right-2 data-[side=right]:h-auto data-[side=right]:w-[calc(100%-1rem)] data-[side=right]:rounded-xl data-[side=right]:border data-[side=right]:shadow-xl data-[side=right]:sm:max-w-sm"
      >
        <div className="relative h-28 shrink-0 bg-muted">
          <img
            src="/placeholder.svg"
            alt=""
            className="size-full object-cover"
          />
          <SheetClose
            render={
              <Button
                variant="secondary"
                size="icon-sm"
                className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm"
              >
                <XIcon aria-hidden="true" />
                <span className="sr-only">Close</span>
              </Button>
            }
          />
        </div>
        <Avatar className="-mt-8 ml-4 size-16 ring-4 ring-popover">
          <AvatarImage src="/placeholder.svg" alt="" />
          <AvatarFallback className="text-lg">PR</AvatarFallback>
        </Avatar>
        <SheetHeader className="pt-3">
          <div className="flex flex-wrap items-center gap-2">
            <SheetTitle className="text-lg">Priya Raman</SheetTitle>
            <Badge variant="outline">
              <span
                aria-hidden="true"
                className="size-1.5 rounded-full bg-success"
              />
              Available
            </Badge>
          </div>
          <SheetDescription>Senior Product Designer, Platform</SheetDescription>
        </SheetHeader>
        <div className="grid flex-1 content-start gap-5 overflow-y-auto px-4 pb-4">
          <dl className="grid gap-3">
            {contact.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <Icon aria-hidden="true" className="size-4" />
                </span>
                <div className="min-w-0">
                  <dt className="text-muted-foreground text-xs">{label}</dt>
                  <dd className="truncate">{value}</dd>
                </div>
              </div>
            ))}
          </dl>
          <div className="grid gap-2">
            <h3 className="font-medium text-muted-foreground text-xs">
              Focus areas
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((skill) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        <SheetFooter className="flex-row border-t bg-muted/40">
          <SheetClose
            render={
              <Button variant="outline" className="flex-1">
                Schedule 1:1
              </Button>
            }
          />
          <SheetClose
            render={<Button className="flex-1">Send message</Button>}
          />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
