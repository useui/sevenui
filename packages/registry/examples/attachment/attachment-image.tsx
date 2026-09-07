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
