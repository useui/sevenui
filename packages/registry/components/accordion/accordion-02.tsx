"use client";

import { CircleCheckIcon, LockIcon, PlayIcon } from "lucide-react";
import * as React from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/registry/base/ui/accordion";

type LessonState = "done" | "next" | "open" | "locked";

const modules: {
  value: string;
  title: string;
  lessons: { title: string; minutes: number; state: LessonState }[];
}[] = [
  {
    value: "foundations",
    title: "Foundations",
    lessons: [
      { title: "Why design tokens exist", minutes: 6, state: "done" },
      { title: "Naming colors by role", minutes: 11, state: "done" },
      { title: "Spacing scales that hold up", minutes: 9, state: "done" },
    ],
  },
  {
    value: "components",
    title: "Building components",
    lessons: [
      { title: "Anatomy of a button", minutes: 8, state: "done" },
      { title: "Variants without prop explosion", minutes: 14, state: "next" },
      { title: "Composing with slots", minutes: 12, state: "open" },
      { title: "Accessible focus states", minutes: 10, state: "open" },
    ],
  },
  {
    value: "theming",
    title: "Theming and dark mode",
    lessons: [
      { title: "Swapping themes with CSS variables", minutes: 13, state: "locked" },
      { title: "Checking contrast in both modes", minutes: 7, state: "locked" },
    ],
  },
];

function formatMinutes(total: number) {
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

const stateLabel: Record<LessonState, string> = {
  done: "Completed",
  next: "Up next",
  open: "Not started",
  locked: "Locked",
};

export default function Accordion02() {
  const allLessons = modules.flatMap((chapter) => chapter.lessons);
  const courseMinutes = allLessons.reduce((sum, l) => sum + l.minutes, 0);
  // The lesson loaded in the player. Nothing plays until a lesson is picked;
  // picking any unlocked lesson moves playback there.
  const [playing, setPlaying] = React.useState<string | null>(null);

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-base font-semibold">Course content</h3>
        <span className="text-xs text-muted-foreground tabular-nums">
          {allLessons.length} lessons · {formatMinutes(courseMinutes)}
        </span>
      </div>
      <Accordion
        defaultValue={["components"]}
        className="overflow-hidden rounded-xl border"
      >
        {modules.map((chapter, index) => {
          const done = chapter.lessons.filter((l) => l.state === "done").length;
          const minutes = chapter.lessons.reduce((sum, l) => sum + l.minutes, 0);
          return (
            <AccordionItem key={chapter.value} value={chapter.value}>
              <AccordionTrigger className="items-center gap-3 rounded-none bg-muted/40 px-4 py-3 hover:no-underline focus-visible:ring-inset">
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span>
                    <span className="text-muted-foreground tabular-nums">
                      {index + 1}.
                    </span>{" "}
                    {chapter.title}
                  </span>
                  <span className="text-xs font-normal text-muted-foreground tabular-nums">
                    {done} of {chapter.lessons.length} complete ·{" "}
                    {formatMinutes(minutes)}
                  </span>
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-0">
                <ol className="flex flex-col py-1.5">
                  {chapter.lessons.map((lesson) => {
                    const isPlaying = lesson.title === playing;
                    return (
                    <li key={lesson.title}>
                      <button
                        type="button"
                        disabled={lesson.state === "locked"}
                        aria-current={isPlaying ? "true" : undefined}
                        onClick={() => setPlaying(lesson.title)}
                        className="flex w-full items-center gap-3 px-4 py-2 text-left outline-none hover:bg-muted/60 focus-visible:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset disabled:pointer-events-none aria-[current=true]:bg-muted/60"
                      >
                        {isPlaying ? (
                          <PlayIcon
                            aria-hidden="true"
                            className="size-4 shrink-0 fill-primary text-primary"
                          />
                        ) : lesson.state === "done" ? (
                          <CircleCheckIcon
                            aria-hidden="true"
                            className="size-4 shrink-0 text-primary"
                          />
                        ) : lesson.state === "locked" ? (
                          <LockIcon
                            aria-hidden="true"
                            className="size-4 shrink-0 text-muted-foreground"
                          />
                        ) : (
                          <PlayIcon
                            aria-hidden="true"
                            className="size-4 shrink-0 text-muted-foreground"
                          />
                        )}
                        <span
                          className={
                            lesson.state === "locked"
                              ? "min-w-0 flex-1 text-muted-foreground"
                              : isPlaying
                                ? "min-w-0 flex-1 font-medium"
                                : "min-w-0 flex-1"
                          }
                        >
                          {lesson.title}
                          {isPlaying || lesson.state === "next" ? null : (
                            <span className="sr-only">
                              {`, ${stateLabel[lesson.state]}`}
                            </span>
                          )}
                        </span>
                        {isPlaying ? (
                          <span className="shrink-0 text-xs font-medium text-primary max-sm:sr-only">
                            Playing
                          </span>
                        ) : lesson.state === "next" ? (
                          <span className="shrink-0 text-xs font-medium text-primary max-sm:sr-only">
                            Up next
                          </span>
                        ) : null}
                        <span className="text-xs text-muted-foreground tabular-nums">
                          {lesson.minutes} min
                        </span>
                      </button>
                    </li>
                    );
                  })}
                </ol>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
      <p className="text-xs text-muted-foreground">
        Module 3 unlocks when you finish Building components.
      </p>
    </div>
  );
}
