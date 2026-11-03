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
import { LabSection } from "../lab-frame";

export default function MessageMatrix() {
  return (
    <div>
      <LabSection title="align=start, text avatar, header + footer">
        <div className="w-full max-w-sm">
          <Message>
            <MessageAvatar>EC</MessageAvatar>
            <MessageContent>
              <MessageHeader>Emma · 09:41</MessageHeader>
              <Bubble variant="muted">
                <BubbleContent>Did you see the new landing page?</BubbleContent>
              </Bubble>
              <MessageFooter>Read</MessageFooter>
            </MessageContent>
          </Message>
        </div>
      </LabSection>
      <LabSection title="align=start, Avatar primitive, grouped bubbles">
        <div className="w-full max-w-sm">
          <Message>
            <MessageAvatar>
              <Avatar className="size-8">
                <AvatarFallback>LK</AvatarFallback>
              </Avatar>
            </MessageAvatar>
            <MessageContent>
              <MessageHeader>Leo · 09:42</MessageHeader>
              <MessageGroup>
                <Bubble variant="muted">
                  <BubbleContent>First line of a burst.</BubbleContent>
                </Bubble>
                <Bubble variant="muted">
                  <BubbleContent>Second line.</BubbleContent>
                </Bubble>
              </MessageGroup>
            </MessageContent>
          </Message>
        </div>
      </LabSection>
      <LabSection title="align=end, user bubble, footer">
        <div className="w-full max-w-sm">
          <Message align="end">
            <MessageContent>
              <Bubble align="end">
                <BubbleContent>Add a danger zone with a delete dialog.</BubbleContent>
              </Bubble>
              <MessageFooter>Delivered</MessageFooter>
            </MessageContent>
          </Message>
        </div>
      </LabSection>
      <LabSection title="assistant (ghost bubble), header">
        <div className="w-full max-w-sm">
          <Message>
            <MessageContent>
              <MessageHeader>Agent</MessageHeader>
              <Bubble variant="ghost">
                <BubbleContent>
                  Installed alert-dialog and composed the danger zone section.
                </BubbleContent>
              </Bubble>
            </MessageContent>
          </Message>
        </div>
      </LabSection>
    </div>
  );
}
