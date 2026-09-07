import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
  AttachmentTrigger,
} from "@/registry/base/ui/attachment";

function FileAttachment(props: React.ComponentProps<typeof Attachment>) {
  return (
    <Attachment {...props}>
      <AttachmentMedia>
        <svg aria-hidden="true" />
      </AttachmentMedia>
      <AttachmentContent>
        <AttachmentTitle>quarterly-report.pdf</AttachmentTitle>
        <AttachmentDescription>1.2 MB · PDF</AttachmentDescription>
      </AttachmentContent>
    </Attachment>
  );
}

describe("Attachment", () => {
  it("renders the file title and description", () => {
    render(<FileAttachment />);
    expect(screen.getByText("quarterly-report.pdf")).not.toBeNull();
    expect(screen.getByText("1.2 MB · PDF")).not.toBeNull();
  });

  it("exposes default state, size, and orientation as data attributes", () => {
    render(<FileAttachment data-testid="attachment" />);
    const root = screen.getByTestId("attachment");
    expect(root.getAttribute("data-state")).toBe("done");
    expect(root.getAttribute("data-size")).toBe("default");
    expect(root.getAttribute("data-orientation")).toBe("horizontal");
  });

  it("reflects custom state, size, and orientation", () => {
    render(
      <FileAttachment
        data-testid="attachment"
        state="uploading"
        size="xs"
        orientation="vertical"
      />,
    );
    const root = screen.getByTestId("attachment");
    expect(root.getAttribute("data-state")).toBe("uploading");
    expect(root.getAttribute("data-size")).toBe("xs");
    expect(root.getAttribute("data-orientation")).toBe("vertical");
  });

  it("appends a custom className after the variant classes", () => {
    render(<FileAttachment data-testid="attachment" className="w-full" />);
    const root = screen.getByTestId("attachment");
    expect(root.className).toContain("w-full");
    // Base classes stay intact.
    expect(root.className).toContain("rounded-2xl");
  });

  it("tags every composition part with a data-slot", () => {
    const { container } = render(<FileAttachment />);
    for (const slot of [
      "attachment",
      "attachment-media",
      "attachment-content",
      "attachment-title",
      "attachment-description",
    ]) {
      expect(container.querySelector(`[data-slot="${slot}"]`)).not.toBeNull();
    }
  });

  it("renders media with the requested variant", () => {
    const { container } = render(
      <Attachment>
        <AttachmentMedia variant="image">
          <img src="/placeholder.svg" alt="" />
        </AttachmentMedia>
      </Attachment>,
    );
    const media = container.querySelector('[data-slot="attachment-media"]');
    expect(media?.getAttribute("data-variant")).toBe("image");
    expect(media?.querySelector("img")).not.toBeNull();
  });
});

describe("AttachmentAction", () => {
  it("fires its click handler", async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    render(
      <Attachment>
        <AttachmentActions>
          <AttachmentAction aria-label="Remove file" onClick={onRemove}>
            <svg aria-hidden="true" />
          </AttachmentAction>
        </AttachmentActions>
      </Attachment>,
    );
    await user.click(screen.getByRole("button", { name: "Remove file" }));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it("does not fire when disabled", async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    render(
      <Attachment>
        <AttachmentActions>
          <AttachmentAction aria-label="Remove file" disabled onClick={onRemove}>
            <svg aria-hidden="true" />
          </AttachmentAction>
        </AttachmentActions>
      </Attachment>,
    );
    await user.click(screen.getByRole("button", { name: "Remove file", hidden: true }));
    expect(onRemove).not.toHaveBeenCalled();
  });
});

describe("AttachmentTrigger", () => {
  it("renders a type=button by default and fires onClick", async () => {
    const user = userEvent.setup();
    const onPreview = vi.fn();
    render(
      <Attachment>
        <AttachmentTrigger aria-label="Preview file" onClick={onPreview} />
      </Attachment>,
    );
    const trigger = screen.getByRole("button", { name: "Preview file" });
    expect(trigger.getAttribute("type")).toBe("button");
    expect(trigger.getAttribute("data-slot")).toBe("attachment-trigger");
    await user.click(trigger);
    expect(onPreview).toHaveBeenCalledTimes(1);
  });

  it("supports rendering as a link via the render prop", () => {
    render(
      <Attachment>
        <AttachmentTrigger render={<a href="/files/report.pdf" />}>
          Open report
        </AttachmentTrigger>
      </Attachment>,
    );
    const link = screen.getByRole("link", { name: "Open report" });
    expect(link.getAttribute("href")).toBe("/files/report.pdf");
    // The default button type must not leak onto the anchor.
    expect(link.hasAttribute("type")).toBe(false);
  });

  it("appends a custom className to the overlay classes", () => {
    render(
      <Attachment>
        <AttachmentTrigger aria-label="Preview" className="cursor-zoom-in" />
      </Attachment>,
    );
    const trigger = screen.getByRole("button", { name: "Preview" });
    expect(trigger.className).toContain("cursor-zoom-in");
    expect(trigger.className).toContain("absolute");
  });
});

describe("AttachmentGroup", () => {
  it("renders multiple attachments", () => {
    const { container } = render(
      <AttachmentGroup>
        <FileAttachment />
        <FileAttachment />
      </AttachmentGroup>,
    );
    expect(
      container.querySelectorAll('[data-slot="attachment"]'),
    ).toHaveLength(2);
  });

  it("renders an empty group without children", () => {
    const { container } = render(<AttachmentGroup data-testid="group" />);
    const group = container.querySelector('[data-slot="attachment-group"]');
    expect(group).not.toBeNull();
    expect(group?.childElementCount).toBe(0);
  });

  it("appends a custom className", () => {
    render(<AttachmentGroup data-testid="group" className="max-w-md" />);
    const group = screen.getByTestId("group");
    expect(group.className).toContain("max-w-md");
    expect(group.className).toContain("overflow-x-auto");
  });
});
