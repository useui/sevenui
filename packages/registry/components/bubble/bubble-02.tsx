"use client";

import { CheckCheckIcon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/registry/base/ui/avatar";
import { Bubble, BubbleContent, BubbleGroup } from "@/registry/base/ui/bubble";
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageGroup,
  MessageHeader,
} from "@/registry/base/ui/message";

export default function Bubble02() {
  return (
    <MessageGroup className="w-full max-w-md gap-5">
      <Message>
        <MessageAvatar>
          <Avatar>
            <AvatarImage src="/placeholder.svg" alt="" />
            <AvatarFallback>DO</AvatarFallback>
          </Avatar>
        </MessageAvatar>
        <MessageContent className="gap-1">
          <MessageHeader>
            Daniel Okafor
            <span className="ml-1.5 font-normal">· Support</span>
          </MessageHeader>
          <BubbleGroup className="gap-1">
            <Bubble variant="secondary">
              <BubbleContent>
                Your refund for order SO-48213 was approved this morning.
              </BubbleContent>
            </Bubble>
            <Bubble variant="secondary">
              <BubbleContent>
                It should reach your card within 3–5 business days.
              </BubbleContent>
            </Bubble>
          </BubbleGroup>
          <MessageFooter>
            <time dateTime="2026-09-25T09:41">9:41 AM</time>
          </MessageFooter>
        </MessageContent>
      </Message>
      <Message align="end">
        <MessageAvatar>
          <Avatar>
            <AvatarFallback>JL</AvatarFallback>
          </Avatar>
        </MessageAvatar>
        <MessageContent className="gap-1">
          <Bubble align="end">
            <BubbleContent>That was fast. Thanks, Daniel!</BubbleContent>
          </Bubble>
          <MessageFooter className="gap-1">
            <time dateTime="2026-09-25T09:43">9:43 AM</time>
            <span aria-hidden="true">·</span>
            <CheckCheckIcon aria-hidden="true" className="size-3.5" />
            <span>Read</span>
          </MessageFooter>
        </MessageContent>
      </Message>
    </MessageGroup>
  );
}
