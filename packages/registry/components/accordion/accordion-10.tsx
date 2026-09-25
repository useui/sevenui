"use client";

import { BookOpenIcon, KeyRoundIcon, RocketIcon } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/registry/base/ui/accordion";

const categories = [
  {
    value: "install",
    icon: BookOpenIcon,
    title: "Installation",
    articles: [
      {
        value: "node-version",
        title: "Install fails with an engine error",
        body: "The CLI needs Node.js 20.11 or later. Run node --version, upgrade with your version manager, then reinstall.",
      },
      {
        value: "proxy",
        title: "Packages time out behind a proxy",
        body: "Set HTTPS_PROXY in your shell before installing, and add the registry host to your NO_PROXY list if it is internal.",
      },
    ],
  },
  {
    value: "auth",
    icon: KeyRoundIcon,
    title: "Authentication",
    articles: [
      {
        value: "expired-token",
        title: "Requests return 401 after an hour",
        body: "Access tokens expire after 60 minutes. Use the refresh token to request a new one instead of signing in again.",
      },
      {
        value: "sso",
        title: "SSO redirects back to the login page",
        body: "Check that the callback URL in your identity provider matches your workspace domain exactly, including the trailing slash.",
      },
      {
        value: "scopes",
        title: "Token is missing a scope",
        body: "Scopes are fixed when a token is created. Generate a new token with the scopes you need and revoke the old one.",
      },
    ],
  },
  {
    value: "deploy",
    icon: RocketIcon,
    title: "Deployments",
    articles: [
      {
        value: "env",
        title: "Environment variables are undefined",
        body: "Variables are read at build time. Redeploy after adding them so the new build picks them up.",
      },
      {
        value: "rollback",
        title: "Rolling back a bad release",
        body: "Open Deployments, pick the last healthy build, and choose Promote. Traffic switches over in under a minute.",
      },
    ],
  },
];

export default function Accordion10() {
  return (
    <Accordion
      defaultValue={["auth"]}
      className="w-full max-w-md rounded-xl border bg-card"
    >
      {categories.map((category) => (
        <AccordionItem key={category.value} value={category.value}>
          <AccordionTrigger className="items-center gap-3 rounded-none px-4 py-3 hover:no-underline">
            <category.icon
              className="size-4 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
            <span className="flex-1">{category.title}</span>
            <span className="text-xs font-normal text-muted-foreground tabular-nums">
              {category.articles.length} articles
            </span>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-3">
            <Accordion
              multiple
              className="ml-2 border-l pl-3"
            >
              {category.articles.map((article) => (
                <AccordionItem
                  key={article.value}
                  value={article.value}
                  className="not-last:border-b-0"
                >
                  <AccordionTrigger className="py-2 pr-2 text-[0.8125rem] font-normal text-muted-foreground hover:text-foreground hover:no-underline aria-expanded:font-medium aria-expanded:text-foreground">
                    {article.title}
                  </AccordionTrigger>
                  <AccordionContent className="pr-2 pb-2 text-[0.8125rem] text-muted-foreground">
                    {article.body}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
