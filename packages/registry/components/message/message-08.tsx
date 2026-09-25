"use client";

import * as React from "react";

import { Avatar, AvatarFallback } from "@/registry/base/ui/avatar";
import { Bubble, BubbleContent } from "@/registry/base/ui/bubble";
import { Button } from "@/registry/base/ui/button";
import { Checkbox } from "@/registry/base/ui/checkbox";
import { Label } from "@/registry/base/ui/label";
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageGroup,
  MessageHeader,
} from "@/registry/base/ui/message";
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/registry/base/ui/progress";

const tasks = [
  { id: "profile", label: "Add a profile photo and your time zone" },
  { id: "slack", label: "Connect Slack for deploy alerts" },
  { id: "project", label: "Star the Checkout Revamp project" },
  { id: "standup", label: "Join Thursday's design standup" },
];

export default function Message08() {
  const [done, setDone] = React.useState<string[]>(["profile"]);
  const [waved, setWaved] = React.useState(false);
  const percent = Math.round((done.length / tasks.length) * 100);
  const complete = done.length === tasks.length;

  const toggle = (id: string, checked: boolean) => {
    setDone((prev) =>
      checked ? [...prev, id] : prev.filter((item) => item !== id),
    );
  };

  return (
    <section
      aria-label="Welcome message from your onboarding buddy"
      className="flex w-full max-w-sm flex-col gap-4 rounded-2xl border bg-card p-4 text-card-foreground"
    >
      <Message>
        <MessageAvatar>
          <Avatar>
            <AvatarFallback>SK</AvatarFallback>
          </Avatar>
        </MessageAvatar>
        <MessageContent>
          <MessageHeader>Sofia Kim · Your onboarding buddy</MessageHeader>
          <MessageGroup>
            <Bubble variant="tinted">
              <BubbleContent>
                Welcome to the team, Alex! I put together your first-week
                checklist.
              </BubbleContent>
            </Bubble>
            <Bubble variant="outline" className="w-full">
              <BubbleContent className="flex w-full flex-col gap-3 rounded-2xl">
                <Progress value={percent} className="gap-2">
                  <ProgressLabel className="text-xs font-medium">
                    {complete ? "All set" : "First week"}
                  </ProgressLabel>
                  <ProgressValue className="ml-auto text-xs text-muted-foreground tabular-nums" />
                </Progress>
                <ul className="flex flex-col gap-2.5">
                  {tasks.map((task) => {
                    const id = `message-08-${task.id}`;
                    const checked = done.includes(task.id);
                    return (
                      <li key={task.id} className="flex items-start gap-2.5">
                        <Checkbox
                          id={id}
                          checked={checked}
                          onCheckedChange={(value) => toggle(task.id, value)}
                          className="mt-0.5"
                        />
                        <Label
                          htmlFor={id}
                          className="text-sm leading-snug font-normal data-checked:text-muted-foreground data-checked:line-through"
                          data-checked={checked ? "" : undefined}
                        >
                          {task.label}
                        </Label>
                      </li>
                    );
                  })}
                </ul>
              </BubbleContent>
            </Bubble>
          </MessageGroup>
          <MessageFooter>Today at 09:12</MessageFooter>
        </MessageContent>
      </Message>

      {complete ? (
        <Message>
          <MessageAvatar>
            <Avatar>
              <AvatarFallback>SK</AvatarFallback>
            </Avatar>
          </MessageAvatar>
          <MessageContent>
            <Bubble variant="tinted">
              <BubbleContent>
                That was quick. See you at standup on Thursday!
              </BubbleContent>
            </Bubble>
          </MessageContent>
        </Message>
      ) : null}

      {waved ? (
        <Message align="end">
          <MessageContent>
            <Bubble align="end">
              <BubbleContent>Thanks Sofia, on it!</BubbleContent>
            </Bubble>
            <MessageFooter>Sent</MessageFooter>
          </MessageContent>
        </Message>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="self-end"
          onClick={() => setWaved(true)}
        >
          Reply “Thanks Sofia, on it!”
        </Button>
      )}
    </section>
  );
}
