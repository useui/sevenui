"use client";

import {
  Bar,
  BarChart,
  LabelList,
  type LabelProps,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/registry/base/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/registry/base/ui/chart";

const pages = [
  { path: "/pricing", views: 18420 },
  { path: "/docs/installation", views: 14310 },
  { path: "/blog/migration", views: 9870 },
  { path: "/changelog", views: 7240 },
  { path: "/careers", views: 5615 },
];

const chartConfig = {
  views: { label: "Page views", color: "var(--chart-1)" },
  label: { color: "var(--background)" },
} satisfies ChartConfig;

const formatViews = (value: number) =>
  value >= 1000 ? `${(value / 1000).toFixed(1)}k` : String(value);

// Rough advance width of a 12px medium glyph, used to decide whether a path
// fits inside its bar. Paths that do not fit move out beside the bar.
const CHAR_WIDTH = 7;
const INSET = 10;

function BarLabel({ viewBox, index }: LabelProps) {
  const page = pages[index ?? 0];
  if (!page || !viewBox || !("width" in viewBox)) return null;
  const x = Number(viewBox.x ?? 0);
  const y = Number(viewBox.y ?? 0);
  const width = Number(viewBox.width ?? 0);
  const height = Number(viewBox.height ?? 0);
  const midY = y + height / 2;
  const fitsInside = width >= page.path.length * CHAR_WIDTH + INSET * 2;

  if (fitsInside) {
    return (
      <g>
        <text
          x={x + INSET}
          y={midY}
          dominantBaseline="central"
          fontSize={12}
          className="fill-(--color-label) font-medium"
        >
          {page.path}
        </text>
        <text
          x={x + width + 8}
          y={midY}
          dominantBaseline="central"
          fontSize={12}
          className="fill-foreground tabular-nums"
        >
          {formatViews(page.views)}
        </text>
      </g>
    );
  }

  return (
    <text
      x={x + width + 8}
      y={midY}
      dominantBaseline="central"
      fontSize={12}
      className="fill-foreground"
    >
      <tspan className="font-medium">{page.path}</tspan>
      <tspan dx={8} className="tabular-nums">
        {formatViews(page.views)}
      </tspan>
    </text>
  );
}

export default function Chart05() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Top pages</CardTitle>
        <CardDescription>Unique page views, last 30 days</CardDescription>
      </CardHeader>
      <CardContent>
        {/* layout="vertical" turns the value axis horizontal; labels ride inside the bars when they fit. */}
        <ChartContainer
          config={chartConfig}
          role="img"
          aria-label="Top five pages by unique views, led by /pricing with 18.4k"
          className="aspect-auto h-56 w-full"
        >
          <BarChart
            data={pages}
            layout="vertical"
            margin={{ left: 0, right: 40 }}
            barCategoryGap={6}
          >
            <YAxis dataKey="path" type="category" hide />
            <XAxis dataKey="views" type="number" hide />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Bar dataKey="views" fill="var(--color-views)" radius={6}>
              <LabelList dataKey="path" content={BarLabel} />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        Pricing overtook the docs landing page for the first time this quarter.
      </CardFooter>
    </Card>
  );
}
