"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/registry/base/ui/tabs";

type Status = "todo" | "doing" | "done";

const columns: { status: Status; label: string }[] = [
  { status: "todo", label: "To do" },
  { status: "doing", label: "In progress" },
  { status: "done", label: "Done" },
];

const tasks: {
  id: string;
  title: string;
  status: Status;
  owner: string;
  due: string;
  week: string;
}[] = [
  {
    id: "WEB-212",
    title: "Write pricing page copy",
    status: "doing",
    owner: "Maya",
    due: "Sep 26",
    week: "This week",
  },
  {
    id: "WEB-208",
    title: "Export hero illustrations",
    status: "done",
    owner: "Leo",
    due: "Sep 24",
    week: "This week",
  },
  {
    id: "WEB-215",
    title: "Set up redirects from old URLs",
    status: "todo",
    owner: "Sam",
    due: "Sep 30",
    week: "Next week",
  },
  {
    id: "WEB-219",
    title: "QA the signup flow on Safari",
    status: "todo",
    owner: "Maya",
    due: "Oct 2",
    week: "Next week",
  },
  {
    id: "WEB-221",
    title: "Launch announcement email",
    status: "todo",
    owner: "Leo",
    due: "Oct 8",
    week: "Later",
  },
];

const weeks = ["This week", "Next week", "Later"];

const statusLabel: Record<Status, string> = {
  todo: "To do",
  doing: "In progress",
  done: "Done",
};

export default function Tabs02() {
  return (
    <Tabs defaultValue="board" className="@container w-full max-w-xl gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col">
          <h3 className="font-semibold">
            Website relaunch
          </h3>
          <p className="text-sm text-muted-foreground">
            {tasks.length} tasks · ships Oct 10
          </p>
        </div>
        <TabsList aria-label="Project view">
          <TabsTrigger value="board" className="px-3">
            Board
          </TabsTrigger>
          <TabsTrigger value="list" className="px-3">
            List
          </TabsTrigger>
          <TabsTrigger value="timeline" className="px-3">
            Timeline
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="board">
        <div className="grid gap-3 @md:grid-cols-3">
          {columns.map((column) => {
            const items = tasks.filter((task) => task.status === column.status);
            return (
              <section
                key={column.status}
                aria-label={column.label}
                className="flex flex-col gap-2 rounded-lg bg-muted/50 p-2"
              >
                <h4 className="flex items-center justify-between px-1 text-xs font-medium text-muted-foreground">
                  {column.label}
                  <span className="tabular-nums">{items.length}</span>
                </h4>
                {items.map((task) => (
                  <div
                    key={task.id}
                    className="flex flex-col gap-1 rounded-md border bg-card p-2.5 text-card-foreground shadow-xs"
                  >
                    <span className="font-medium leading-snug">
                      {task.title}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {task.owner} · {task.due}
                    </span>
                  </div>
                ))}
              </section>
            );
          })}
        </div>
      </TabsContent>

      <TabsContent value="list">
        <ul className="divide-y rounded-lg border">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-0.5 px-3 py-2.5"
            >
              <span className="min-w-0 truncate font-medium">{task.title}</span>
              <span className="text-xs text-muted-foreground tabular-nums">
                {task.due}
              </span>
              <span className="text-xs text-muted-foreground">
                <span className="font-mono">{task.id}</span> · {task.owner}
              </span>
              <span
                className={
                  task.status === "done"
                    ? "text-xs text-success"
                    : "text-xs text-muted-foreground"
                }
              >
                {statusLabel[task.status]}
              </span>
            </li>
          ))}
        </ul>
      </TabsContent>

      <TabsContent value="timeline">
        <ol className="flex flex-col gap-4">
          {weeks.map((week) => (
            <li key={week} className="grid grid-cols-[5.5rem_1fr] gap-3">
              <h4 className="pt-0.5 text-xs font-medium text-muted-foreground">
                {week}
              </h4>
              <ul className="flex flex-col gap-2 border-l pl-3">
                {tasks
                  .filter((task) => task.week === week)
                  .map((task) => (
                    <li key={task.id} className="flex flex-col">
                      <span className="font-medium leading-snug">
                        {task.title}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Due {task.due} · {task.owner}
                      </span>
                    </li>
                  ))}
              </ul>
            </li>
          ))}
        </ol>
      </TabsContent>
    </Tabs>
  );
}
