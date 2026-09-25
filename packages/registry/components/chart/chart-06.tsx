"use client";

import * as React from "react";
import { ChartNoAxesColumnIcon, RefreshCwIcon, TriangleAlertIcon } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";

import { Button } from "@/registry/base/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/registry/base/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/registry/base/ui/chart";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/registry/base/ui/empty";
import { Skeleton } from "@/registry/base/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/registry/base/ui/toggle-group";

const orders = [
  { date: "Sep 16", orders: 128 },
  { date: "Sep 17", orders: 142 },
  { date: "Sep 18", orders: 119 },
  { date: "Sep 19", orders: 167 },
  { date: "Sep 20", orders: 181 },
  { date: "Sep 21", orders: 158 },
  { date: "Sep 22", orders: 203 },
];

const chartConfig = {
  orders: { label: "Orders", color: "var(--chart-2)" },
} satisfies ChartConfig;

const states = [
  { value: "ready", label: "Ready" },
  { value: "loading", label: "Loading" },
  { value: "empty", label: "Empty" },
  { value: "error", label: "Error" },
] as const;

type ChartState = (typeof states)[number]["value"];

// Skeleton bar heights, as a share of the frame, hint at the shape to come.
const skeletonHeights = ["45%", "60%", "38%", "72%", "80%", "64%", "90%"];

function ChartBody({
  state,
  onRetry,
}: {
  state: ChartState;
  onRetry: () => void;
}) {
  if (state === "loading") {
    return (
      <div
        role="status"
        aria-label="Loading orders chart"
        className="flex h-full items-end gap-2 px-1 pb-6"
      >
        {skeletonHeights.map((height, index) => (
          <Skeleton
            // biome-ignore lint/suspicious/noArrayIndexKey: static placeholder list
            key={index}
            className="flex-1 rounded-sm"
            style={{ height }}
          />
        ))}
      </div>
    );
  }

  if (state === "empty") {
    return (
      <Empty className="h-full border border-border p-4">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ChartNoAxesColumnIcon aria-hidden="true" />
          </EmptyMedia>
          <EmptyTitle>No orders in this range</EmptyTitle>
          <EmptyDescription>
            Orders appear here within a minute of checkout.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  if (state === "error") {
    return (
      <Empty role="alert" className="h-full border border-destructive/30 p-4">
        <EmptyHeader>
          <EmptyMedia
            variant="icon"
            className="bg-destructive/10 text-destructive"
          >
            <TriangleAlertIcon aria-hidden="true" />
          </EmptyMedia>
          <EmptyTitle>Couldn't load orders</EmptyTitle>
          <EmptyDescription>
            The analytics service timed out after 10 seconds.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RefreshCwIcon aria-hidden="true" />
            Try again
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <ChartContainer
      config={chartConfig}
      role="img"
      aria-label="Daily orders, September 16 to 22"
      className="aspect-auto h-full w-full"
    >
      <LineChart data={orders} margin={{ left: 12, right: 12, top: 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          interval="preserveStartEnd"
        />
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
        <Line
          dataKey="orders"
          type="monotone"
          stroke="var(--color-orders)"
          strokeWidth={2}
          dot={{ r: 3, fill: "var(--color-orders)" }}
        />
      </LineChart>
    </ChartContainer>
  );
}

export default function Chart06() {
  const [state, setState] = React.useState<ChartState>("ready");

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Daily orders</CardTitle>
        <CardDescription>Preview every state the chart can be in</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <ToggleGroup
          aria-label="Chart state"
          variant="outline"
          size="sm"
          spacing={0}
          value={[state]}
          onValueChange={(next) => {
            if (next.length > 0) setState(next[0] as ChartState);
          }}
          className="w-full"
        >
          {states.map((item) => (
            <ToggleGroupItem
              key={item.value}
              value={item.value}
              className="flex-1 text-xs"
            >
              {item.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <div className="h-56" aria-busy={state === "loading"}>
          <ChartBody state={state} onRetry={() => setState("ready")} />
        </div>
      </CardContent>
    </Card>
  );
}
