import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

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

type WizardProps = {
  item?: string;
  shortcuts?: "letters" | "numbers";
  onSubmit?: React.FormEventHandler<HTMLFormElement>;
  onItemChange?: (item: string) => void;
  onRoleStatusChange?: (status: string) => void;
  onInterestsStatusChange?: (status: string) => void;
};

function Wizard(props: WizardProps) {
  return (
    <Questionnaire
      item={props.item}
      shortcuts={props.shortcuts}
      onSubmit={props.onSubmit}
      onItemChange={props.onItemChange}
    >
      <QuestionnaireProgress />
      <QuestionnaireItem
        name="role"
        required
        onStatusChange={props.onRoleStatusChange}
      >
        <QuestionnaireTitle>What best describes your role?</QuestionnaireTitle>
        <QuestionnaireChoices>
          <QuestionnaireChoice value="designer">Designer</QuestionnaireChoice>
          <QuestionnaireChoice value="developer">
            Developer
            <QuestionnaireChoiceDescription>
              Engineer of any kind
            </QuestionnaireChoiceDescription>
          </QuestionnaireChoice>
        </QuestionnaireChoices>
        <QuestionnaireError />
      </QuestionnaireItem>
      <QuestionnaireItem
        name="interests"
        multiple
        onStatusChange={props.onInterestsStatusChange}
      >
        <QuestionnaireTitle>What are you building?</QuestionnaireTitle>
        <QuestionnaireDescription>
          Pick as many as you like.
        </QuestionnaireDescription>
        <QuestionnaireChoices>
          <QuestionnaireChoice value="dashboards">Dashboards</QuestionnaireChoice>
          <QuestionnaireChoice value="marketing">
            Marketing sites
          </QuestionnaireChoice>
        </QuestionnaireChoices>
      </QuestionnaireItem>
      <QuestionnaireItem name="email" required>
        <QuestionnaireTitle>Where should we send updates?</QuestionnaireTitle>
        <QuestionnaireInput type="email" placeholder="you@example.com" />
        <QuestionnaireError />
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

function items(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLFieldSetElement>(
      '[data-slot="questionnaire-item"]',
    ),
  );
}

function activeIndex(container: HTMLElement) {
  return items(container).findIndex((item) => !item.hidden);
}

function actionButton(container: HTMLElement, slot: string) {
  return container.querySelector<HTMLButtonElement>(`[data-slot="${slot}"]`)!;
}

describe("Questionnaire", () => {
  it("renders a form with the first item active and announces progress", () => {
    const { container } = render(<Wizard />);
    const root = container.querySelector('[data-slot="questionnaire"]')!;
    expect(root.tagName).toBe("FORM");

    const progress = screen.getByRole("progressbar");
    expect(progress.getAttribute("aria-valuenow")).toBe("1");
    expect(progress.getAttribute("aria-valuemax")).toBe("3");
    expect(progress.textContent).toBe("Question 1 of 3");

    expect(items(container).map((item) => item.hidden)).toEqual([
      false,
      true,
      true,
    ]);
  });

  it("appends a custom className to the form", () => {
    const { container } = render(
      <Questionnaire className="max-w-md">
        <QuestionnaireProgress />
      </Questionnaire>,
    );
    const root = container.querySelector('[data-slot="questionnaire"]')!;
    expect(root.className).toContain("max-w-md");
    expect(root.className).toContain("flex");
  });

  it("renders an empty questionnaire with silent progress", () => {
    render(
      <Questionnaire>
        <QuestionnaireProgress />
      </Questionnaire>,
    );
    const progress = screen.getByRole("progressbar");
    expect(progress.textContent).toBe("");
    expect(progress.hasAttribute("aria-valuenow")).toBe(false);
  });

  it("selects a radio choice and reports the answered status", async () => {
    const user = userEvent.setup();
    const onRoleStatusChange = vi.fn();
    const { container } = render(
      <Wizard onRoleStatusChange={onRoleStatusChange} />,
    );
    const radio = screen.getByRole("radio", { name: "Designer" });
    expect((radio as HTMLInputElement).checked).toBe(false);

    await user.click(radio);
    expect((radio as HTMLInputElement).checked).toBe(true);
    expect(onRoleStatusChange).toHaveBeenCalledWith("answered");

    // Single-select choices swap: picking the other one unchecks the first.
    await user.click(screen.getByRole("radio", { name: /Developer/ }));
    expect((radio as HTMLInputElement).checked).toBe(false);

    const checked = container.querySelector(
      '[data-slot="questionnaire-choice"][data-checked]',
    );
    expect(checked?.textContent).toContain("Developer");
  });

  it("forwards the change event to the choice onChange handler", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Questionnaire>
        <QuestionnaireItem name="role">
          <QuestionnaireChoices>
            <QuestionnaireChoice value="designer" onChange={onChange}>
              Designer
            </QuestionnaireChoice>
          </QuestionnaireChoices>
        </QuestionnaireItem>
      </Questionnaire>,
    );
    await user.click(screen.getByRole("radio", { name: "Designer" }));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0].target.value).toBe("designer");
  });

  it("blocks Next on a required unanswered item and shows the error", async () => {
    const user = userEvent.setup();
    const onItemChange = vi.fn();
    const { container } = render(<Wizard onItemChange={onItemChange} />);

    await user.click(screen.getByRole("button", { name: "Next" }));
    const alert = screen.getByRole("alert");
    expect(alert.textContent).toBe("Choose an answer to continue.");
    expect(activeIndex(container)).toBe(0);
    expect(onItemChange).not.toHaveBeenCalled();
  });

  it("advances with Next once answered and returns with Previous", async () => {
    const user = userEvent.setup();
    const onItemChange = vi.fn();
    const { container } = render(<Wizard onItemChange={onItemChange} />);

    // Previous is hidden on the first item.
    expect(actionButton(container, "questionnaire-previous").hidden).toBe(true);

    await user.click(screen.getByRole("radio", { name: "Designer" }));
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(onItemChange).toHaveBeenCalledWith("interests");
    expect(activeIndex(container)).toBe(1);
    expect(screen.getByRole("progressbar").textContent).toBe("Question 2 of 3");

    await user.click(screen.getByRole("button", { name: "Previous" }));
    expect(activeIndex(container)).toBe(0);
    // The earlier selection is preserved.
    expect(
      (screen.getByRole("radio", { name: "Designer" }) as HTMLInputElement)
        .checked,
    ).toBe(true);
  });

  it("hides Skip on required items and skips optional ones", async () => {
    const user = userEvent.setup();
    const onInterestsStatusChange = vi.fn();
    const { container } = render(
      <Wizard onInterestsStatusChange={onInterestsStatusChange} />,
    );

    expect(actionButton(container, "questionnaire-skip").hidden).toBe(true);

    await user.click(screen.getByRole("radio", { name: "Designer" }));
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(actionButton(container, "questionnaire-skip").hidden).toBe(false);

    await user.click(screen.getByRole("button", { name: "Skip" }));
    expect(onInterestsStatusChange).toHaveBeenCalledWith("skipped");
    expect(activeIndex(container)).toBe(2);
  });

  it("renders multiple items as checkboxes and allows multi-select", async () => {
    const user = userEvent.setup();
    render(<Wizard />);

    await user.click(screen.getByRole("radio", { name: "Designer" }));
    await user.click(screen.getByRole("button", { name: "Next" }));

    const dashboards = screen.getByRole("checkbox", { name: "Dashboards" });
    const marketing = screen.getByRole("checkbox", { name: "Marketing sites" });
    await user.click(dashboards);
    await user.click(marketing);
    expect((dashboards as HTMLInputElement).checked).toBe(true);
    expect((marketing as HTMLInputElement).checked).toBe(true);
  });

  it("validates on submit and delivers all answers as form data", async () => {
    const user = userEvent.setup();
    let submitted: Record<string, unknown> | null = null;
    const onSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      submitted = {
        role: data.get("role"),
        interests: data.getAll("interests"),
        email: data.get("email"),
      };
    };
    const { container } = render(<Wizard onSubmit={onSubmit} />);

    await user.click(screen.getByRole("radio", { name: "Designer" }));
    await user.click(screen.getByRole("button", { name: "Next" }));
    await user.click(screen.getByRole("checkbox", { name: "Dashboards" }));
    await user.click(screen.getByRole("button", { name: "Next" }));

    // On the last item Next is hidden and Submit takes its place.
    expect(actionButton(container, "questionnaire-next").hidden).toBe(true);
    const submit = screen.getByRole("button", { name: "Submit" });

    // Submitting with the required email still empty is rejected.
    await user.click(submit);
    expect(submitted).toBeNull();
    expect(screen.getByRole("alert").textContent).toBe(
      "Choose an answer to continue.",
    );

    await user.type(
      screen.getByPlaceholderText("you@example.com"),
      "emma@example.com",
    );
    await user.click(submit);
    expect(submitted).toEqual({
      role: "designer",
      interests: ["dashboards"],
      email: "emma@example.com",
    });
  });

  it("keeps the active item controlled and reports requested changes", async () => {
    const user = userEvent.setup();
    const onItemChange = vi.fn();
    const { container } = render(
      <Wizard item="interests" onItemChange={onItemChange} />,
    );
    expect(activeIndex(container)).toBe(1);

    await user.click(screen.getByRole("button", { name: "Previous" }));
    expect(onItemChange).toHaveBeenCalledWith("role");
    // Uncontrolled navigation is suppressed: the active item stays put.
    expect(activeIndex(container)).toBe(1);
  });

  it("labels choices with letter shortcuts and selects via the keyboard", async () => {
    const user = userEvent.setup();
    const { container } = render(<Wizard shortcuts="letters" />);
    const root = container.querySelector('[data-slot="questionnaire"]')!;
    expect(root.getAttribute("data-shortcuts")).toBe("letters");

    const badges = items(container)[0].querySelectorAll(
      '[data-slot="questionnaire-choice-shortcut"]',
    );
    expect(Array.from(badges).map((badge) => badge.textContent)).toEqual([
      "A",
      "B",
    ]);

    const designer = screen.getByRole("radio", { name: "Designer" });
    designer.focus();
    await user.keyboard("b");
    expect(
      (screen.getByRole("radio", { name: /Developer/ }) as HTMLInputElement)
        .checked,
    ).toBe(true);
  });

  it("does not select disabled choices", async () => {
    const user = userEvent.setup();
    const onStatusChange = vi.fn();
    const { container } = render(
      <Questionnaire>
        <QuestionnaireItem name="role" onStatusChange={onStatusChange}>
          <QuestionnaireChoices>
            <QuestionnaireChoice value="designer" disabled>
              Designer
            </QuestionnaireChoice>
          </QuestionnaireChoices>
        </QuestionnaireItem>
      </Questionnaire>,
    );
    const choice = container.querySelector('[data-slot="questionnaire-choice"]')!;
    const input = choice.querySelector("input")!;
    expect(input.disabled).toBe(true);

    await user.click(choice as HTMLElement);
    expect(input.checked).toBe(false);
    expect(onStatusChange).not.toHaveBeenCalledWith("answered");
  });
});
