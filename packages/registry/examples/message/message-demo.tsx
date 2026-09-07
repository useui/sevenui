"use client";

import { Avatar, AvatarFallback } from "@/registry/base/ui/avatar";
import { Bubble, BubbleContent } from "@/registry/base/ui/bubble";
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageGroup,
  MessageHeader,
} from "@/registry/base/ui/message";

export default function MessageDemo() {
  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <Message>
        <MessageAvatar>
          <Avatar className="size-8">
            <AvatarFallback>EC</AvatarFallback>
          </Avatar>
        </MessageAvatar>
        <MessageContent>
          <MessageHeader>Emma · 09:41</MessageHeader>
          <MessageGroup>
            <Bubble variant="muted">
              <BubbleContent>
                Hey! Did you get a chance to look at the new landing page?
              </BubbleContent>
            </Bubble>
            <Bubble variant="muted">
              <BubbleContent>No rush — just curious.</BubbleContent>
            </Bubble>
          </MessageGroup>
        </MessageContent>
      </Message>
      <Message align="end">
        <MessageContent>
          <Bubble align="end">
            <BubbleContent>
              Just did — the exposed grid looks great on mobile.
            </BubbleContent>
          </Bubble>
          <MessageFooter>Delivered</MessageFooter>
        </MessageContent>
      </Message>
    </div>
  );
}
