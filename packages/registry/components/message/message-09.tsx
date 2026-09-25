"use client";

import * as React from "react";
import {
  BotIcon,
  FrownIcon,
  MehIcon,
  SmileIcon,
  UserRoundIcon,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/registry/base/ui/avatar";
import { Bubble, BubbleContent } from "@/registry/base/ui/bubble";
import { Button } from "@/registry/base/ui/button";
import { Marker, MarkerContent } from "@/registry/base/ui/marker";
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageHeader,
} from "@/registry/base/ui/message";
import { Spinner } from "@/registry/base/ui/spinner";

type Stage = "bot" | "waiting" | "agent" | "ended";

const ratings = [
  { id: "bad", label: "Not helpful", icon: FrownIcon },
  { id: "okay", label: "Okay", icon: MehIcon },
  { id: "great", label: "Great", icon: SmileIcon },
];

function BotAvatar() {
  return (
    <MessageAvatar className="size-8 bg-secondary text-secondary-foreground">
      <BotIcon aria-hidden="true" className="size-4" />
    </MessageAvatar>
  );
}

function AgentAvatar() {
  return (
    <MessageAvatar>
      <Avatar className="size-8">
        <AvatarFallback>MO</AvatarFallback>
      </Avatar>
    </MessageAvatar>
  );
}

export default function Message09() {
  const [stage, setStage] = React.useState<Stage>("bot");
  const [rating, setRating] = React.useState<string | null>(null);
  const [agentJoined, setAgentJoined] = React.useState(false);

  React.useEffect(() => {
    if (stage !== "waiting") return;
    const timer = window.setTimeout(() => {
      setAgentJoined(true);
      setStage("agent");
    }, 1600);
    return () => window.clearTimeout(timer);
  }, [stage]);

  return (
    <section
      aria-label="Support chat"
      className="flex w-full max-w-sm flex-col gap-4 rounded-2xl border bg-card p-4 text-card-foreground"
    >
      <Message align="end">
        <MessageContent>
          <Bubble align="end">
            <BubbleContent>
              My invoice shows the wrong company name for our VAT filing.
            </BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>

      <Message>
        <BotAvatar />
        <MessageContent>
          <MessageHeader>Help assistant</MessageHeader>
          <Bubble variant="muted">
            <BubbleContent>
              You can edit the billing name under Settings → Billing, but
              invoices already issued have to be reissued by our team.
            </BubbleContent>
          </Bubble>
          {stage === "bot" && (
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStage("waiting")}
              >
                <UserRoundIcon data-icon="inline-start" aria-hidden="true" />
                Talk to a person
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStage("ended")}
              >
                That solved it
              </Button>
            </div>
          )}
        </MessageContent>
      </Message>

      <div aria-live="polite" className="flex flex-col gap-4">
        {stage === "waiting" && (
          <Marker variant="separator" className="text-xs">
            <MarkerContent className="flex items-center gap-1.5">
              <Spinner className="size-3" />
              Connecting you to billing support · about 1 min
            </MarkerContent>
          </Marker>
        )}

        {(stage === "agent" || (stage === "ended" && agentJoined)) && (
          <>
            <Marker variant="separator" className="text-xs">
              <MarkerContent>Mia Okafor from Billing joined</MarkerContent>
            </Marker>
            <Message>
              <AgentAvatar />
              <MessageContent>
                <MessageHeader>Mia Okafor</MessageHeader>
                <Bubble variant="outline">
                  <BubbleContent>
                    Hi! I've reissued invoice INV-2291 with “Northwind Labs
                    GmbH”. It's in your inbox now.
                  </BubbleContent>
                </Bubble>
                <MessageFooter>09:48</MessageFooter>
              </MessageContent>
            </Message>
            {stage === "agent" && (
              <Button
                variant="outline"
                size="sm"
                className="self-center"
                onClick={() => setStage("ended")}
              >
                End chat
              </Button>
            )}
          </>
        )}

        {stage === "ended" && (
          <>
            <Marker variant="separator" className="text-xs">
              <MarkerContent>Chat ended</MarkerContent>
            </Marker>
            {rating ? (
              <p className="text-center text-sm text-muted-foreground">
                Thanks, your feedback goes straight to the support team.
              </p>
            ) : (
              <fieldset className="flex min-w-0 flex-col items-center gap-2">
                <legend className="mb-2 w-full text-center text-sm font-medium">
                  How was your support today?
                </legend>
                <div className="flex gap-2">
                  {ratings.map(({ id, label, icon: Icon }) => (
                    <Button
                      key={id}
                      variant="outline"
                      size="icon-lg"
                      className="rounded-full"
                      aria-label={label}
                      onClick={() => setRating(id)}
                    >
                      <Icon aria-hidden="true" />
                    </Button>
                  ))}
                </div>
              </fieldset>
            )}
          </>
        )}
      </div>
    </section>
  );
}
