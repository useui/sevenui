"use client";

import { ArrowUpRightIcon, DownloadIcon, FileTextIcon } from "lucide-react";

import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from "@/registry/base/ui/attachment";
import { Bubble, BubbleContent, BubbleGroup } from "@/registry/base/ui/bubble";

export default function Bubble07() {
  return (
    <div
      role="log"
      aria-label="Shared media"
      className="flex w-full max-w-md flex-col gap-4"
    >
      <BubbleGroup className="gap-1">
        <Bubble variant="muted">
          <BubbleContent className="flex flex-col gap-2 p-1.5 pb-2.5">
            <img
              src="/placeholder.svg"
              alt="Moodboard for the autumn campaign with three product shots"
              width={320}
              height={200}
              className="aspect-16/10 w-full max-w-72 rounded-[1.1rem] bg-background object-cover"
            />
            <span className="px-1.5">Moodboard for the autumn campaign.</span>
          </BubbleContent>
        </Bubble>
        <Bubble variant="ghost">
          <Attachment className="w-full max-w-72">
            <AttachmentMedia>
              <FileTextIcon aria-hidden="true" />
            </AttachmentMedia>
            <AttachmentContent>
              <AttachmentTitle>campaign-brief-v3.pdf</AttachmentTitle>
              <AttachmentDescription>PDF · 2.4 MB</AttachmentDescription>
            </AttachmentContent>
            <AttachmentActions>
              <AttachmentAction aria-label="Download campaign-brief-v3.pdf">
                <DownloadIcon aria-hidden="true" />
              </AttachmentAction>
            </AttachmentActions>
          </Attachment>
        </Bubble>
      </BubbleGroup>
      <Bubble variant="outline" align="end">
        <BubbleContent
          render={<a href="#figma-file" />}
          className="flex max-w-72 flex-col gap-1 p-3"
        >
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            figma.com
            <ArrowUpRightIcon aria-hidden="true" className="size-3" />
          </span>
          <span className="font-medium">Autumn campaign — key visuals</span>
          <span className="line-clamp-2 text-muted-foreground">
            12 frames, updated 2 hours ago by Priya Nair. Comments are open for
            the product team.
          </span>
        </BubbleContent>
      </Bubble>
    </div>
  );
}
