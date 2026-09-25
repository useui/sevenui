"use client";

import {
  CheckIcon,
  DatabaseIcon,
  LockIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/registry/base/ui/alert";
import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import { Checkbox } from "@/registry/base/ui/checkbox";
import { Label } from "@/registry/base/ui/label";
import { Slider } from "@/registry/base/ui/slider";

const steps = [
  { days: 1, short: "1d" },
  { days: 3, short: "3d" },
  { days: 7, short: "7d" },
  { days: 14, short: "14d" },
  { days: 30, short: "30d" },
  { days: 90, short: "90d" },
  { days: 365, short: "1y", enterprise: true },
];

const SAVED_INDEX = 4;
const DAILY_INGEST_GB = 18.4;
const PRICE_PER_GB_MONTH = 0.03;

function formatDays(days: number) {
  if (days === 365) return "1 year";
  return `${days} ${days === 1 ? "day" : "days"}`;
}

function formatStorage(gb: number) {
  return gb >= 1000 ? `${(gb / 1000).toFixed(1)} TB` : `${Math.round(gb)} GB`;
}

export default function Slider14() {
  const [index, setIndex] = useState(SAVED_INDEX);
  const [savedIndex, setSavedIndex] = useState(SAVED_INDEX);
  const [confirmed, setConfirmed] = useState(false);
  const [salesRequested, setSalesRequested] = useState(false);

  const step = steps[index];
  const saved = steps[savedIndex];
  const storedGb = step.days * DAILY_INGEST_GB;
  const monthlyCost = storedGb * PRICE_PER_GB_MONTH;
  const shrinking = step.days < saved.days;
  const deletedGb = (saved.days - step.days) * DAILY_INGEST_GB;
  const locked = Boolean(step.enterprise);
  const unchanged = index === savedIndex;

  return (
    <section
      aria-labelledby="slider-14-title"
      className="flex w-full max-w-md flex-col gap-5 rounded-xl border bg-card p-5 text-card-foreground"
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <DatabaseIcon
            aria-hidden="true"
            className="size-4 text-muted-foreground"
          />
          <h3 id="slider-14-title" className="text-sm font-medium">
            Log retention
          </h3>
          <Badge variant="outline" className="ml-auto font-mono">
            api-gateway
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          How long request logs stay searchable before they are deleted.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <p aria-live="polite" className="flex items-baseline gap-2">
          <span className="text-2xl font-semibold tabular-nums">
            {formatDays(step.days)}
          </span>
          {unchanged ? (
            <span className="text-xs text-muted-foreground">
              Current setting
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">
              was {formatDays(saved.days)}
            </span>
          )}
        </p>
        <Slider
          aria-labelledby="slider-14-title"
          value={[index]}
          min={0}
          max={steps.length - 1}
          step={1}
          onValueChange={(value) => {
            setIndex(Array.isArray(value) ? (value[0] ?? 0) : value);
            setConfirmed(false);
          }}
        />
        <div
          aria-hidden="true"
          className="grid grid-cols-[minmax(max-content,1fr)_repeat(5,2fr)_minmax(max-content,1fr)] text-[0.7rem] text-muted-foreground tabular-nums"
        >
          {steps.map((item, itemIndex) => (
            <span
              key={item.days}
              className={`flex items-center gap-0.5 whitespace-nowrap ${itemIndex === 0 ? "justify-start" : itemIndex === steps.length - 1 ? "justify-end" : "justify-center"} ${itemIndex === index ? "font-semibold text-foreground" : ""}`}
            >
              {item.enterprise ? <LockIcon className="size-2.5 shrink-0" /> : null}
              {item.short}
            </span>
          ))}
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-3 rounded-lg bg-muted/50 p-3 text-sm">
        <div className="flex flex-col gap-0.5">
          <dt className="text-xs text-muted-foreground">
            Stored at steady state
          </dt>
          <dd className="font-medium tabular-nums">
            {formatStorage(storedGb)}
          </dd>
        </div>
        <div className="flex flex-col gap-0.5">
          <dt className="text-xs text-muted-foreground">
            Estimated storage cost
          </dt>
          <dd className="font-medium tabular-nums">
            ${monthlyCost.toFixed(2)}
            <span className="font-normal text-muted-foreground"> /mo</span>
          </dd>
        </div>
      </dl>

      {locked ? (
        <Alert>
          <LockIcon aria-hidden="true" />
          <AlertTitle>Retention beyond 90 days needs Enterprise</AlertTitle>
          <AlertDescription>
            Yearly retention covers SOC 2 and HIPAA audit windows. Talk to sales
            to enable it for this project.
          </AlertDescription>
        </Alert>
      ) : shrinking ? (
        <Alert variant="destructive">
          <TriangleAlertIcon aria-hidden="true" />
          <AlertTitle>
            {formatStorage(deletedGb)} of logs will be deleted
          </AlertTitle>
          <AlertDescription>
            Everything older than {formatDays(step.days)} is removed at the next
            compaction, around 02:00 UTC. This cannot be undone.
          </AlertDescription>
        </Alert>
      ) : null}

      {shrinking && !locked ? (
        <div className="flex items-start gap-2">
          <Checkbox
            id="slider-14-confirm"
            checked={confirmed}
            onCheckedChange={(checked) => setConfirmed(checked === true)}
          />
          <Label
            htmlFor="slider-14-confirm"
            className="text-sm font-normal leading-snug"
          >
            I understand older logs will be permanently deleted
          </Label>
        </div>
      ) : null}

      <div className="flex justify-end gap-2">
        <Button
          variant="ghost"
          disabled={unchanged}
          onClick={() => {
            setIndex(savedIndex);
            setConfirmed(false);
          }}
        >
          Discard
        </Button>
        {locked ? (
          <Button
            variant="outline"
            disabled={salesRequested}
            onClick={() => setSalesRequested(true)}
          >
            {salesRequested ? (
              <>
                <CheckIcon aria-hidden="true" />
                Sales will reach out
              </>
            ) : (
              "Contact sales"
            )}
          </Button>
        ) : (
          <Button
            variant={shrinking ? "destructive" : "default"}
            disabled={unchanged || (shrinking && !confirmed)}
            onClick={() => {
              setSavedIndex(index);
              setConfirmed(false);
            }}
          >
            {shrinking ? "Shorten retention" : "Save retention"}
          </Button>
        )}
      </div>
    </section>
  );
}
