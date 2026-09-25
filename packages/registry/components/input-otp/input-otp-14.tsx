"use client";

import { useState } from "react";
import { BadgeCheck, ShieldCheck } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/registry/base/ui/avatar";
import { Bubble, BubbleContent } from "@/registry/base/ui/bubble";
import { Button } from "@/registry/base/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/registry/base/ui/input-otp";
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageGroup,
} from "@/registry/base/ui/message";

const history = [
  {
    id: "m1",
    from: "customer",
    text: "Hi, I need to change the shipping address on order PW-48213.",
  },
  {
    id: "m2",
    from: "agent",
    text: "Happy to help. Before I open account details, I need to confirm it's you.",
  },
] as const;

function AgentAvatar() {
  return (
    <MessageAvatar>
      <Avatar size="sm">
        <AvatarImage src="/placeholder.svg" alt="" />
        <AvatarFallback>NP</AvatarFallback>
      </Avatar>
    </MessageAvatar>
  );
}

export default function InputOtp14() {
  const [code, setCode] = useState("");
  const [verified, setVerified] = useState(false);

  return (
    <div className="flex w-full max-w-sm flex-col overflow-hidden rounded-xl border bg-card">
      <div className="flex items-center gap-3 border-b px-4 py-3">
        <Avatar>
          <AvatarImage src="/placeholder.svg" alt="" />
          <AvatarFallback>NP</AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-col">
          <p className="text-sm font-medium">Nora Pham</p>
          <p className="text-xs text-muted-foreground">
            Parcelwise Support · usually replies in 2 min
          </p>
        </div>
      </div>

      <MessageGroup
        role="log"
        aria-label="Support conversation"
        aria-live="polite"
        className="gap-3 p-4"
      >
        {history.map((message) =>
          message.from === "agent" ? (
            <Message key={message.id}>
              <AgentAvatar />
              <MessageContent>
                <Bubble variant="muted">
                  <BubbleContent>{message.text}</BubbleContent>
                </Bubble>
              </MessageContent>
            </Message>
          ) : (
            <Message key={message.id} align="end">
              <MessageContent>
                <Bubble>
                  <BubbleContent>{message.text}</BubbleContent>
                </Bubble>
              </MessageContent>
            </Message>
          ),
        )}

        <Message>
          <AgentAvatar />
          <MessageContent>
            <div className="flex w-full max-w-64 flex-col gap-3 rounded-2xl border bg-background p-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <ShieldCheck aria-hidden="true" className="size-4" />
                <span id="chat-code-label">Identity check</span>
              </div>
              <p
                id="chat-code-hint"
                className="text-xs text-muted-foreground"
              >
                Enter the 5-digit code texted to{" "}
                <span className="whitespace-nowrap">(•••) •••-0455</span>.
              </p>
              <InputOTP
                length={5}
                value={code}
                onValueChange={setCode}
                disabled={verified}
                aria-labelledby="chat-code-label"
                aria-describedby="chat-code-hint"
                className="w-full"
              >
                <InputOTPGroup className="w-full">
                  {[1, 2, 3, 4, 5].map((position) => (
                    <InputOTPSlot
                      key={position}
                      aria-labelledby={
                        position === 1 ? "chat-code-label" : undefined
                      }
                      aria-label={
                        position === 1 ? undefined : `Code digit ${position} of 5`
                      }
                      className="h-9 min-w-0 flex-1 bg-background text-base"
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
              {verified ? (
                <p className="flex items-center gap-1.5 text-xs font-medium text-success">
                  <BadgeCheck aria-hidden="true" className="size-3.5" />
                  Verified
                </p>
              ) : (
                <Button
                  size="sm"
                  disabled={code.length < 5}
                  onClick={() => setVerified(true)}
                >
                  Share code with Nora
                </Button>
              )}
            </div>
          </MessageContent>
        </Message>

        {verified ? (
          <Message>
            <AgentAvatar />
            <MessageContent>
              <Bubble variant="muted">
                <BubbleContent>
                  Thanks, you're verified. Order PW-48213 hasn't shipped yet, so
                  I can update the address now. What's the new one?
                </BubbleContent>
              </Bubble>
            </MessageContent>
          </Message>
        ) : null}
      </MessageGroup>

      <div className="border-t p-3">
        <p className="text-center text-xs text-muted-foreground">
          {verified
            ? "Account details are now shared with this agent."
            : "Nora will never ask for your password."}
        </p>
      </div>
    </div>
  );
}
