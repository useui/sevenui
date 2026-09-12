"use client";

import { TrendingDownIcon, TrendingUpIcon } from "lucide-react";

import { Badge } from "@/registry/base/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/registry/base/ui/card";

const stats = [
  {
    label: "Total revenue",
    value: "$1,250.00",
    trend: "+12.5%",
    up: true,
    note: "Trending up this month",
  },
  {
    label: "New customers",
    value: "1,234",
    trend: "-20%",
    up: false,
    note: "Down from last period",
  },
];

export default function CardStats() {
  return (
    <div className="grid w-full max-w-lg gap-4 sm:grid-cols-2">
      {stats.map((stat) => (
        <Card key={stat.label} size="sm">
          <CardHeader>
            <CardDescription>{stat.label}</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums">
              {stat.value}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                {stat.up ? <TrendingUpIcon /> : <TrendingDownIcon />}
                {stat.trend}
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="text-xs text-muted-foreground">
            {stat.note}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
