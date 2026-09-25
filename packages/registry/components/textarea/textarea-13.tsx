"use client";

import { MessageSquarePlusIcon } from "lucide-react";
import { useId, useState } from "react";

import { Avatar, AvatarFallback } from "@/registry/base/ui/avatar";
import { Button } from "@/registry/base/ui/button";
import { Label } from "@/registry/base/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/registry/base/ui/tabs";
import { Textarea } from "@/registry/base/ui/textarea";

type Line = { number: number; kind: "context" | "add" | "remove"; code: string };

const diff: Line[] = [
  { number: 41, kind: "context", code: "export async function retry(fn, opts) {" },
  { number: 42, kind: "remove", code: "  const attempts = 3;" },
  { number: 42, kind: "add", code: "  const attempts = opts.attempts ?? 5;" },
  { number: 43, kind: "add", code: "  const delay = opts.delay ?? 200;" },
  { number: 44, kind: "context", code: "  for (let i = 0; i < attempts; i++) {" },
];

const markers = { context: " ", add: "+", remove: "-" } as const;

type Comment = { id: number; line: number; body: string };

export default function Textarea13() {
  const id = useId();
  const [openLine, setOpenLine] = useState<number | null>(43);
  const [draft, setDraft] = useState(
    "Should `delay` back off exponentially? A flat 200ms will hammer the API when it's already struggling.",
  );
  const [comments, setComments] = useState<Comment[]>([]);

  const submit = () => {
    if (openLine === null || !draft.trim()) return;
    setComments((current) => [
      ...current,
      { id: current.length + 1, line: openLine, body: draft.trim() },
    ]);
    setDraft("");
    setOpenLine(null);
  };

  return (
    <div className="w-full max-w-xl overflow-hidden rounded-xl border border-border bg-card text-card-foreground">
      <div className="border-b border-border bg-muted/40 px-3 py-2 font-mono text-xs text-muted-foreground">
        src/lib/retry.ts
      </div>
      <div className="font-mono text-xs">
        {diff.map((line, index) => {
          const key = `${line.kind}-${line.number}-${index}`;
          const lineComments = comments.filter(
            (comment) => line.kind !== "remove" && comment.line === line.number,
          );
          const isOpen = line.kind !== "remove" && openLine === line.number;
          return (
            <div key={key}>
              <div
                className={
                  line.kind === "add"
                    ? "group flex items-stretch bg-success/10"
                    : line.kind === "remove"
                      ? "group flex items-stretch bg-destructive/10"
                      : "group flex items-stretch"
                }
              >
                <span className="w-10 shrink-0 py-1 pr-2 text-right text-muted-foreground tabular-nums select-none">
                  {line.number}
                </span>
                <span className="w-4 shrink-0 py-1 text-muted-foreground select-none">
                  {markers[line.kind]}
                </span>
                <code className="min-w-0 flex-1 overflow-x-auto py-1 pr-2 whitespace-pre">
                  {line.code}
                </code>
                {line.kind !== "remove" ? (
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    aria-label={`Comment on line ${line.number}`}
                    aria-expanded={isOpen}
                    onClick={() => setOpenLine(isOpen ? null : line.number)}
                    className="my-0.5 mr-1 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100 sm:aria-expanded:opacity-100"
                  >
                    <MessageSquarePlusIcon aria-hidden="true" />
                  </Button>
                ) : null}
              </div>

              {lineComments.map((comment) => (
                <div
                  key={comment.id}
                  className="flex gap-2 border-y border-border bg-background px-3 py-3 font-sans"
                >
                  <Avatar size="sm">
                    <AvatarFallback>SK</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 text-sm">
                    <p className="font-medium">Sam Kowalski</p>
                    <p className="break-words whitespace-pre-wrap text-muted-foreground">
                      {comment.body}
                    </p>
                  </div>
                </div>
              ))}

              {isOpen ? (
                <div className="border-y border-border bg-background p-3 font-sans">
                  <Tabs defaultValue="write" className="gap-2">
                    <TabsList>
                      <TabsTrigger value="write">Write</TabsTrigger>
                      <TabsTrigger value="preview">Preview</TabsTrigger>
                    </TabsList>
                    <TabsContent value="write" className="flex flex-col gap-2">
                      <Label htmlFor={`${id}-comment`} className="sr-only">
                        Comment on line {line.number}
                      </Label>
                      <Textarea
                        id={`${id}-comment`}
                        value={draft}
                        onChange={(event) => setDraft(event.target.value)}
                        placeholder="Leave a comment. Wrap code in backticks."
                        className="min-h-20 text-sm md:text-sm"
                      />
                    </TabsContent>
                    <TabsContent value="preview">
                      <p className="min-h-20 rounded-lg border border-dashed border-border px-2.5 py-2 text-sm break-words whitespace-pre-wrap">
                        {draft.trim()
                          ? draft.split(/(`[^`]+`)/g).map((part, partIndex) =>
                              part.startsWith("`") && part.endsWith("`") ? (
                                <code
                                  // biome-ignore lint/suspicious/noArrayIndexKey: parts are positional
                                  key={partIndex}
                                  className="rounded bg-muted px-1 py-0.5 font-mono text-xs"
                                >
                                  {part.slice(1, -1)}
                                </code>
                              ) : (
                                part
                              ),
                            )
                          : "Nothing to preview."}
                      </p>
                    </TabsContent>
                  </Tabs>
                  <div className="mt-2 flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setOpenLine(null)}
                    >
                      Cancel
                    </Button>
                    <Button size="sm" disabled={!draft.trim()} onClick={submit}>
                      Add comment
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
