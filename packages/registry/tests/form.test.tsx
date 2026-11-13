import type * as React from "react";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Field, FieldError, FieldLabel } from "@/registry/base/ui/field";
import { Form } from "@/registry/base/ui/form";
import { Input } from "@/registry/base/ui/input";
import { Checkbox } from "@/registry/base/ui/checkbox";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
} from "@/registry/base/ui/combobox";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/registry/base/ui/input-otp";
import { NativeSelect, NativeSelectOption } from "@/registry/base/ui/native-select";
import { NumberField, NumberFieldGroup, NumberFieldInput } from "@/registry/base/ui/number-field";
import { RadioGroup, RadioGroupItem } from "@/registry/base/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/base/ui/select";
import { Slider } from "@/registry/base/ui/slider";
import { Switch } from "@/registry/base/ui/switch";
import { Textarea } from "@/registry/base/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/registry/base/ui/toggle-group";
import { byFlavour } from "./helpers/flavour";

describe("Form", () => {
  it("passes the values of named fields to onFormSubmit", async () => {
    const user = userEvent.setup();
    const onFormSubmit = vi.fn();
    render(
      <Form onFormSubmit={onFormSubmit}>
        <Field name="email">
          <FieldLabel>Email</FieldLabel>
          <Input />
        </Field>
        <Field name="username">
          <FieldLabel>Username</FieldLabel>
          <Input />
        </Field>
        <button type="submit">Submit</button>
      </Form>,
    );
    await user.type(screen.getByLabelText("Email"), "ada@example.com");
    await user.type(screen.getByLabelText("Username"), "ada");
    await user.click(screen.getByRole("button", { name: "Submit" }));
    expect(onFormSubmit).toHaveBeenCalledTimes(1);
    expect(onFormSubmit.mock.calls[0][0]).toEqual({
      email: "ada@example.com",
      username: "ada",
    });
  });

  // Base UI validates every field on submit whether or not onFormSubmit is
  // set, and a failure stops onSubmit (and a native action) from running.
  it("runs field validators before a plain onSubmit and blocks it on failure", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault());
    render(
      <Form onSubmit={onSubmit}>
        <Field
          name="username"
          validate={(value) => (String(value ?? "").length >= 3 ? null : "Too short.")}
        >
          <FieldLabel>Username</FieldLabel>
          <Input />
          <FieldError />
        </Field>
        <button type="submit">Submit</button>
      </Form>,
    );
    await user.click(screen.getByRole("button", { name: "Submit" }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText("Too short.")).toBeTruthy();
    const input = screen.getByLabelText("Username");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(document.activeElement).toBe(input);

    await user.type(input, "ada");
    await user.click(screen.getByRole("button", { name: "Submit" }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  // Base UI's Form is noValidate: a native constraint failure shows in the
  // field, not as a browser bubble that stops the submit event, so the other
  // fields' validators still run and show their messages.
  it("is noValidate and reports native and validate errors together", async () => {
    const user = userEvent.setup();
    const onFormSubmit = vi.fn();
    render(
      <Form onFormSubmit={onFormSubmit}>
        <Field name="email">
          <FieldLabel>Email</FieldLabel>
          <Input required />
          <FieldError />
        </Field>
        <Field
          name="username"
          validate={(value) => (String(value ?? "").length >= 3 ? null : "Too short.")}
        >
          <FieldLabel>Username</FieldLabel>
          <Input />
          <FieldError />
        </Field>
        <button type="submit">Submit</button>
      </Form>,
    );
    const form = document.querySelector("form") as HTMLFormElement;
    expect(form.noValidate).toBe(true);
    await user.click(screen.getByRole("button", { name: "Submit" }));
    expect(onFormSubmit).not.toHaveBeenCalled();
    expect(screen.getByText("Too short.")).toBeTruthy();
    const email = screen.getByLabelText("Email");
    expect(email.getAttribute("aria-invalid")).toBe("true");
    expect(document.activeElement).toBe(email);
  });

  // After a failed submit Base UI re-validates a field as it changes, so the
  // message goes once the value is fixed, without another submit.
  it("re-validates a failed field as the user types after a submit", async () => {
    const user = userEvent.setup();
    render(
      <Form onFormSubmit={() => {}}>
        <Field name="email">
          <FieldLabel>Email</FieldLabel>
          <Input type="email" required />
          <FieldError />
        </Field>
        <Field
          name="nick"
          validate={(value) => (String(value ?? "").length < 3 ? "Nick needs 3+ chars" : null)}
        >
          <FieldLabel>Nick</FieldLabel>
          <Input />
          <FieldError />
        </Field>
        <button type="submit">Submit</button>
      </Form>,
    );
    await user.click(screen.getByRole("button", { name: "Submit" }));
    expect(screen.getByText("Nick needs 3+ chars")).toBeTruthy();
    await user.type(screen.getByLabelText("Nick"), "abc");
    expect(screen.queryByText("Nick needs 3+ chars")).toBeNull();
    expect(screen.getByLabelText("Nick").getAttribute("aria-invalid")).not.toBe("true");
  });

  it("shows a native error on a field with invalid={false}", async () => {
    const user = userEvent.setup();
    render(
      <Form onFormSubmit={() => {}}>
        <Field name="email" invalid={false}>
          <FieldLabel>Email</FieldLabel>
          <Input required />
          <FieldError />
        </Field>
        <button type="submit">Submit</button>
      </Form>,
    );
    await user.click(screen.getByRole("button", { name: "Submit" }));
    expect(screen.getByLabelText("Email").getAttribute("aria-invalid")).toBe("true");
  });

  it("flows external errors into a nested bare FieldError", () => {
    render(
      <Form errors={{ email: "Email is already taken." }}>
        <Field name="email">
          <FieldLabel>Email</FieldLabel>
          <Input />
          <FieldError />
        </Field>
      </Form>,
    );
    expect(screen.getByText("Email is already taken.")).toBeTruthy();
    expect(screen.getByLabelText("Email").getAttribute("aria-invalid")).toBe(
      "true",
    );
  });

  it("clears an external error once the field value changes", async () => {
    const user = userEvent.setup();
    render(
      <Form errors={{ email: "Email is already taken." }}>
        <Field name="email">
          <FieldLabel>Email</FieldLabel>
          <Input />
          <FieldError />
        </Field>
      </Form>,
    );
    expect(screen.getByText("Email is already taken.")).toBeTruthy();
    await user.type(screen.getByLabelText("Email"), "other@example.com");
    expect(screen.queryByText("Email is already taken.")).toBeNull();
    expect(screen.getByLabelText("Email").getAttribute("aria-invalid")).not.toBe(
      "true",
    );
  });

  it("only marks the field named by the errors prop as invalid", () => {
    render(
      <Form errors={{ email: "Email is already taken." }}>
        <Field name="email">
          <FieldLabel>Email</FieldLabel>
          <Input />
          <FieldError />
        </Field>
        <Field name="username">
          <FieldLabel>Username</FieldLabel>
          <Input />
          <FieldError />
        </Field>
      </Form>,
    );
    expect(
      screen.getByLabelText("Username").getAttribute("aria-invalid"),
    ).not.toBe("true");
    expect(screen.getAllByText("Email is already taken.")).toHaveLength(1);
  });

  it("renders a form element and merges custom classes", () => {
    const { container } = render(
      <Form aria-label="Checkout" className="gap-8" />,
    );
    const form = container.querySelector("form");
    expect(form).not.toBeNull();
    expect(form?.className).toContain("gap-8");
    expect(form?.getAttribute("aria-label")).toBe("Checkout");
  });
});

describe("Form v2 styles", () => {
  it("carries layout only: no surface, focus, colour or density classes to restyle", () => {
    const { container } = render(<Form />);
    const form = container.querySelector("form");
    // The v2 look lives in the fields and controls inside a form; the form
    // itself stays a plain grid, so the restyle leaves it untouched.
    expect(form?.className).toBe("grid gap-4");
  });
});

// What each control SevenUI ships reports, as Base UI reports it: the value
// `validate` gets, and the serialized one onFormSubmit (and the validators'
// formValues) get.
describe("Form field values", () => {
  type Country = { value: string; label: string };
  const countries: Country[] = [
    { value: "us", label: "United States" },
    { value: "de", label: "Germany" },
    { value: "fr", label: "France" },
  ];
  type Row = {
    name: string;
    control: React.ReactNode;
    // undefined: the field reports nothing (Base UI registers no control).
    value: unknown;
    formValue?: unknown;
  };
  const rows: Row[] = [
    { name: "input", control: <Input defaultValue="ada@example.com" />, value: "ada@example.com" },
    { name: "disabled-input", control: <Input disabled defaultValue="x" />, value: undefined },
    { name: "checkbox", control: <Checkbox defaultChecked />, value: true },
    {
      name: "checkboxes",
      control: (
        <>
          <Checkbox value="a" defaultChecked aria-label="A" />
          <Checkbox value="b" aria-label="B" />
        </>
      ),
      value: false,
    },
    { name: "switch", control: <Switch />, value: false },
    {
      name: "radio",
      control: (
        <RadioGroup defaultValue={2}>
          <RadioGroupItem value={1} aria-label="One" />
          <RadioGroupItem value={2} aria-label="Two" />
        </RadioGroup>
      ),
      value: 2,
    },
    {
      name: "select",
      control: (
        <Select defaultValue="apple">
          <SelectTrigger aria-label="Fruit">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="apple">Apple</SelectItem>
            <SelectItem value="pear">Pear</SelectItem>
          </SelectContent>
        </Select>
      ),
      value: "apple",
    },
    {
      name: "select-number",
      control: (
        <Select defaultValue={2}>
          <SelectTrigger aria-label="Count">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={1}>One</SelectItem>
            <SelectItem value={2}>Two</SelectItem>
          </SelectContent>
        </Select>
      ),
      value: 2,
      formValue: "2",
    },
    {
      name: "select-multiple",
      control: (
        <Select multiple defaultValue={["apple", "pear"]}>
          <SelectTrigger aria-label="Fruits">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="apple">Apple</SelectItem>
            <SelectItem value="pear">Pear</SelectItem>
          </SelectContent>
        </Select>
      ),
      value: ["apple", "pear"],
    },
    {
      name: "combobox",
      control: (
        <Combobox items={countries} defaultValue={countries[1]}>
          <ComboboxInput placeholder="Country" />
          <ComboboxContent>
            <ComboboxList>
              {(item: Country) => (
                <ComboboxItem key={item.value} value={item}>
                  {item.label}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      ),
      value: countries[1],
      formValue: "de",
    },
    {
      name: "combobox-multiple",
      control: (
        <Combobox items={countries} multiple defaultValue={[countries[0], countries[2]]}>
          <ComboboxChips>
            <ComboboxValue>
              {(values: Country[]) =>
                values.map((item) => <ComboboxChip key={item.value}>{item.label}</ComboboxChip>)
              }
            </ComboboxValue>
            <ComboboxChipsInput placeholder="Countries" />
          </ComboboxChips>
          <ComboboxContent>
            <ComboboxList>
              {(item: Country) => (
                <ComboboxItem key={item.value} value={item}>
                  {item.label}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      ),
      value: [countries[0], countries[2]],
      formValue: ["us", "fr"],
    },
    { name: "slider", control: <Slider defaultValue={[30]} aria-label="Volume" />, value: [30] },
    { name: "slider-number", control: <Slider defaultValue={40} aria-label="Level" />, value: 40 },
    { name: "slider-range", control: <Slider defaultValue={[20, 80]} aria-label="Range" />, value: [20, 80] },
    {
      name: "number",
      control: (
        <NumberField defaultValue={4}>
          <NumberFieldGroup>
            <NumberFieldInput aria-label="Quantity" />
          </NumberFieldGroup>
        </NumberField>
      ),
      value: 4,
    },
    {
      name: "otp",
      control: (
        <InputOTP length={3} defaultValue="123" aria-label="Code">
          <InputOTPGroup>
            <InputOTPSlot />
            <InputOTPSlot />
            <InputOTPSlot />
          </InputOTPGroup>
        </InputOTP>
      ),
      value: "123",
    },
    {
      name: "toggle-group",
      control: (
        <ToggleGroup defaultValue={["b"]}>
          <ToggleGroupItem value="a" aria-label="A">A</ToggleGroupItem>
          <ToggleGroupItem value="b" aria-label="B">B</ToggleGroupItem>
        </ToggleGroup>
      ),
      value: undefined,
    },
    // Plain elements in base: no Base UI control registers, so the field
    // reports nothing and its validator never runs. The flavour reads the
    // native control, which is strictly more (guide §8).
    {
      name: "textarea",
      control: <Textarea defaultValue="hello" aria-label="Note" />,
      value: byFlavour({ base: undefined, "ui-sdk": "hello" }),
    },
    {
      name: "native-select",
      control: (
        <NativeSelect defaultValue="y" aria-label="Pick">
          <NativeSelectOption value="x">X</NativeSelectOption>
          <NativeSelectOption value="y">Y</NativeSelectOption>
        </NativeSelect>
      ),
      value: byFlavour({ base: undefined, "ui-sdk": "y" }),
    },
  ];

  it("reports each control's value to validate and onFormSubmit as Base UI does", async () => {
    const user = userEvent.setup();
    const onFormSubmit = vi.fn();
    const seen: Record<string, unknown> = {};
    render(
      <Form onFormSubmit={onFormSubmit}>
        {rows.map((row) => (
          <Field
            key={row.name}
            name={row.name}
            validate={(value) => {
              seen[row.name] = value;
              return null;
            }}
          >
            {row.control}
          </Field>
        ))}
        <button type="submit">Submit</button>
      </Form>,
    );
    await user.click(screen.getByRole("button", { name: "Submit" }));
    expect(onFormSubmit).toHaveBeenCalledTimes(1);
    const expectedForm: Record<string, unknown> = {};
    const expectedValidate: Record<string, unknown> = {};
    for (const row of rows) {
      if (row.value === undefined) continue;
      expectedForm[row.name] = "formValue" in row ? row.formValue : row.value;
      expectedValidate[row.name] = row.value;
    }
    expect(onFormSubmit.mock.calls[0][0]).toEqual(expectedForm);
    expect(seen).toEqual(expectedValidate);
  });

  it("reports the value a control was changed to", async () => {
    const user = userEvent.setup();
    const onFormSubmit = vi.fn();
    render(
      <Form onFormSubmit={onFormSubmit}>
        <Field name="radio">
          <RadioGroup defaultValue={2}>
            <RadioGroupItem value={1} aria-label="One" />
            <RadioGroupItem value={2} aria-label="Two" />
          </RadioGroup>
        </Field>
        <Field name="count">
          <Select defaultValue={1}>
            <SelectTrigger aria-label="Count">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={1}>One</SelectItem>
              <SelectItem value={2}>Two</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field name="level">
          <Slider defaultValue={[40]} aria-label="Level" />
        </Field>
        <button type="submit">Submit</button>
      </Form>,
    );
    // jsdom has no layout, so Base UI's edge-aligned thumb stays hidden.
    const slider = screen.getByRole("slider", { hidden: true });
    await act(async () => slider.focus());
    await user.keyboard("{ArrowRight}");
    await user.click(screen.getByRole("radio", { name: "One" }));
    await user.click(screen.getByRole("combobox", { name: "Count" }));
    await user.click(await screen.findByRole("option", { name: "Two" }));
    await user.click(screen.getByRole("button", { name: "Submit" }));
    expect(onFormSubmit.mock.calls[0][0]).toEqual({ radio: 1, count: "2", level: [41] });
  });
});
