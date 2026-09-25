"use client";

import {
  FileSpreadsheetIcon,
  FileTextIcon,
  FileVideoIcon,
  ImageIcon,
  LinkIcon,
  LockIcon,
  UsersIcon,
} from "lucide-react";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/registry/base/ui/hover-card";

type Sharing = "private" | "team" | "link";

type FileEntry = {
  name: string;
  kind: string;
  icon: typeof FileTextIcon;
  size: string;
  modified: string;
  modifiedBy: string;
  sharing: Sharing;
  facts: { label: string; value: string }[];
  preview: "image" | "text" | "none";
  excerpt?: string;
};

const files: FileEntry[] = [
  {
    name: "storefront-hero.png",
    kind: "PNG image",
    icon: ImageIcon,
    size: "2.4 MB",
    modified: "Today, 9:41 AM",
    modifiedBy: "Hana Ito",
    sharing: "team",
    facts: [
      { label: "Dimensions", value: "2880 × 1620" },
      { label: "Color profile", value: "Display P3" },
    ],
    preview: "image",
  },
  {
    name: "launch-brief.md",
    kind: "Markdown",
    icon: FileTextIcon,
    size: "18 KB",
    modified: "Yesterday",
    modifiedBy: "Omar Haddad",
    sharing: "link",
    facts: [
      { label: "Words", value: "1,284" },
      { label: "Versions", value: "7" },
    ],
    preview: "text",
    excerpt:
      "The autumn launch moves the storefront to the new checkout. Goals: cut drop-off at the shipping step by 15% and ship gift cards to every region.",
  },
  {
    name: "q3-returns.csv",
    kind: "CSV spreadsheet",
    icon: FileSpreadsheetIcon,
    size: "640 KB",
    modified: "Sep 21",
    modifiedBy: "Hana Ito",
    sharing: "private",
    facts: [
      { label: "Rows", value: "9,812" },
      { label: "Columns", value: "14" },
    ],
    preview: "none",
  },
  {
    name: "unboxing-cut-v2.mp4",
    kind: "MPEG-4 video",
    icon: FileVideoIcon,
    size: "148 MB",
    modified: "Sep 18",
    modifiedBy: "Lucas Brandt",
    sharing: "team",
    facts: [
      { label: "Duration", value: "1:42" },
      { label: "Resolution", value: "1080p" },
    ],
    preview: "image",
  },
];

const sharingMeta: Record<Sharing, { label: string; icon: typeof LockIcon }> =
  {
    private: { label: "Private to you", icon: LockIcon },
    team: { label: "Shared with Marketing", icon: UsersIcon },
    link: { label: "Anyone with the link can view", icon: LinkIcon },
  };

function FilePreview({ file }: { file: FileEntry }) {
  const Icon = file.icon;

  if (file.preview === "image") {
    return (
      <img
        src="/placeholder.svg"
        alt={`Preview of ${file.name}`}
        className="aspect-video w-full rounded-t-lg bg-muted object-cover"
      />
    );
  }

  if (file.preview === "text") {
    return (
      <div className="rounded-t-lg bg-muted px-3 py-2.5">
        <p className="line-clamp-4 font-mono text-[0.7rem] leading-relaxed text-muted-foreground">
          {file.excerpt}
        </p>
      </div>
    );
  }

  return (
    <div className="flex aspect-[3/1] w-full flex-col items-center justify-center gap-1 rounded-t-lg bg-muted text-muted-foreground">
      <Icon aria-hidden="true" className="size-5" />
      <span className="text-xs">No preview for this file type</span>
    </div>
  );
}

export default function HoverCard11() {
  return (
    <section
      aria-labelledby="hover-card-11-title"
      className="w-full max-w-md rounded-xl border bg-card text-card-foreground"
    >
      <header className="flex items-baseline justify-between gap-2 border-b px-4 py-3">
        <h3 id="hover-card-11-title" className="text-sm font-medium">
          Autumn launch
        </h3>
        <span className="text-xs text-muted-foreground">4 files · 151 MB</span>
      </header>
      <ul className="divide-y">
        {files.map((file) => {
          const Icon = file.icon;
          const sharing = sharingMeta[file.sharing];
          const SharingIcon = sharing.icon;

          return (
            <li
              key={file.name}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50"
            >
              <Icon
                aria-hidden="true"
                className="size-4 shrink-0 text-muted-foreground"
              />
              <HoverCard>
                <HoverCardTrigger
                  href={`#file-${file.name}`}
                  delay={400}
                  className="min-w-0 flex-1 truncate rounded-sm text-sm outline-none hover:underline hover:underline-offset-4 focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  {file.name}
                </HoverCardTrigger>
                <HoverCardContent
                  side="right"
                  align="start"
                  className="w-64 max-w-[calc(100vw-2rem)] p-0"
                >
                  <FilePreview file={file} />
                  <div className="grid gap-2.5 p-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {file.kind} · {file.size}
                      </p>
                    </div>
                    <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
                      {file.facts.map((fact) => (
                        <div key={fact.label} className="contents">
                          <dt className="text-muted-foreground">
                            {fact.label}
                          </dt>
                          <dd className="text-right tabular-nums">
                            {fact.value}
                          </dd>
                        </div>
                      ))}
                      <dt className="text-muted-foreground">Modified</dt>
                      <dd className="truncate text-right">
                        {file.modified} by {file.modifiedBy.split(" ")[0]}
                      </dd>
                    </dl>
                    <p className="flex items-center gap-1.5 border-t pt-2.5 text-xs text-muted-foreground">
                      <SharingIcon
                        aria-hidden="true"
                        className="size-3.5 shrink-0"
                      />
                      {sharing.label}
                    </p>
                  </div>
                </HoverCardContent>
              </HoverCard>
              <span className="hidden shrink-0 text-xs text-muted-foreground sm:inline">
                {file.modified}
              </span>
              <span className="w-14 shrink-0 text-right text-xs text-muted-foreground tabular-nums">
                {file.size}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
