"use client";

import {
  ArrowDown,
  ArrowUp,
  CopyPlus,
  FileVideo,
  Heading2,
  ImageIcon,
  ListTodo,
  Paperclip,
  Pilcrow,
  Plus,
  Quote,
  Repeat2,
  Trash2,
} from "lucide-react";
import * as React from "react";

import { cn } from "cn";

import { Checkbox } from "@/registry/base/ui/checkbox";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/registry/base/ui/context-menu";

// macOS browsers never turn Shift+F10 into a contextmenu event (Windows and
// Linux do), so the shortcut the hint advertises is forwarded by hand there.
function openMenuWithShiftF10(event: React.KeyboardEvent<HTMLElement>) {
  if (event.key !== "F10" || !event.shiftKey) return;
  if (!/Mac|iPhone|iPad/.test(navigator.userAgent)) return;
  event.preventDefault();
  const rect = event.currentTarget.getBoundingClientRect();
  event.currentTarget.dispatchEvent(
    new MouseEvent("contextmenu", {
      bubbles: true,
      cancelable: true,
      clientX: rect.left + 8,
      clientY: rect.top + 8,
    }),
  );
}

type TextType = "text" | "heading" | "quote" | "todo";
type MediaType = "image" | "video" | "file";

type Block = {
  id: string;
  type: TextType | MediaType;
  text: string;
  done?: boolean;
};

const textTypes: { value: TextType; label: string; icon: typeof Pilcrow }[] = [
  { value: "text", label: "Text", icon: Pilcrow },
  { value: "heading", label: "Heading", icon: Heading2 },
  { value: "quote", label: "Quote", icon: Quote },
  { value: "todo", label: "To-do", icon: ListTodo },
];

const mediaTypes: { value: MediaType; label: string; icon: typeof Pilcrow }[] =
  [
    { value: "image", label: "Image", icon: ImageIcon },
    { value: "video", label: "Video embed", icon: FileVideo },
    { value: "file", label: "File attachment", icon: Paperclip },
  ];

const initialBlocks: Block[] = [
  { id: "b1", type: "heading", text: "What went well" },
  {
    id: "b2",
    type: "text",
    text: "Checkout conversion held at 3.8% through the launch-day traffic spike.",
  },
  {
    id: "b3",
    type: "quote",
    text: "The status page update went out before the first support ticket.",
  },
  {
    id: "b4",
    type: "todo",
    text: "Write the incident timeline for the billing outage",
    done: false,
  },
];

const placeholder: Record<Block["type"], string> = {
  text: "New paragraph",
  heading: "New section",
  quote: "Add a quote",
  todo: "New task",
  image: "Image · drop a file or paste a link",
  video: "Video · paste a YouTube or Loom link",
  file: "Attachment · up to 25 MB",
};

function labelOf(type: Block["type"]) {
  return (
    [...textTypes, ...mediaTypes].find((item) => item.value === type)?.label ??
    type
  );
}

