"use client";

import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  Redo2,
  Strikethrough,
  Underline,
  Undo2,
} from "lucide-react";
import * as React from "react";

import { Button } from "@/registry/base/ui/button";
import { ButtonGroup } from "@/registry/base/ui/button-group";

type Mark = "bold" | "italic" | "underline" | "strike";
type Align = "left" | "center" | "right";
type Format = { marks: Mark[]; align: Align };

const marks = [
  { value: "bold", label: "Bold", icon: Bold, className: "font-semibold" },
  { value: "italic", label: "Italic", icon: Italic, className: "italic" },
  {
    value: "underline",
    label: "Underline",
    icon: Underline,
    className: "underline underline-offset-4",
  },
  {
    value: "strike",
    label: "Strikethrough",
    icon: Strikethrough,
    className: "line-through",
  },
] as const;

const alignments = [
  {
    value: "left",
    label: "Align left",
    icon: AlignLeft,
    className: "text-left",
  },
  {
    value: "center",
    label: "Align center",
    icon: AlignCenter,
    className: "text-center",
  },
  {
    value: "right",
    label: "Align right",
    icon: AlignRight,
    className: "text-right",
  },
] as const;

const pressedClass =
  "aria-pressed:bg-muted aria-pressed:text-foreground dark:aria-pressed:bg-input/60";

export default function ButtonGroup06() {
  const [history, setHistory] = React.useState<Format[]>([
    { marks: ["bold"], align: "left" },
  ]);
  const [cursor, setCursor] = React.useState(0);
  const format = history[cursor];

  function commit(next: Format) {
    setHistory((prev) => [...prev.slice(0, cursor + 1), next]);
    setCursor((c) => c + 1);
  }

  function toggleMark(mark: Mark) {
    const has = format.marks.includes(mark);
    commit({
      ...format,
      marks: has
        ? format.marks.filter((m) => m !== mark)
        : [...format.marks, mark],
    });
  }

  const textClass = [
    ...marks
      .filter((m) => format.marks.includes(m.value))
      .map((m) => m.className),
    alignments.find((a) => a.value === format.align)?.className,
  ].join(" ");

  return (
    <div className="flex w-full max-w-md flex-col overflow-hidden rounded-xl border border-border bg-card">
      <div className="border-b border-border bg-muted/40 p-2">
        <ButtonGroup aria-label="Text formatting" className="flex-wrap">
          <ButtonGroup aria-label="History">
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="Undo"
              disabled={cursor === 0}
              onClick={() => setCursor((c) => c - 1)}
            >
              <Undo2 aria-hidden="true" />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="Redo"
              disabled={cursor === history.length - 1}
              onClick={() => setCursor((c) => c + 1)}
            >
              <Redo2 aria-hidden="true" />
            </Button>
          </ButtonGroup>
          <ButtonGroup aria-label="Text style">
            {marks.map((mark) => (
              <Button
                key={mark.value}
                variant="outline"
                size="icon-sm"
                aria-label={mark.label}
                aria-pressed={format.marks.includes(mark.value)}
                onClick={() => toggleMark(mark.value)}
                className={pressedClass}
              >
                <mark.icon aria-hidden="true" />
              </Button>
            ))}
          </ButtonGroup>
          <ButtonGroup aria-label="Alignment">
            {alignments.map((alignment) => (
              <Button
                key={alignment.value}
                variant="outline"
                size="icon-sm"
                aria-label={alignment.label}
                aria-pressed={format.align === alignment.value}
                onClick={() => {
                  if (format.align !== alignment.value) {
                    commit({ ...format, align: alignment.value });
                  }
                }}
                className={pressedClass}
              >
                <alignment.icon aria-hidden="true" />
              </Button>
            ))}
          </ButtonGroup>
        </ButtonGroup>
      </div>
      <p className={`p-4 text-sm leading-relaxed ${textClass}`}>
        Release notes ship every Thursday. Draft yours before noon so the docs
        team has time to review.
      </p>
    </div>
  );
}
