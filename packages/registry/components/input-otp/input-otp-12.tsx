"use client";

import { useState } from "react";
import { Delete, Lock, ScanFace, Wallet } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/registry/base/ui/input-otp";

const PIN_LENGTH = 4;

const keys = [
  { digit: "1", letters: "" },
  { digit: "2", letters: "ABC" },
  { digit: "3", letters: "DEF" },
  { digit: "4", letters: "GHI" },
  { digit: "5", letters: "JKL" },
  { digit: "6", letters: "MNO" },
  { digit: "7", letters: "PQRS" },
  { digit: "8", letters: "TUV" },
  { digit: "9", letters: "WXYZ" },
];

export default function InputOtp12() {
  const [pin, setPin] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [showReset, setShowReset] = useState(false);

  const press = (digit: string) => {
    if (pin.length >= PIN_LENGTH) return;
    const next = pin + digit;
    setPin(next);
    // Keypad presses set the value directly, so completion is checked here.
    if (next.length === PIN_LENGTH) setUnlocked(true);
  };

  if (unlocked) {
    return (
      <div className="flex w-full max-w-75 flex-col gap-4 rounded-[2rem] border bg-card p-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Wallet aria-hidden="true" className="size-4" />
          Everyday checking
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-sm text-muted-foreground">Available balance</p>
          <p className="text-3xl font-semibold tabular-nums">$3,482.19</p>
        </div>
        <ul className="flex flex-col divide-y text-sm">
          <li className="flex justify-between py-2">
            <span>Blue Bottle Coffee</span>
            <span className="tabular-nums">−$6.75</span>
          </li>
          <li className="flex justify-between py-2">
            <span>Payroll · Acme Corp</span>
            <span className="text-success tabular-nums">+$2,140.00</span>
          </li>
        </ul>
        <Button
          variant="outline"
          onClick={() => {
            setPin("");
            setUnlocked(false);
          }}
        >
          <Lock aria-hidden="true" data-icon="inline-start" />
          Lock app
        </Button>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-75 flex-col items-center gap-8 rounded-[2rem] border bg-card px-6 pt-10 pb-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex size-11 items-center justify-center rounded-full bg-muted">
          <Lock aria-hidden="true" className="size-5" />
        </div>
        <h2 id="passcode-label" className="font-semibold">
          Enter passcode
        </h2>
        <p className="text-xs text-muted-foreground">
          Unlock Harbor to view your accounts
        </p>
      </div>

      <InputOTP
        length={PIN_LENGTH}
        mask
        value={pin}
        onValueChange={setPin}
        onValueComplete={() => setUnlocked(true)}
        aria-labelledby="passcode-label"
        className="gap-4"
      >
        {[1, 2, 3, 4].map((position) => (
          <InputOTPGroup key={position}>
            <InputOTPSlot
              aria-labelledby={position === 1 ? "passcode-label" : undefined}
              aria-label={
                position === 1
                  ? undefined
                  : `Passcode digit ${position} of ${PIN_LENGTH}`
              }
              className="size-4 rounded-full border bg-muted text-[8px] text-transparent caret-transparent selection:bg-transparent data-filled:border-primary data-filled:bg-primary"
            />
          </InputOTPGroup>
        ))}
      </InputOTP>

      <fieldset
        aria-label="Passcode keypad"
        className="m-0 grid w-full min-w-0 grid-cols-3 justify-items-center gap-3 border-0 p-0"
      >
        {keys.map((key) => (
          <Button
            key={key.digit}
            variant="ghost"
            aria-label={key.digit}
            className="size-16 flex-col gap-0 rounded-full bg-muted/60 text-xl font-medium"
            onClick={() => press(key.digit)}
          >
            {key.digit}
            <span
              aria-hidden="true"
              className="h-3 text-[0.55rem] font-semibold tracking-widest text-muted-foreground"
            >
              {key.letters}
            </span>
          </Button>
        ))}
        <Button
          variant="ghost"
          aria-label="Unlock with Face ID"
          className="size-16 rounded-full"
          onClick={() => setUnlocked(true)}
        >
          <ScanFace aria-hidden="true" className="size-6" />
        </Button>
        <Button
          variant="ghost"
          aria-label="0"
          className="size-16 rounded-full bg-muted/60 text-xl font-medium"
          onClick={() => press("0")}
        >
          0
        </Button>
        <Button
          variant="ghost"
          aria-label="Delete last digit"
          className="size-16 rounded-full"
          disabled={pin.length === 0}
          onClick={() => setPin((current) => current.slice(0, -1))}
        >
          <Delete aria-hidden="true" className="size-6" />
        </Button>
      </fieldset>

      {showReset ? (
        <p role="status" className="text-center text-xs text-muted-foreground">
          Sign in with your Harbor password to set a new passcode.
        </p>
      ) : (
        <Button variant="link" size="sm" onClick={() => setShowReset(true)}>
          Forgot passcode?
        </Button>
      )}
    </div>
  );
}
