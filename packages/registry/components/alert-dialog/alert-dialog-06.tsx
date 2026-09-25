"use client";

import { CircleAlertIcon, CircleCheckIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/registry/base/ui/alert";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/registry/base/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/registry/base/ui/avatar";
import { Button } from "@/registry/base/ui/button";
import { Spinner } from "@/registry/base/ui/spinner";

type TransferStatus = "idle" | "pending" | "error" | "success";

const recipient = {
  name: "Daniel Kim",
  email: "daniel@acme.co",
  initials: "DK",
};

export default function AlertDialog06() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<TransferStatus>("idle");
  const [attempts, setAttempts] = useState(0);
  const pending = status === "pending";

  // Simulated request: the first attempt fails, the retry succeeds.
  useEffect(() => {
    if (status !== "pending") return;
    const id = setTimeout(() => {
      if (attempts === 1) {
        setStatus("error");
      } else {
        setStatus("success");
        setOpen(false);
      }
    }, 1200);
    return () => clearTimeout(id);
  }, [status, attempts]);

  const submit = () => {
    setAttempts((count) => count + 1);
    setStatus("pending");
  };

  if (status === "success") {
    return (
      <div className="flex w-full max-w-sm flex-col items-start gap-3">
        <Alert role="status" className="border-success/30 bg-success/5">
          <CircleCheckIcon aria-hidden="true" className="text-success" />
          <AlertTitle>Ownership transferred</AlertTitle>
          <AlertDescription>
            {recipient.name} now owns the Acme workspace. You are an admin.
          </AlertDescription>
        </Alert>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setStatus("idle");
            setAttempts(0);
          }}
        >
          Reset example
        </Button>
      </div>
    );
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (pending) return;
        setOpen(next);
        if (!next) {
          setStatus("idle");
          setAttempts(0);
        }
      }}
    >
      <AlertDialogTrigger
        render={<Button variant="outline">Transfer ownership</Button>}
      />
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Transfer the Acme workspace?</AlertDialogTitle>
          <AlertDialogDescription>
            The new owner controls billing and can remove any member, including
            you. You will become an admin.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex items-center gap-3 rounded-lg border p-3">
          <Avatar>
            <AvatarFallback>{recipient.initials}</AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-medium">
              {recipient.name}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {recipient.email}
            </span>
          </div>
        </div>
        {status === "error" ? (
          <Alert variant="destructive">
            <CircleAlertIcon aria-hidden="true" />
            <AlertTitle>Transfer failed</AlertTitle>
            <AlertDescription>
              {recipient.name} hasn't verified their email yet. Ask them to
              check their inbox, then try again.
            </AlertDescription>
          </Alert>
        ) : null}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <Button disabled={pending} aria-busy={pending} onClick={submit}>
            {pending ? (
              <>
                <Spinner data-icon="inline-start" aria-hidden="true" />
                Transferring…
              </>
            ) : status === "error" ? (
              "Try again"
            ) : (
              "Transfer ownership"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
