"use client";

import { MoreHorizontalIcon } from "lucide-react";

import { Avatar, AvatarFallback } from "@/registry/base/ui/avatar";
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

export default function CardProject() {
  return (
    <Card size="sm" className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Design system refresh</CardTitle>
        <CardDescription>Due Friday · 8 tasks left</CardDescription>
        <CardAction>
          <Button variant="ghost" size="icon-sm" aria-label="Project options">
            <MoreHorizontalIcon />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex items-center justify-between">
        <div className="flex -space-x-2">
          {["EC", "JL", "SR"].map((initials) => (
            <Avatar key={initials} className="size-6 ring-2 ring-card">
              <AvatarFallback className="text-[0.6rem]">
                {initials}
              </AvatarFallback>
            </Avatar>
          ))}
        </div>
        <Badge variant="secondary">In progress</Badge>
      </CardContent>
    </Card>
  );
}
