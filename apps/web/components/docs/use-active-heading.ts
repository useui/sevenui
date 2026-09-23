"use client";

import { useEffect, useState } from "react";

const TRIGGER_OFFSET = 72;

type Entry = { heading: HTMLElement; id: string };

function activeIdFor(entries: Entry[]): string | null {
  const scrolledToBottom =
    window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
  if (scrolledToBottom) {
    return entries.at(-1)?.id ?? null;
  }

  let active = entries[0]?.id ?? null;
  for (const { heading, id } of entries) {
    if (heading.getBoundingClientRect().top <= TRIGGER_OFFSET) {
      active = id;
    }
  }
  return active;
}

export function useActiveHeading(ids: string[]): string | null {
  const [activeId, setActiveId] = useState<string | null>(null);

  const key = ids.join("\n");

  useEffect(() => {
    const resolved = key.length > 0 ? key.split("\n") : [];

    const entries: Entry[] = [];
    for (const id of resolved) {
      const heading = document.getElementById(id);
      if (heading) {
        entries.push({ heading, id });
      }
    }
    if (entries.length === 0) {
      setActiveId(null);
      return;
    }

    const update = () => setActiveId(activeIdFor(entries));

    const observer = new IntersectionObserver(update, {
      rootMargin: `-${TRIGGER_OFFSET}px 0px -70% 0px`,
      threshold: 0,
    });
    for (const { heading } of entries) {
      observer.observe(heading);
    }

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        update();
      });
    };
    window.addEventListener("scroll", onScroll);

    update();

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [key]);

  return activeId;
}
