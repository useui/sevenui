"use client";

import {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoiceDescription,
  QuestionnaireChoices,
  QuestionnaireDescription,
  QuestionnaireError,
  QuestionnaireInput,
  QuestionnaireItem,
  QuestionnaireNext,
  QuestionnairePrevious,
  QuestionnaireProgress,
  QuestionnaireSkip,
  QuestionnaireSubmit,
  QuestionnaireTitle,
} from "@/registry/base/ui/questionnaire";
import { LabSection } from "../lab-frame";

function Steps({ item, invalid }: { item: string; invalid?: boolean }) {
  return (
    <Questionnaire
      defaultItem={item}
      shortcuts="letters"
      className="w-full max-w-sm"
      onSubmit={(event) => event.preventDefault()}
    >
      <QuestionnaireProgress />
      <QuestionnaireItem name="role" required invalid={invalid}>
        <QuestionnaireTitle>What best describes your role?</QuestionnaireTitle>
        <QuestionnaireChoices>
          <QuestionnaireChoice value="designer" defaultChecked={!invalid}>
            Designer
          </QuestionnaireChoice>
          <QuestionnaireChoice value="developer">
            Developer
            <QuestionnaireChoiceDescription>Engineer of any kind</QuestionnaireChoiceDescription>
          </QuestionnaireChoice>
          <QuestionnaireChoice value="other" disabled>
            Other (disabled)
          </QuestionnaireChoice>
        </QuestionnaireChoices>
        <QuestionnaireError />
      </QuestionnaireItem>
      <QuestionnaireItem name="interests" multiple>
        <QuestionnaireTitle>What are you building?</QuestionnaireTitle>
        <QuestionnaireDescription>Pick as many as you like.</QuestionnaireDescription>
        <QuestionnaireChoices>
          <QuestionnaireChoice value="dashboards" defaultChecked>
            Dashboards
          </QuestionnaireChoice>
          <QuestionnaireChoice value="marketing">Marketing sites</QuestionnaireChoice>
        </QuestionnaireChoices>
      </QuestionnaireItem>
      <QuestionnaireItem name="email" required invalid={invalid}>
        <QuestionnaireTitle>Where should we send updates?</QuestionnaireTitle>
        <QuestionnaireInput type="email" placeholder="you@example.com" />
        <QuestionnaireError>Enter an email to continue.</QuestionnaireError>
      </QuestionnaireItem>
      <QuestionnaireActions>
        <QuestionnairePrevious />
        <QuestionnaireSkip />
        <QuestionnaireNext />
        <QuestionnaireSubmit />
      </QuestionnaireActions>
    </Questionnaire>
  );
}

export default function QuestionnaireMatrix() {
  return (
    <div>
      <LabSection title="step 1: radio options (selected / unselected / disabled)">
        <Steps item="role" />
      </LabSection>
      <LabSection title="step 1: invalid">
        <Steps item="role" invalid />
      </LabSection>
      <LabSection title="step 2: checkbox options (multiple, skippable)">
        <Steps item="interests" />
      </LabSection>
      <LabSection title="step 3: text input (last step, submit)">
        <Steps item="email" />
      </LabSection>
      <LabSection title="step 3: text input invalid">
        <Steps item="email" invalid />
      </LabSection>
    </div>
  );
}
