"use client";

import * as React from "react";
import { CircleAlertIcon, CircleCheckIcon, UserPlusIcon } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import { Input } from "@/registry/base/ui/input";
import { Label } from "@/registry/base/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/registry/base/ui/popover";
import { Spinner } from "@/registry/base/ui/spinner";

type Status = "idle" | "loading" | "error" | "success";

const allowedDomain = "northwind.io";

export default function Popover04() {
  const [status, setStatus] = React.useState<Status>("idle");
  const [email, setEmail] = React.useState("");
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  function handleOpenChange(open: boolean) {
    if (!open) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setStatus("idle");
      setEmail("");
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    // Simulate a request: only addresses on the workspace domain are accepted.
    timeoutRef.current = setTimeout(() => {
      const accepted = email.trim().toLowerCase().endsWith(`@${allowedDomain}`);
      setStatus(accepted ? "success" : "error");
    }, 1200);
  }

  const loading = status === "loading";

  return (
    <Popover onOpenChange={handleOpenChange}>
      <PopoverTrigger render={<Button variant="outline" />}>
        <UserPlusIcon aria-hidden="true" />
        Invite teammate
      </PopoverTrigger>
      <PopoverContent className="w-80 max-w-[calc(100vw-2rem)] gap-3 p-4">
        {status === "success" ? (
          <div className="flex flex-col items-center gap-2 py-2 text-center">
            <CircleCheckIcon className="size-8 text-success" aria-hidden="true" />
            <PopoverTitle>Invite sent</PopoverTitle>
            <PopoverDescription>
              {email.trim()} will get an email with a link to join Northwind.
              It expires in 7 days.
            </PopoverDescription>
            <Button
              variant="outline"
              size="sm"
              className="mt-1"
              onClick={() => {
                setEmail("");
                setStatus("idle");
              }}
            >
              Invite someone else
            </Button>
          </div>
        ) : (
          <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
            <PopoverHeader>
              <PopoverTitle>Invite to Northwind</PopoverTitle>
              <PopoverDescription>
                Teammates join as members and can be promoted later.
              </PopoverDescription>
            </PopoverHeader>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="popover-04-email">Work email</Label>
              <Input
                id="popover-04-email"
                type="email"
                required
                placeholder={`name@${allowedDomain}`}
                value={email}
                disabled={loading}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (status === "error") setStatus("idle");
                }}
                aria-invalid={status === "error" ? true : undefined}
                aria-describedby={status === "error" ? "popover-04-error" : undefined}
              />
            </div>
            {status === "error" ? (
              <p
                id="popover-04-error"
                role="alert"
                className="flex items-start gap-1.5 rounded-md bg-destructive/10 px-2.5 py-2 text-xs text-destructive"
              >
                <CircleAlertIcon className="mt-px size-3.5 shrink-0" aria-hidden="true" />
                Only @{allowedDomain} addresses can join this workspace. Ask an
                admin to allow guest invites.
              </p>
            ) : null}
            <Button type="submit" disabled={loading || email.trim() === ""}>
              {loading ? (
                <>
                  <Spinner />
                  Sending invite
                </>
              ) : (
                "Send invite"
              )}
            </Button>
          </form>
        )}
      </PopoverContent>
    </Popover>
  );
}
