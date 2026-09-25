"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/registry/base/ui/avatar";
import { Separator } from "@/registry/base/ui/separator";

export default function Avatar07() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-5">
      <div className="flex items-center gap-3">
        <Avatar size="lg">
          <AvatarImage src="/placeholder.svg" alt="" />
          <AvatarFallback>GA</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">Grace Adeyemi</p>
          <p className="truncate text-sm text-muted-foreground">
            grace@northwind.io
          </p>
        </div>
      </div>

      <Separator />

      <div className="flex flex-col items-center gap-2 text-center">
        <Avatar className="size-16">
          <AvatarImage src="/placeholder.svg" alt="" />
          <AvatarFallback className="text-lg">GA</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium">Grace Adeyemi</p>
          <p className="text-xs text-muted-foreground">
            Staff engineer · Platform
          </p>
        </div>
      </div>

      <Separator />

      <div className="flex flex-row-reverse items-center gap-3 text-right">
        <Avatar size="lg">
          <AvatarImage src="/placeholder.svg" alt="" />
          <AvatarFallback>GA</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">Grace Adeyemi</p>
          <p className="truncate text-xs text-muted-foreground">
            Signed in · Pro plan
          </p>
        </div>
      </div>

      <Separator />

      <p className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-muted-foreground">
        Assigned to
        <span className="inline-flex items-center gap-1.5 rounded-full bg-muted py-0.5 pr-2.5 pl-0.5 font-medium text-foreground">
          <Avatar size="sm">
            <AvatarImage src="/placeholder.svg" alt="" />
            <AvatarFallback>GA</AvatarFallback>
          </Avatar>
          Grace Adeyemi
        </span>
        by Tomás
      </p>
    </div>
  );
}
