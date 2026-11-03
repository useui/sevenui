"use client";

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
import { LabSection } from "../lab-frame";

const MEMBERS = [
  { name: "Ada Lovelace", role: "Owner", status: "Active", seats: 12 },
  { name: "Grace Hopper", role: "Admin", status: "Active", seats: 8 },
  { name: "Alan Turing", role: "Member", status: "Invited", seats: 1 },
  { name: "Release agent", role: "Agent", status: "Running", seats: 0 },
];

export default function TableMatrix() {
  return (
    <div>
      <LabSection title="members (hover a row; row 2 selected; row 3 expanded)">
        <Table>
          <TableCaption>4 of 24 members</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Seats</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MEMBERS.map((member, index) => (
              <TableRow
                key={member.name}
                data-state={index === 1 ? "selected" : undefined}
              >
                <TableCell className="font-medium">{member.name}</TableCell>
                <TableCell>{member.role}</TableCell>
                <TableCell>
                  {index === 2 ? (
                    <button type="button" aria-expanded>
                      {member.status}
                    </button>
                  ) : (
                    member.status
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {member.seats || "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={3}>Total</TableCell>
              <TableCell className="text-right">21</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </LabSection>
      <LabSection title="long content (horizontal scroll container)">
        <div className="w-64">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>INV-001</TableCell>
                <TableCell>A long line item description that scrolls</TableCell>
                <TableCell className="text-right">$1,250.00</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </LabSection>
    </div>
  );
}
