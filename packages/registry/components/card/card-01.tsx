"use client";

import { TrendingUp } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/registry/base/ui/card";

export default function Card01() {
  return (
    <Card className="w-full max-w-xs">
      <CardHeader>
        <CardDescription>Monthly recurring revenue</CardDescription>
        <CardTitle className="text-3xl font-semibold tabular-nums">
          $48,290
        </CardTitle>
      </CardHeader>
      <CardContent className="flex items-center gap-1.5 text-sm">
        <TrendingUp
          aria-hidden="true"
          className="size-4 text-emerald-600 dark:text-emerald-400"
        />
        <span className="font-medium text-emerald-600 dark:text-emerald-400">
          +8.2%
        </span>
        <span className="text-muted-foreground">vs. last month</span>
      </CardContent>
    </Card>
  );
}
