"use client";

import { MailIcon, MessageSquareIcon, PhoneIcon } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/registry/base/ui/chart";

const tickets = [
  { day: "Mon", email: 48, chat: 92, phone: 21 },
  { day: "Tue", email: 52, chat: 104, phone: 18 },
  { day: "Wed", email: 41, chat: 87, phone: 25 },
  { day: "Thu", email: 60, chat: 115, phone: 30 },
  { day: "Fri", email: 38, chat: 76, phone: 16 },
];

// An `icon` on a config entry replaces the color swatch in both the legend
// and the tooltip, so each channel reads by shape as well as by color. The
// icons are drawn in their series color so they still work as a key.
function EmailIcon() {
  return <MailIcon className="stroke-(--color-email)" />;
}

function ChatIcon() {
  return <MessageSquareIcon className="stroke-(--color-chat)" />;
}

function PhoneCallIcon() {
  return <PhoneIcon className="stroke-(--color-phone)" />;
}

const chartConfig = {
  email: { label: "Email", icon: EmailIcon, color: "var(--chart-1)" },
  chat: { label: "Live chat", icon: ChatIcon, color: "var(--chart-2)" },
  phone: { label: "Phone", icon: PhoneCallIcon, color: "var(--chart-3)" },
} satisfies ChartConfig;

export default function Chart04() {
  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <div className="flex flex-col gap-0.5">
        <span id="chart-04-title" className="text-sm font-medium">
          Support tickets by channel
        </span>
        <span className="text-xs text-muted-foreground">
          Opened Monday to Friday, week 38
        </span>
      </div>
      <ChartContainer
        config={chartConfig}
        role="img"
        aria-labelledby="chart-04-title"
        className="aspect-auto h-60 w-full"
      >
        <BarChart data={tickets} margin={{ left: 0, right: 0 }}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="day"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
          />
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar
            dataKey="email"
            stackId="channel"
            fill="var(--color-email)"
            radius={[0, 0, 4, 4]}
          />
          <Bar dataKey="chat" stackId="channel" fill="var(--color-chat)" />
          <Bar
            dataKey="phone"
            stackId="channel"
            fill="var(--color-phone)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ChartContainer>
    </div>
  );
}
