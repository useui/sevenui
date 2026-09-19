---
title: Attachment
description: Displays file attachments with media previews and actions.
---

```tsx
"use client";

import { FileTextIcon } from "lucide-react";

import {
  Attachment,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
} from "@/registry/base/ui/attachment";

export default function AttachmentDemo() {
  return (
    <AttachmentGroup className="w-full max-w-md">
      <Attachment>
        <AttachmentMedia>
          <FileTextIcon />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>quarterly-report.pdf</AttachmentTitle>
          <AttachmentDescription>1.2 MB · PDF</AttachmentDescription>
        </AttachmentContent>
      </Attachment>
      <Attachment>
        <AttachmentMedia variant="image">
          <img src="/placeholder.svg" alt="" />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>cover.png</AttachmentTitle>
          <AttachmentDescription>96 KB</AttachmentDescription>
        </AttachmentContent>
      </Attachment>
    </AttachmentGroup>
  );
}
```

## Installation

<InstallCommand item="attachment" />

## Usage

```tsx
import { FileTextIcon } from "lucide-react";

import {
  Attachment,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment";

export function ReportAttachment() {
  return (
    <Attachment>
      <AttachmentMedia>
        <FileTextIcon />
      </AttachmentMedia>
      <AttachmentContent>
        <AttachmentTitle>quarterly-report.pdf</AttachmentTitle>
        <AttachmentDescription>1.2 MB · PDF</AttachmentDescription>
      </AttachmentContent>
    </Attachment>
  );
}
```

Built for chat composers, message threads, and upload lists. Wrap
multiple attachments in `AttachmentGroup` for a snap-scrolling row. The
`state` prop drives the upload lifecycle styling: `idle` renders a
dashed border, `uploading`/`processing` shimmer the title, and `error`
turns the media and description destructive.

## Examples

### Image cards

`orientation="vertical"` turns attachments into image-first cards —
suited for photo pickers and gallery uploads.

```tsx
"use client";

import {
  Attachment,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
} from "@/registry/base/ui/attachment";

const images = [
  { name: "hero-light.png", size: "128 KB" },
  { name: "hero-dark.png", size: "132 KB" },
  { name: "og-image.png", size: "96 KB" },
];

export default function AttachmentImage() {
  return (
    <AttachmentGroup className="w-full max-w-md">
      {images.map((image) => (
        <Attachment key={image.name} orientation="vertical">
          <AttachmentMedia variant="image">
            <img src="/placeholder.svg" alt="" />
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>{image.name}</AttachmentTitle>
            <AttachmentDescription>{image.size}</AttachmentDescription>
          </AttachmentContent>
        </Attachment>
      ))}
    </AttachmentGroup>
  );
}
```

### Actions and upload state

`AttachmentActions` holds buttons that stay clickable above the
full-card `AttachmentTrigger` (the trigger sits behind them in stacking
order). Icon-only actions and triggers need `aria-label`s.

```tsx
"use client";

import { DownloadIcon, FileArchiveIcon, XIcon } from "lucide-react";

import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
  AttachmentTrigger,
} from "@/registry/base/ui/attachment";
import { Spinner } from "@/registry/base/ui/spinner";

export default function AttachmentActionsDemo() {
  return (
    <div className="flex w-full max-w-xs flex-col gap-3">
      <Attachment size="sm" className="w-full">
        <AttachmentMedia>
          <FileArchiveIcon />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>design-assets.zip</AttachmentTitle>
          <AttachmentDescription>24 MB</AttachmentDescription>
        </AttachmentContent>
        <AttachmentActions>
          <AttachmentAction aria-label="Download design-assets.zip">
            <DownloadIcon />
          </AttachmentAction>
          <AttachmentAction aria-label="Remove design-assets.zip">
            <XIcon />
          </AttachmentAction>
        </AttachmentActions>
        <AttachmentTrigger aria-label="Preview design-assets.zip" />
      </Attachment>
      <Attachment size="xs" state="uploading" className="w-full">
        <AttachmentMedia>
          <Spinner />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>screen-recording.mp4</AttachmentTitle>
          <AttachmentDescription>Uploading…</AttachmentDescription>
        </AttachmentContent>
      </Attachment>
    </div>
  );
}
```

## API reference

### Attachment

Extends `div`.

| Prop          | Type                                                          | Default        |
| ------------- | ------------------------------------------------------------- | -------------- |
| `size`        | `"default" \| "sm" \| "xs"`                                   | `"default"`    |
| `orientation` | `"horizontal" \| "vertical"`                                  | `"horizontal"` |
| `state`       | `"idle" \| "uploading" \| "processing" \| "error" \| "done"`  | `"done"`       |

### AttachmentMedia

Extends `div`.

| Prop      | Type                  | Default  |
| --------- | --------------------- | -------- |
| `variant` | `"icon" \| "image"`   | `"icon"` |

`image` expects an `img` child and dims it while uploading; `icon` sizes
a single icon (or a spinner during uploads).

### AttachmentAction

Extends [Button](/docs/components/button) — all Button props apply.
Defaults to `variant="ghost"` and `size="icon-xs"`.

### AttachmentTrigger

An invisible full-card `button` (swap the element via the Base UI
`render` prop, for example `render={<a href="…" />}`). Give it an
`aria-label` describing the open/preview action.

### AttachmentGroup, AttachmentContent, AttachmentTitle, AttachmentDescription, AttachmentActions

Structural wrappers (`div`/`span`) accepting standard element props.
