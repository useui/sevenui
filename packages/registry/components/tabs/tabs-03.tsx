"use client";

import { Clock, Flame, Minus, Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/registry/base/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/registry/base/ui/tabs";

const BASE_SERVINGS = 4;

const ingredients = [
  { name: "Rigatoni", amount: 400, unit: "g" },
  { name: "Cherry tomatoes", amount: 500, unit: "g" },
  { name: "Garlic cloves, sliced", amount: 4, unit: "" },
  { name: "Olive oil", amount: 3, unit: "tbsp" },
  { name: "Fresh basil leaves", amount: 20, unit: "" },
  { name: "Parmesan, grated", amount: 60, unit: "g" },
];

const steps = [
  "Bring a large pot of salted water to a boil and cook the rigatoni until just al dente.",
  "Meanwhile, warm the olive oil in a wide pan and soften the garlic for 1 minute.",
  "Add the tomatoes, cover, and cook for 8 minutes until they burst. Crush a few with a spoon.",
  "Toss in the pasta with a splash of its water, then finish with basil and Parmesan.",
];

const nutrition = [
  { label: "Calories", value: "540 kcal" },
  { label: "Protein", value: "19 g" },
  { label: "Carbohydrates", value: "82 g" },
  { label: "Fat", value: "15 g" },
  { label: "Fiber", value: "6 g" },
];

function formatAmount(amount: number) {
  return Number.isInteger(amount) ? String(amount) : amount.toFixed(1);
}

export default function Tabs03() {
  const [servings, setServings] = useState(BASE_SERVINGS);
  const scale = servings / BASE_SERVINGS;

  return (
    <article
      aria-labelledby="tabs-03-title"
      className="flex w-full max-w-sm flex-col gap-4 rounded-xl border bg-card p-4 text-card-foreground shadow-xs"
    >
      <img
        src="/placeholder.svg"
        alt="Rigatoni with burst cherry tomatoes and basil"
        className="aspect-[16/9] w-full rounded-lg bg-muted object-cover"
      />
      <div className="flex flex-col gap-1">
        <h3 id="tabs-03-title" className="font-semibold">
          Burst tomato rigatoni
        </h3>
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock aria-hidden="true" className="size-3.5" />
            25 min
          </span>
          <span className="flex items-center gap-1">
            <Flame aria-hidden="true" className="size-3.5" />
            Easy
          </span>
        </p>
      </div>

      <Tabs defaultValue="ingredients" className="gap-3">
        <TabsList className="w-full">
          <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
          <TabsTrigger value="method">Method</TabsTrigger>
          <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
        </TabsList>

        <TabsContent value="ingredients" className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <span id="tabs-03-servings" className="font-medium">
              Servings
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon-sm"
                aria-label="Fewer servings"
                disabled={servings <= 1}
                onClick={() => setServings((count) => count - 1)}
              >
                <Minus aria-hidden="true" />
              </Button>
              <output
                aria-labelledby="tabs-03-servings"
                aria-live="polite"
                className="w-6 text-center font-medium tabular-nums"
              >
                {servings}
              </output>
              <Button
                variant="outline"
                size="icon-sm"
                aria-label="More servings"
                disabled={servings >= 12}
                onClick={() => setServings((count) => count + 1)}
              >
                <Plus aria-hidden="true" />
              </Button>
            </div>
          </div>
          <ul className="divide-y">
            {ingredients.map((item) => (
              <li
                key={item.name}
                className="flex justify-between gap-3 py-2 first:pt-0 last:pb-0"
              >
                <span>{item.name}</span>
                <span className="shrink-0 text-muted-foreground tabular-nums">
                  {formatAmount(item.amount * scale)}
                  {item.unit && ` ${item.unit}`}
                </span>
              </li>
            ))}
          </ul>
        </TabsContent>

        <TabsContent value="method">
          <ol className="flex flex-col gap-3">
            {steps.map((step, index) => (
              <li key={step} className="flex gap-3">
                <span
                  aria-hidden="true"
                  className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium tabular-nums"
                >
                  {index + 1}
                </span>
                <span className="pt-0.5 leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </TabsContent>

        <TabsContent value="nutrition" className="flex flex-col gap-2">
          <p className="text-muted-foreground">Per serving</p>
          <dl className="divide-y">
            {nutrition.map((row) => (
              <div
                key={row.label}
                className="flex justify-between gap-3 py-2 first:pt-0 last:pb-0"
              >
                <dt>{row.label}</dt>
                <dd className="font-medium tabular-nums">{row.value}</dd>
              </div>
            ))}
          </dl>
        </TabsContent>
      </Tabs>
    </article>
  );
}
