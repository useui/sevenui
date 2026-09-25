"use client";

import { Avatar, AvatarFallback } from "@/registry/base/ui/avatar";
import { Bubble, BubbleContent } from "@/registry/base/ui/bubble";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/registry/base/ui/card";
import { Marker, MarkerContent } from "@/registry/base/ui/marker";
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
} from "@/registry/base/ui/message";

export default function Message02() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Onboarding copy review</CardTitle>
        <CardDescription>Jonas Weber and you</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Marker variant="separator">
          <MarkerContent>Today</MarkerContent>
        </Marker>
        <Message>
          <MessageAvatar>
            <Avatar size="sm">
              <AvatarFallback>JW</AvatarFallback>
            </Avatar>
          </MessageAvatar>
          <MessageContent>
            <Bubble variant="outline">
              <BubbleContent>
                Step two still says “Invite your crew”. Legal asked us to use
                “Invite teammates” everywhere.
              </BubbleContent>
            </Bubble>
            <MessageFooter>Jonas · 14:18</MessageFooter>
          </MessageContent>
        </Message>
        <Message align="end">
          <MessageContent>
            <Bubble variant="secondary" align="end">
              <BubbleContent>
                Updated in all three locales. Shipping with tonight’s release.
              </BubbleContent>
            </Bubble>
            <MessageFooter>14:21</MessageFooter>
          </MessageContent>
        </Message>
      </CardContent>
    </Card>
  );
}
