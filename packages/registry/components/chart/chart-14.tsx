"use client";

import { ArrowRight, Undo2 } from "lucide-react";
import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Avatar, AvatarFallback, AvatarImage } from "@/registry/base/ui/avatar";
import { Button } from "@/registry/base/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/registry/base/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/registry/base/ui/chart";

type Member = {
  name: string;
  initials: string;
  completed: number;
  pending: number;
};

const initialTeam: Member[] = [
  { name: "Priya Raman", initials: "PR", completed: 14, pending: 9 },
  { name: "Marcus Webb", initials: "MW", completed: 11, pending: 4 },
  { name: "Elena Sokolova", initials: "ES", completed: 9, pending: 3 },
  { name: "Tomás Herrera", initials: "TH", completed: 7, pending: 2 },
  { name: "Aiko Tanaka", initials: "AT", completed: 5, pending: 1 },
];

const OVERLOAD_THRESHOLD = 6;

const chartConfig = {
  completed: { label: "Reviewed", color: "var(--chart-2)" },
  pending: { label: "Waiting", color: "var(--chart-1)" },
} satisfies ChartConfig;

export default function Chart14() {
  const [team, setTeam] = React.useState(initialTeam);
  const [lastMove, setLastMove] = React.useState<{
    from: string;
    to: string;
    count: number;
  } | null>(null);

  const overloaded = team.reduce((max, member) =>
    member.pending > max.pending ? member : max,
  );
  const lightest = team.reduce((min, member) =>
    member.pending + member.completed < min.pending + min.completed
      ? member
      : min,
  );
  const moveCount = Math.max(
    0,
    Math.floor((overloaded.pending - lightest.pending) / 2),
  );
  const needsRebalance =
    overloaded.pending >= OVERLOAD_THRESHOLD && moveCount > 0;

  function move(from: string, to: string, count: number) {
    setTeam((current) =>
      current.map((member) => {
        if (member.name === from)
          return { ...member, pending: member.pending - count };
        if (member.name === to)
          return { ...member, pending: member.pending + count };
        return member;
      }),
    );
  }

  function rebalance() {
    move(overloaded.name, lightest.name, moveCount);
    setLastMove({ from: overloaded.name, to: lightest.name, count: moveCount });
  }

  function undo() {
    if (!lastMove) return;
    move(lastMove.to, lastMove.from, lastMove.count);
    setLastMove(null);
  }

  const firstName = (name: string) => name.split(" ")[0];

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Review load</CardTitle>
        <CardDescription>
          Pull requests assigned per reviewer · Sprint 38
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-56 w-full"
          role="img"
          aria-label={`Review load: ${team
            .map(
              (member) =>
                `${member.name} ${member.completed} reviewed, ${member.pending} waiting`,
            )
            .join("; ")}`}
        >
          <BarChart
            data={team}
            layout="vertical"
            margin={{ left: 0, right: 8 }}
            barSize={18}
          >
            <CartesianGrid horizontal={false} />
            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={64}
              tickLine={false}
              axisLine={false}
              tickFormatter={firstName}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar
              dataKey="completed"
              stackId="reviews"
              fill="var(--color-completed)"
              radius={[4, 0, 0, 4]}
            />
            <Bar
              dataKey="pending"
              stackId="reviews"
              fill="var(--color-pending)"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="border-t" aria-live="polite">
        {lastMove ? (
          <div className="flex w-full items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Moved {lastMove.count} reviews from {firstName(lastMove.from)} to{" "}
              {firstName(lastMove.to)}.
            </p>
            <Button size="sm" variant="ghost" onClick={undo}>
              <Undo2 aria-hidden="true" data-icon="inline-start" />
              Undo
            </Button>
          </div>
        ) : needsRebalance ? (
          <div className="flex w-full flex-col gap-3">
            <div className="flex items-center gap-2 text-sm">
              <Avatar size="sm">
                <AvatarImage src="/placeholder.svg" alt="" />
                <AvatarFallback>{overloaded.initials}</AvatarFallback>
              </Avatar>
              <ArrowRight
                aria-hidden="true"
                className="size-4 text-muted-foreground"
              />
              <Avatar size="sm">
                <AvatarImage src="/placeholder.svg" alt="" />
                <AvatarFallback>{lightest.initials}</AvatarFallback>
              </Avatar>
              <p className="min-w-0 text-muted-foreground">
                <span className="font-medium text-foreground">
                  {firstName(overloaded.name)}
                </span>{" "}
                has {overloaded.pending} reviews waiting.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={rebalance}
              className="self-start"
            >
              Reassign {moveCount} to {firstName(lightest.name)}
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Review load is balanced across the team.
          </p>
        )}
      </CardFooter>
    </Card>
  );
}