export default function ContextMenu06() {
  const [blocks, setBlocks] = React.useState(initialBlocks);
  const [status, setStatus] = React.useState("");
  const counter = React.useRef(0);
  const hintId = React.useId();

  function insertAfter(index: number, type: Block["type"]) {
    counter.current += 1;
    const block: Block = {
      id: `new-${counter.current}`,
      type,
      text: placeholder[type],
      done: type === "todo" ? false : undefined,
    };
    setBlocks((current) => [
      ...current.slice(0, index + 1),
      block,
      ...current.slice(index + 1),
    ]);
    setStatus(`${labelOf(type)} block inserted.`);
  }

  function move(index: number, offset: -1 | 1) {
    setBlocks((current) => {
      const next = [...current];
      const [block] = next.splice(index, 1);
      next.splice(index + offset, 0, block);
      return next;
    });
    setStatus(offset < 0 ? "Block moved up." : "Block moved down.");
  }

  function patch(id: string, next: Partial<Block>) {
    setBlocks((current) =>
      current.map((block) => (block.id === id ? { ...block, ...next } : block)),
    );
  }

  return (
    <article className="flex w-full max-w-md flex-col gap-3 rounded-xl border bg-card p-5 text-card-foreground">
      <header>
        <h3 className="text-base font-semibold">Launch retro · Oct 2</h3>
        <p id={hintId} className="text-xs text-muted-foreground">
          Right-click a block, or focus it and press Shift+F10, to transform,
          insert, or reorder.
        </p>
      </header>
      <div className="flex flex-col gap-1">
        {blocks.map((block, index) => {
          const media = mediaTypes.find((item) => item.value === block.type);
          const isMedia = media !== undefined;
          const MediaIcon = media?.icon ?? Paperclip;
          return (
            <ContextMenu key={block.id}>
              <ContextMenuTrigger
                onKeyDown={openMenuWithShiftF10}
                tabIndex={0}
                aria-describedby={hintId}
                className={cn(
                  "-mx-2 rounded-md px-2 py-1 outline-none transition-colors hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50 data-popup-open:bg-muted",
                  block.type === "heading" && "pt-2 text-base font-semibold",
                  block.type === "text" && "text-sm leading-relaxed",
                  block.type === "quote" &&
                    "border-l-2 border-border text-sm text-muted-foreground italic",
                )}
              >
                {block.type === "todo" ? (
                  <span className="flex items-start gap-2 text-sm">
                    <Checkbox
                      aria-label={block.text}
                      checked={block.done}
                      onCheckedChange={(checked) =>
                        patch(block.id, { done: checked })
                      }
                      className="mt-0.5"
                    />
                    <span
                      className={cn(
                        block.done && "text-muted-foreground line-through",
                      )}
                    >
                      {block.text}
                    </span>
                  </span>
                ) : isMedia ? (
                  <span className="flex items-center gap-2 rounded-md border border-dashed bg-muted/40 px-3 py-4 text-xs text-muted-foreground">
                    <MediaIcon aria-hidden="true" className="size-4 shrink-0" />
                    {block.text}
                  </span>
                ) : (
                  block.text
                )}
              </ContextMenuTrigger>
              <ContextMenuContent className="w-56">
                <ContextMenuSub>
                  <ContextMenuSubTrigger disabled={isMedia}>
                    <Repeat2 aria-hidden="true" />
                    Turn into
                  </ContextMenuSubTrigger>
                  <ContextMenuSubContent className="w-44">
                    <ContextMenuRadioGroup
                      value={block.type}
                      onValueChange={(value) => {
                        const type = value as TextType;
                        patch(block.id, {
                          type,
                          done: type === "todo" ? false : undefined,
                        });
                        setStatus(`Block turned into ${labelOf(type)}.`);
                      }}
                    >
                      {textTypes.map(({ value, label, icon: Icon }) => (
                        <ContextMenuRadioItem key={value} value={value}>
                          <Icon aria-hidden="true" />
                          {label}
                        </ContextMenuRadioItem>
                      ))}
                    </ContextMenuRadioGroup>
                  </ContextMenuSubContent>
                </ContextMenuSub>
                <ContextMenuSub>
                  <ContextMenuSubTrigger>
                    <Plus aria-hidden="true" />
                    Insert below
                  </ContextMenuSubTrigger>
                  <ContextMenuSubContent className="w-48">
                    <ContextMenuGroup>
                      <ContextMenuLabel>Basic blocks</ContextMenuLabel>
                      {textTypes.map(({ value, label, icon: Icon }) => (
                        <ContextMenuItem
                          key={value}
                          onClick={() => insertAfter(index, value)}
                        >
                          <Icon aria-hidden="true" />
                          {label}
                        </ContextMenuItem>
                      ))}
                    </ContextMenuGroup>
                    <ContextMenuSeparator />
                    <ContextMenuSub>
                      <ContextMenuSubTrigger>
                        <ImageIcon aria-hidden="true" />
                        Media
                      </ContextMenuSubTrigger>
                      <ContextMenuSubContent className="w-48">
                        {mediaTypes.map(({ value, label, icon: Icon }) => (
                          <ContextMenuItem
                            key={value}
                            onClick={() => insertAfter(index, value)}
                          >
                            <Icon aria-hidden="true" />
                            {label}
                          </ContextMenuItem>
                        ))}
                      </ContextMenuSubContent>
                    </ContextMenuSub>
                  </ContextMenuSubContent>
                </ContextMenuSub>
                <ContextMenuItem
                  onClick={() => {
                    counter.current += 1;
                    const copy = { ...block, id: `copy-${counter.current}` };
                    setBlocks((current) => [
                      ...current.slice(0, index + 1),
                      copy,
                      ...current.slice(index + 1),
                    ]);
                    setStatus("Block duplicated.");
                  }}
                >
                  <CopyPlus aria-hidden="true" />
                  Duplicate
                  <ContextMenuShortcut>⌘D</ContextMenuShortcut>
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                >
                  <ArrowUp aria-hidden="true" />
                  Move up
                  <ContextMenuShortcut>⌥⇧↑</ContextMenuShortcut>
                </ContextMenuItem>
                <ContextMenuItem
                  disabled={index === blocks.length - 1}
                  onClick={() => move(index, 1)}
                >
                  <ArrowDown aria-hidden="true" />
                  Move down
                  <ContextMenuShortcut>⌥⇧↓</ContextMenuShortcut>
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem
                  variant="destructive"
                  disabled={blocks.length === 1}
                  onClick={() => {
                    setBlocks((current) =>
                      current.filter((item) => item.id !== block.id),
                    );
                    setStatus(`${labelOf(block.type)} block deleted.`);
                  }}
                >
                  <Trash2 aria-hidden="true" />
                  Delete block
                  <ContextMenuShortcut>⌫</ContextMenuShortcut>
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          );
        })}
      </div>
      <p
        aria-live="polite"
        className="border-t pt-3 text-xs text-muted-foreground tabular-nums"
      >
        {status || `${blocks.length} blocks`}
      </p>
    </article>
  );
}
