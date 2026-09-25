"use client";

import {
  Download,
  Ellipsis,
  FileText,
  Link2,
  PenLine,
  Trash2,
} from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
} from "@/registry/base/ui/avatar";
import { Badge } from "@/registry/base/ui/badge";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/registry/base/ui/dropdown-menu";

const viewers = [
  { name: "Daniel Kim", initials: "DK" },
  { name: "Maya Okafor", initials: "MO" },
  { name: "Liam Brooks", initials: "LB" },
];

export default function Card05() {
  return (
    <Card size="sm" className="w-full max-w-xs">
      <CardHeader className="gap-x-3 has-data-[slot=card-action]:grid-cols-[auto_minmax(0,1fr)_auto]">
        <span
          aria-hidden="true"
          className="row-span-2 flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground"
        >
          <FileText className="size-4" />
        </span>
        <CardTitle className="truncate">Q3 board review.pdf</CardTitle>
        <CardDescription className="col-start-2 text-xs">
          4.2 MB · Edited 2h ago
        </CardDescription>
        <CardAction className="col-start-3">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Actions for Q3 board review.pdf"
                >
                  <Ellipsis aria-hidden="true" />
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem>
                <Download aria-hidden="true" />
                Download
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link2 aria-hidden="true" />
                Copy link
              </DropdownMenuItem>
              <DropdownMenuItem>
                <PenLine aria-hidden="true" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive">
                <Trash2 aria-hidden="true" />
                Move to trash
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardAction>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <AvatarGroup
            className="shrink-0 -space-x-1"
            role="group"
            aria-label={`Shared with ${viewers.map((viewer) => viewer.name).join(", ")} and 4 others`}
          >
            {viewers.map((viewer) => (
              <Avatar key={viewer.initials} size="sm" aria-hidden="true">
                <AvatarFallback className="group-data-[size=sm]/avatar:text-[0.625rem]">{viewer.initials}</AvatarFallback>
              </Avatar>
            ))}
            <AvatarGroupCount aria-hidden="true" className="text-xs">
              +4
            </AvatarGroupCount>
          </AvatarGroup>
          <span className="truncate text-xs text-muted-foreground">
            Leadership team
          </span>
        </div>
        <Badge variant="outline">View only</Badge>
      </CardContent>
    </Card>
  );
}
