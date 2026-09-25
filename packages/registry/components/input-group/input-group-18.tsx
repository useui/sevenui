"use client";

import { useId, useState } from "react";
import {
  AtSignIcon,
  BadgeCheckIcon,
  ChevronLeftIcon,
  CircleCheckIcon,
  MessageSquareTextIcon,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/registry/base/ui/avatar";
import { Button } from "@/registry/base/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "@/registry/base/ui/input-group";

const contacts = [
  { handle: "lena.fischer", name: "Lena Fischer", initials: "LF" },
  { handle: "omar.haddad", name: "Omar Haddad", initials: "OH" },
  { handle: "grace.okafor", name: "Grace Okafor", initials: "GO" },
];

const quickAmounts = [20, 50, 100];

const BALANCE = 842.15;
const NOTE_LIMIT = 60;

function formatMoney(value: number) {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

export default function InputGroup18() {
  const recipientId = useId();
  const amountId = useId();
  const noteId = useId();
  const amountHintId = useId();
  const [handle, setHandle] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [sent, setSent] = useState(false);

  const needle = handle.trim().toLowerCase();
  const recipient = contacts.find((contact) => contact.handle === needle);
  const suggestions = needle
    ? contacts.filter(
        (contact) =>
          contact.handle !== needle &&
          (contact.handle.includes(needle) ||
            contact.name.toLowerCase().includes(needle)),
      )
    : contacts;

  const value = Number.parseFloat(amount) || 0;
  const overBalance = value > BALANCE;
  const canSend = !!recipient && value > 0 && !overBalance;

  if (sent && recipient) {
    return (
      <div className="flex w-full max-w-xs flex-col items-center rounded-3xl border border-border bg-card px-6 py-10 text-center">
        <CircleCheckIcon aria-hidden="true" className="size-10 text-success" />
        <p className="mt-4 text-2xl font-semibold tracking-tight tabular-nums">
          {formatMoney(value)}
        </p>
        <p role="status" className="mt-1 text-sm text-muted-foreground">
          Sent to {recipient.name}. It usually arrives in seconds.
        </p>
        {note ? (
          <p className="mt-4 rounded-lg bg-muted px-3 py-2 text-sm">“{note}”</p>
        ) : null}
        <Button
          variant="outline"
          className="mt-6 w-full"
          onClick={() => {
            setSent(false);
            setAmount("");
            setNote("");
            setHandle("");
          }}
        >
          Send another
        </Button>
      </div>
    );
  }

  return (
    <form
      className="flex w-full max-w-xs flex-col rounded-3xl border border-border bg-card p-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (canSend) setSent(true);
      }}
    >
      <div className="grid grid-cols-[2rem_1fr_2rem] items-center">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Back, clear this transfer"
          disabled={!handle && !amount && !note}
          onClick={() => {
            setHandle("");
            setAmount("");
            setNote("");
          }}
        >
          <ChevronLeftIcon aria-hidden="true" />
        </Button>
        <h3 className="text-center text-sm font-semibold">Send money</h3>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <label htmlFor={recipientId} className="text-xs font-medium text-muted-foreground">
          To
        </label>
        <InputGroup className="h-10 rounded-xl">
          <InputGroupAddon>
            <AtSignIcon aria-hidden="true" />
          </InputGroupAddon>
          <InputGroupInput
            id={recipientId}
            value={handle}
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="username"
            className="pl-0.5!"
            onChange={(event) => setHandle(event.target.value.replace(/^@/, ""))}
          />
          {recipient ? (
            <InputGroupAddon align="inline-end">
              <InputGroupText className="text-foreground">
                <span className="max-w-24 truncate">{recipient.name}</span>
                <BadgeCheckIcon
                  role="img"
                  aria-label="Verified"
                  className="text-primary"
                />
              </InputGroupText>
            </InputGroupAddon>
          ) : null}
        </InputGroup>
        {!recipient && suggestions.length > 0 ? (
          <ul aria-label="Suggested contacts" className="flex gap-3 overflow-x-auto pb-1">
            {suggestions.map((contact) => (
              <li key={contact.handle}>
                <button
                  type="button"
                  onClick={() => setHandle(contact.handle)}
                  className="flex w-16 flex-col items-center gap-1 rounded-lg p-1 outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Avatar className="size-9">
                    <AvatarImage src="/placeholder.svg" alt="" />
                    <AvatarFallback className="text-xs">
                      {contact.initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="w-full truncate text-xs">
                    {contact.name.split(" ")[0]}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="mt-5 flex flex-col gap-2">
        <label htmlFor={amountId} className="text-xs font-medium text-muted-foreground">
          Amount
        </label>
        <InputGroup className="h-16 rounded-2xl">
          <InputGroupAddon className="pl-4">
            <InputGroupText className="text-2xl font-medium">$</InputGroupText>
          </InputGroupAddon>
          <InputGroupInput
            id={amountId}
            inputMode="decimal"
            value={amount}
            placeholder="0.00"
            className="h-full pl-1! text-3xl font-semibold tracking-tight tabular-nums md:text-3xl"
            aria-invalid={overBalance ? true : undefined}
            aria-describedby={amountHintId}
            onChange={(event) => {
              const next = event.target.value.replace(/[^\d.]/g, "");
              if (/^\d{0,5}(\.\d{0,2})?$/.test(next)) setAmount(next);
            }}
          />
          <InputGroupAddon align="inline-end" className="pr-3">
            <InputGroupButton
              variant="secondary"
              onClick={() => setAmount(BALANCE.toFixed(2))}
            >
              Max
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
        <p
          id={amountHintId}
          aria-live="polite"
          className={overBalance ? "text-xs text-destructive" : "text-xs text-muted-foreground"}
        >
          {overBalance
            ? `That's more than your ${formatMoney(BALANCE)} balance.`
            : `Balance ${formatMoney(BALANCE)} · no fee for friends`}
        </p>
        <div className="grid grid-cols-3 gap-2">
          {quickAmounts.map((quick) => (
            <Button
              key={quick}
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full tabular-nums"
              aria-pressed={value === quick}
              onClick={() => setAmount(String(quick))}
            >
              ${quick}
            </Button>
          ))}
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-2">
        <label htmlFor={noteId} className="text-xs font-medium text-muted-foreground">
          Note
        </label>
        <InputGroup className="h-10 rounded-xl">
          <InputGroupAddon>
            <MessageSquareTextIcon aria-hidden="true" />
          </InputGroupAddon>
          <InputGroupInput
            id={noteId}
            value={note}
            maxLength={NOTE_LIMIT}
            placeholder="Concert tickets"
            onChange={(event) => setNote(event.target.value)}
          />
          <InputGroupAddon align="inline-end">
            <InputGroupText className="text-xs tabular-nums">
              <span className="sr-only">Characters used: </span>
              {note.length}/{NOTE_LIMIT}
            </InputGroupText>
          </InputGroupAddon>
        </InputGroup>
      </div>

      <Button type="submit" size="lg" className="mt-6 w-full rounded-xl" disabled={!canSend}>
        {canSend && recipient
          ? `Send ${formatMoney(value)} to ${recipient.name.split(" ")[0]}`
          : "Send"}
      </Button>
    </form>
  );
}
