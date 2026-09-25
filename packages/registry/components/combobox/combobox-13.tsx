"use client";

import * as React from "react";
import { GitBranch, Globe, Lock, Rocket } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/registry/base/ui/combobox";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/registry/base/ui/field";

type Branch = { value: string; label: string; commit: string; message: string };

type Repo = {
  value: string;
  label: string;
  private: boolean;
  updated: string;
  branches: Branch[];
};

const repos: Repo[] = [
  {
    value: "acme/storefront",
    label: "acme/storefront",
    private: true,
    updated: "12m ago",
    branches: [
      { value: "main", label: "main", commit: "a41f9c2", message: "Fix cart total rounding" },
      { value: "release/3.13", label: "release/3.13", commit: "7be02d1", message: "Bump version to 3.13.0" },
      { value: "feat/gift-cards", label: "feat/gift-cards", commit: "c90e4aa", message: "Add gift card balance check" },
    ],
  },
  {
    value: "acme/marketing-site",
    label: "acme/marketing-site",
    private: false,
    updated: "2h ago",
    branches: [
      { value: "main", label: "main", commit: "3d18b77", message: "Update pricing page copy" },
      { value: "preview/launch-week", label: "preview/launch-week", commit: "e5c2f10", message: "Draft launch week banner" },
    ],
  },
  {
    value: "acme/admin-dashboard",
    label: "acme/admin-dashboard",
    private: true,
    updated: "yesterday",
    branches: [
      { value: "main", label: "main", commit: "0f6ad3e", message: "Paginate order exports" },
      { value: "fix/csv-encoding", label: "fix/csv-encoding", commit: "b2291c4", message: "Write CSV with UTF-8 BOM" },
    ],
  },
  {
    value: "acme/docs",
    label: "acme/docs",
    private: false,
    updated: "3 days ago",
    branches: [
      { value: "main", label: "main", commit: "91ac7e5", message: "Document webhooks retry policy" },
    ],
  },
];

export default function Combobox13() {
  const [repo, setRepo] = React.useState<Repo | null>(repos[0]);
  const [branch, setBranch] = React.useState<Branch | null>(repos[0].branches[0]);
  const [status, setStatus] = React.useState<string | null>(null);

  return (
    <form
      className="w-full max-w-md rounded-xl border bg-card p-5 text-card-foreground"
      onSubmit={(event) => {
        event.preventDefault();
        if (repo && branch) {
          setStatus(`Queued deploy of ${repo.label}@${branch.commit} to Production.`);
        }
      }}
    >
      <h3 className="text-base font-medium">New deployment</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Pick the source to build and promote to production.
      </p>

      <FieldGroup className="mt-5 gap-4">
        <Field>
          <FieldLabel htmlFor="combobox-13-repo">Repository</FieldLabel>
          <Combobox
            items={repos}
            value={repo}
            onValueChange={(value) => {
              setRepo(value);
              // A branch only makes sense inside its repository; default to main.
              setBranch(value ? value.branches[0] : null);
              setStatus(null);
            }}
          >
            <ComboboxInput
              id="combobox-13-repo"
              placeholder="Search repositories"
              className="w-full"
            />
            <ComboboxContent>
              <ComboboxEmpty>No repository matches.</ComboboxEmpty>
              <ComboboxList>
                {(item: Repo) => (
                  <ComboboxItem key={item.value} value={item}>
                    {item.private ? (
                      <Lock aria-hidden="true" className="text-muted-foreground" />
                    ) : (
                      <Globe aria-hidden="true" className="text-muted-foreground" />
                    )}
                    <span className="flex-1 truncate">{item.label}</span>
                    <span className="sr-only">{item.private ? "Private" : "Public"}</span>
                    <span className="text-xs text-muted-foreground">{item.updated}</span>
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </Field>

        <Field disabled={!repo}>
          <FieldLabel htmlFor="combobox-13-branch">Branch</FieldLabel>
          <Combobox
            items={repo?.branches ?? []}
            value={branch}
            onValueChange={(value) => {
              setBranch(value);
              setStatus(null);
            }}
            disabled={!repo}
          >
            <ComboboxInput
              id="combobox-13-branch"
              placeholder={repo ? "Search branches" : "Choose a repository first"}
              disabled={!repo}
              className="w-full"
            />
            <ComboboxContent>
              <ComboboxEmpty>No branch with that name.</ComboboxEmpty>
              <ComboboxList>
                {(item: Branch) => (
                  <ComboboxItem key={item.value} value={item}>
                    <GitBranch aria-hidden="true" className="text-muted-foreground" />
                    <span className="flex-1 truncate font-mono text-xs">{item.label}</span>
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
          {branch && (
            <FieldDescription className="truncate">
              Latest commit{" "}
              <span className="font-mono text-foreground">{branch.commit}</span> ·{" "}
              {branch.message}
            </FieldDescription>
          )}
        </Field>
      </FieldGroup>

      <div className="mt-5 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p aria-live="polite" className="text-xs text-muted-foreground">
          {status ?? "Build: pnpm build · Output: .next"}
        </p>
        <Button type="submit" disabled={!repo || !branch}>
          <Rocket aria-hidden="true" data-icon="inline-start" />
          Deploy
        </Button>
      </div>
    </form>
  );
}
