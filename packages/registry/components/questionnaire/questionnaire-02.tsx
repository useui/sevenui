"use client";

import * as React from "react";
import {
  BriefcaseIcon,
  CodeIcon,
  GraduationCapIcon,
  PaletteIcon,
  RocketIcon,
  UserIcon,
  UsersIcon,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/registry/base/ui/card";
import {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoiceDescription,
  QuestionnaireChoices,
  QuestionnaireError,
  QuestionnaireItem,
  QuestionnaireNext,
  QuestionnairePrevious,
  QuestionnaireProgress,
  QuestionnaireSubmit,
  QuestionnaireTitle,
} from "@/registry/base/ui/questionnaire";

const useCases = [
  {
    value: "product",
    icon: RocketIcon,
    label: "Ship a product",
    description: "Roadmaps, sprints, and release notes",
  },
  {
    value: "design",
    icon: PaletteIcon,
    label: "Run design reviews",
    description: "Share files and collect feedback",
  },
  {
    value: "engineering",
    icon: CodeIcon,
    label: "Track engineering work",
    description: "Issues, pull requests, and incidents",
  },
  {
    value: "school",
    icon: GraduationCapIcon,
    label: "Organize coursework",
    description: "Assignments, notes, and group projects",
  },
];

const teamSizes = [
  { value: "solo", icon: UserIcon, label: "Just me", description: "A personal workspace" },
  { value: "small", icon: UsersIcon, label: "2–10 people", description: "A small team" },
  {
    value: "company",
    icon: BriefcaseIcon,
    label: "11 or more",
    description: "Several teams under one company",
  },
];

type Option = (typeof useCases)[number];

function IconChoice({ option }: { option: Option }) {
  const Icon = option.icon;
  return (
    <QuestionnaireChoice value={option.value}>
      <span className="flex items-center gap-2 font-medium">
        <Icon aria-hidden="true" className="size-4 text-muted-foreground" />
        {option.label}
      </span>
      <QuestionnaireChoiceDescription className="ps-6">
        {option.description}
      </QuestionnaireChoiceDescription>
    </QuestionnaireChoice>
  );
}

export default function Questionnaire02() {
  const [done, setDone] = React.useState(false);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Set up your workspace</CardTitle>
        <CardDescription>
          Two quick questions so we can load the right templates. Press a letter
          key to pick an answer.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {done ? (
          <p className="rounded-lg bg-muted px-3 py-2.5 text-sm" aria-live="polite">
            Templates are ready in your sidebar.
          </p>
        ) : (
          <Questionnaire
            shortcuts="letters"
            onSubmit={(event) => {
              event.preventDefault();
              setDone(true);
            }}
          >
            <QuestionnaireProgress />
            <QuestionnaireItem name="use-case" required>
              <QuestionnaireTitle>What will you use the workspace for?</QuestionnaireTitle>
              <QuestionnaireChoices>
                {useCases.map((option) => (
                  <IconChoice key={option.value} option={option} />
                ))}
              </QuestionnaireChoices>
              <QuestionnaireError />
            </QuestionnaireItem>
            <QuestionnaireItem name="team-size" required>
              <QuestionnaireTitle>How many people will join?</QuestionnaireTitle>
              <QuestionnaireChoices>
                {teamSizes.map((option) => (
                  <IconChoice key={option.value} option={option} />
                ))}
              </QuestionnaireChoices>
              <QuestionnaireError />
            </QuestionnaireItem>
            <QuestionnaireActions>
              <QuestionnairePrevious>Back</QuestionnairePrevious>
              <QuestionnaireNext>Continue</QuestionnaireNext>
              <QuestionnaireSubmit>Create workspace</QuestionnaireSubmit>
            </QuestionnaireActions>
          </Questionnaire>
        )}
      </CardContent>
    </Card>
  );
}
