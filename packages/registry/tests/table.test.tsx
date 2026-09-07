import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/registry/base/ui/table";

function renderFullTable() {
  return render(
    <Table data-testid="table">
      <TableCaption>Recent invoices</TableCaption>
      <TableHeader data-testid="thead">
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead>Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody data-testid="tbody">
        <TableRow data-testid="row">
          <TableCell>INV-001</TableCell>
          <TableCell>$250.00</TableCell>
        </TableRow>
      </TableBody>
      <TableFooter data-testid="tfoot">
        <TableRow>
          <TableCell>Total</TableCell>
          <TableCell>$250.00</TableCell>
        </TableRow>
      </TableFooter>
    </Table>,
  );
}

describe("Table", () => {
  it("renders a semantic table wrapped in a scroll container", () => {
    renderFullTable();
    const table = screen.getByTestId("table");
    expect(table.tagName).toBe("TABLE");
    expect(table.getAttribute("data-slot")).toBe("table");
    const container = table.parentElement;
    expect(container?.getAttribute("data-slot")).toBe("table-container");
  });

  it("is exposed with the table role and accessible caption", () => {
    renderFullTable();
    expect(screen.getByRole("table")).not.toBeNull();
    const caption = screen.getByText("Recent invoices");
    expect(caption.tagName).toBe("CAPTION");
    expect(caption.getAttribute("data-slot")).toBe("table-caption");
  });

  it("renders semantic section elements with data-slot attributes", () => {
    renderFullTable();
    const thead = screen.getByTestId("thead");
    const tbody = screen.getByTestId("tbody");
    const tfoot = screen.getByTestId("tfoot");
    expect(thead.tagName).toBe("THEAD");
    expect(thead.getAttribute("data-slot")).toBe("table-header");
    expect(tbody.tagName).toBe("TBODY");
    expect(tbody.getAttribute("data-slot")).toBe("table-body");
    expect(tfoot.tagName).toBe("TFOOT");
    expect(tfoot.getAttribute("data-slot")).toBe("table-footer");
  });

  it("renders rows, header cells and data cells with correct tags", () => {
    renderFullTable();
    const row = screen.getByTestId("row");
    expect(row.tagName).toBe("TR");
    expect(row.getAttribute("data-slot")).toBe("table-row");
    const head = screen.getByText("Invoice");
    expect(head.tagName).toBe("TH");
    expect(head.getAttribute("data-slot")).toBe("table-head");
    const cell = screen.getByText("INV-001");
    expect(cell.tagName).toBe("TD");
    expect(cell.getAttribute("data-slot")).toBe("table-cell");
  });

  it("exposes accessible row and cell roles", () => {
    renderFullTable();
    expect(screen.getAllByRole("row")).toHaveLength(3);
    expect(screen.getAllByRole("columnheader")).toHaveLength(2);
    expect(screen.getAllByRole("cell").length).toBeGreaterThanOrEqual(2);
  });

  it("appends custom classNames on the table and its parts", () => {
    render(
      <Table className="custom-table" data-testid="table">
        <TableBody>
          <TableRow className="custom-row" data-testid="row">
            <TableCell className="custom-cell" data-testid="cell">
              Value
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(screen.getByTestId("table").className).toContain("custom-table");
    expect(screen.getByTestId("table").className).toContain("w-full");
    expect(screen.getByTestId("row").className).toContain("custom-row");
    expect(screen.getByTestId("cell").className).toContain("custom-cell");
  });

  it("supports selected state styling hook on rows", () => {
    render(
      <Table>
        <TableBody>
          <TableRow data-state="selected" data-testid="row">
            <TableCell>Selected row</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(screen.getByTestId("row").getAttribute("data-state")).toBe(
      "selected",
    );
  });
});
