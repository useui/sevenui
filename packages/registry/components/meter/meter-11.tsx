"use client";

import { FileArchive, FileVideo, Folder, HardDrive } from "lucide-react";
import * as React from "react";

import { Button } from "@/registry/base/ui/button";
import { Checkbox } from "@/registry/base/ui/checkbox";
import { Meter, MeterLabel, MeterValue } from "@/registry/base/ui/meter";

const QUOTA = 20;

const initialFiles = [
  {
    id: "launch-recording",
    name: "Q3 launch recording.mov",
    location: "Marketing / Video",
    size: 4.8,
    icon: FileVideo,
  },
  {
    id: "design-backup",
    name: "design-system-backup-2025.zip",
    location: "Design / Archive",
    size: 3.2,
    icon: FileArchive,
  },
  {
    id: "raw-photos",
    name: "Offsite raw photos",
    location: "Shared / Events",
    size: 2.6,
    icon: Folder,
  },
  {
    id: "webinar",
    name: "Customer webinar, uncut.mp4",
    location: "Success / Recordings",
    size: 1.9,
    icon: FileVideo,
  },
];

const OTHER_USAGE = 6.1;

function gb(value: number) {
  return `${value.toFixed(1)} GB`;
}

export default function Meter11() {
  const [files, setFiles] = React.useState(initialFiles);
  const [selected, setSelected] = React.useState<string[]>([
    "launch-recording",
  ]);

  const used = OTHER_USAGE + files.reduce((total, file) => total + file.size, 0);
  const freed = files
    .filter((file) => selected.includes(file.id))
    .reduce((total, file) => total + file.size, 0);
  const after = used - freed;
  const critical = used / QUOTA >= 0.9;

  function toggle(id: string, checked: boolean) {
    setSelected((current) =>
      checked ? [...current, id] : current.filter((item) => item !== id),
    );
  }

  function moveToTrash() {
    setFiles((current) => current.filter((file) => !selected.includes(file.id)));
    setSelected([]);
  }

  return (
    <section
      aria-labelledby="meter-11-title"
      className="w-full max-w-md rounded-xl border bg-card text-card-foreground"
    >
      <div className="grid gap-4 p-4">
        <div className="flex items-center gap-2">
          <HardDrive
            aria-hidden="true"
            className="size-4 text-muted-foreground"
          />
          <h3 id="meter-11-title" className="font-medium">
            Free up space
          </h3>
        </div>

        <Meter
          value={used}
          max={QUOTA}
          getAriaValueText={() => `${gb(used)} of ${QUOTA} GB used`}
          className={
            critical
              ? "grid-cols-[1fr_auto] [&>div:last-of-type]:bg-destructive/15 [&>div:last-of-type>div]:bg-destructive"
              : "grid-cols-[1fr_auto]"
          }
        >
          <MeterLabel>Workspace storage</MeterLabel>
          <MeterValue className="tabular-nums">
            {() => `${gb(used)} of ${QUOTA} GB`}
          </MeterValue>
        </Meter>

        <Meter
          value={after}
          max={QUOTA}
          getAriaValueText={() =>
            `${gb(after)} of ${QUOTA} GB after removing selected files`
          }
          className="grid-cols-[1fr_auto] [&>div:last-of-type]:h-1.5 [&>div:last-of-type>div]:bg-primary/60"
        >
          <MeterLabel className="font-normal text-muted-foreground">
            After cleanup
          </MeterLabel>
          <MeterValue className="tabular-nums">
            {() => gb(after)}
          </MeterValue>
        </Meter>
      </div>

      <ul aria-label="Largest files" className="divide-y border-t">
        {files.map((file) => {
          const Icon = file.icon;
          return (
            <li key={file.id}>
              {/* biome-ignore lint/a11y/noLabelWithoutControl: the Checkbox renders the control inside the label */}
              <label className="flex cursor-pointer items-center gap-3 px-4 py-2.5 transition-colors hover:bg-muted/50">
                <Checkbox
                  checked={selected.includes(file.id)}
                  onCheckedChange={(checked) => toggle(file.id, checked)}
                />
                <Icon
                  aria-hidden="true"
                  className="size-4 shrink-0 text-muted-foreground"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">
                    {file.name}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {file.location}
                  </span>
                </span>
                <span className="text-sm text-muted-foreground tabular-nums">
                  {gb(file.size)}
                </span>
              </label>
            </li>
          );
        })}
        {files.length === 0 ? (
          <li className="px-4 py-6 text-center text-sm text-muted-foreground">
            No files over 1 GB left in this workspace.
          </li>
        ) : null}
      </ul>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t p-4">
        <p aria-live="polite" className="text-sm text-muted-foreground">
          {selected.length === 0
            ? "Select files to see what you would free."
            : `Frees ${gb(freed)} across ${selected.length} ${selected.length === 1 ? "item" : "items"}`}
        </p>
        <Button
          variant="destructive"
          size="sm"
          disabled={selected.length === 0}
          onClick={moveToTrash}
        >
          Move to trash
        </Button>
      </div>
    </section>
  );
}
