"use client";

import { FileSpreadsheetIcon } from "lucide-react";

import {
  Attachment,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from "@/registry/base/ui/attachment";

const sizes = [
  { size: "default", label: "Default", hint: "Composers, detail views" },
  { size: "sm", label: "Small", hint: "Message threads, lists" },
  { size: "xs", label: "Extra small", hint: "Table cells, dense feeds" },
] as const;

export default function Attachment01() {
  return (
    <ul className="flex w-full max-w-sm flex-col divide-y divide-border rounded-xl border border-border">
      {sizes.map((item) => (
        <li
          key={item.size}
          className="flex flex-col gap-2.5 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
        >
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="text-sm font-medium">{item.label}</span>
            <span className="text-xs text-muted-foreground">{item.hint}</span>
          </div>
          <Attachment size={item.size} className="w-full sm:w-52">
            <AttachmentMedia>
              <FileSpreadsheetIcon aria-hidden="true" />
            </AttachmentMedia>
            <AttachmentContent>
              <AttachmentTitle>q3-revenue-forecast.xlsx</AttachmentTitle>
              <AttachmentDescription>418 KB · Spreadsheet</AttachmentDescription>
            </AttachmentContent>
          </Attachment>
        </li>
      ))}
    </ul>
  );
}
