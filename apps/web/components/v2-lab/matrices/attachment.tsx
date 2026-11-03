"use client";

import { FileTextIcon, XIcon } from "lucide-react";
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
  AttachmentTrigger,
} from "@/registry/base/ui/attachment";
import { LabSection } from "../lab-frame";

const SIZES = ["default", "sm", "xs"] as const;
const STATES = ["done", "idle", "uploading", "processing", "error"] as const;

function Tile({
  size,
  state = "done",
  orientation = "horizontal",
  image = false,
}: {
  size: (typeof SIZES)[number];
  state?: (typeof STATES)[number];
  orientation?: "horizontal" | "vertical";
  image?: boolean;
}) {
  return (
    <Attachment size={size} state={state} orientation={orientation}>
      <AttachmentMedia variant={image ? "image" : "icon"}>
        {image ? <img src="/placeholder.svg" alt="" /> : <FileTextIcon />}
      </AttachmentMedia>
      <AttachmentContent>
        <AttachmentTitle>quarterly-report.pdf</AttachmentTitle>
        <AttachmentDescription>{state === "error" ? "Upload failed" : `1.2 MB · ${state}`}</AttachmentDescription>
      </AttachmentContent>
      <AttachmentActions>
        <AttachmentAction aria-label="Remove quarterly-report.pdf">
          <XIcon />
        </AttachmentAction>
      </AttachmentActions>
      <AttachmentTrigger aria-label="Preview quarterly-report.pdf" />
    </Attachment>
  );
}

export default function AttachmentMatrix() {
  return (
    <div>
      {SIZES.map((size) => (
        <LabSection key={size} title={`size=${size}, horizontal, states`}>
          {STATES.map((state) => (
            <Tile key={state} size={size} state={state} />
          ))}
        </LabSection>
      ))}
      {SIZES.map((size) => (
        <LabSection key={size} title={`size=${size}, vertical, icon + image`}>
          <Tile size={size} orientation="vertical" />
          <Tile size={size} orientation="vertical" image />
          <Tile size={size} orientation="vertical" state="uploading" image />
        </LabSection>
      ))}
      <LabSection title="media only (no content), image">
        {SIZES.map((size) => (
          <Attachment key={size} size={size}>
            <AttachmentMedia variant="image">
              <img src="/placeholder.svg" alt="" />
            </AttachmentMedia>
          </Attachment>
        ))}
      </LabSection>
      <LabSection title="group (scrolls horizontally)">
        <AttachmentGroup className="w-full max-w-md">
          <Tile size="sm" />
          <Tile size="sm" state="uploading" />
          <Tile size="sm" state="error" />
          <Tile size="sm" />
        </AttachmentGroup>
      </LabSection>
    </div>
  );
}
