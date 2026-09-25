"use client";

import * as React from "react";
import { CircleCheck, Gift } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/registry/base/ui/drawer";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/registry/base/ui/field";
import { Input } from "@/registry/base/ui/input";
import { Spinner } from "@/registry/base/ui/spinner";

type Status = "idle" | "loading" | "error" | "success";

const VALID_CODE = "WELCOME25";

export default function Drawer06() {
  const [code, setCode] = React.useState("");
  const [status, setStatus] = React.useState<Status>("idle");
  const [error, setError] = React.useState("");
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const reset = () => {
    if (timer.current) clearTimeout(timer.current);
    setCode("");
    setStatus("idle");
    setError("");
  };

  const redeem = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = code.trim().toUpperCase();
    if (!value) {
      setStatus("error");
      setError("Enter the code printed on your gift card.");
      return;
    }
    setStatus("loading");
    setError("");
    timer.current = setTimeout(() => {
      if (value === VALID_CODE) {
        setStatus("success");
      } else {
        setStatus("error");
        setError(
          `“${value}” has expired or was already used. Check the code and try again.`,
        );
      }
    }, 1200);
  };

  const loading = status === "loading";

  return (
    <Drawer
      onOpenChangeComplete={(open) => {
        if (!open) reset();
      }}
    >
      <DrawerTrigger
        render={
          <Button variant="outline">
            <Gift aria-hidden="true" />
            Redeem gift card
          </Button>
        }
      />
      <DrawerContent>
        <div className="mx-auto flex w-full max-w-sm flex-col">
          {status === "success" ? (
            <>
              <DrawerHeader className="items-center pt-8 text-center md:text-center">
                <span className="mb-3 flex size-12 items-center justify-center rounded-full bg-success/10 text-success">
                  <CircleCheck aria-hidden="true" className="size-6" />
                </span>
                <DrawerTitle>$25.00 added to your balance</DrawerTitle>
                <DrawerDescription>
                  Your new balance is $61.40. It applies to your next invoice
                  automatically.
                </DrawerDescription>
              </DrawerHeader>
              <DrawerFooter className="pt-6">
                <DrawerClose render={<Button>Done</Button>} />
              </DrawerFooter>
            </>
          ) : (
            <form noValidate onSubmit={redeem}>
              <DrawerHeader>
                <DrawerTitle>Redeem gift card</DrawerTitle>
                <DrawerDescription>
                  Credit is added to your workspace balance right away.
                </DrawerDescription>
              </DrawerHeader>
              <div className="p-4">
                <Field invalid={status === "error"} disabled={loading}>
                  <FieldLabel htmlFor="drawer-06-code">Gift code</FieldLabel>
                  <Input
                    id="drawer-06-code"
                    value={code}
                    onChange={(event) => {
                      setCode(event.target.value);
                      if (status === "error") setStatus("idle");
                    }}
                    placeholder="e.g. WELCOME25"
                    autoComplete="off"
                    spellCheck={false}
                    className="font-mono uppercase placeholder:normal-case"
                  />
                  {status === "error" ? (
                    <FieldError match>{error}</FieldError>
                  ) : (
                    <FieldDescription>
                      Codes are 9 characters, letters and numbers.
                    </FieldDescription>
                  )}
                </Field>
              </div>
              <DrawerFooter>
                <Button type="submit" disabled={loading} aria-busy={loading}>
                  {loading && <Spinner aria-hidden="true" />}
                  {loading ? "Checking code…" : "Redeem"}
                </Button>
                <DrawerClose
                  render={
                    <Button variant="outline" disabled={loading}>
                      Cancel
                    </Button>
                  }
                />
              </DrawerFooter>
            </form>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
