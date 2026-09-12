"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/registry/base/ui/tabs";

const views = [
  {
    value: "board",
    label: "Board",
    body: "Drag cards between columns to update their status.",
  },
  {
    value: "list",
    label: "List",
    body: "A dense, sortable table of every task in the project.",
  },
  {
    value: "calendar",
    label: "Calendar",
    body: "See tasks laid out by due date across the month.",
  },
];

export default function Tabs02() {
  return (
    <Tabs defaultValue="board" className="w-full max-w-md">
      <TabsList className="w-full">
        {views.map((view) => (
          <TabsTrigger key={view.value} value={view.value} className="flex-1">
            {view.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {views.map((view) => (
        <TabsContent key={view.value} value={view.value}>
          <p className="text-sm text-muted-foreground">{view.body}</p>
        </TabsContent>
      ))}
    </Tabs>
  );
}
