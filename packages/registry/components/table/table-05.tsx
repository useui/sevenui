"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/registry/base/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/registry/base/ui/table";

const WEEKS = [1, 2, 3, 4, 5];

// Share of each signup cohort still active N weeks later. Newer cohorts
// have fewer weeks of data.
const cohorts = [
  { week: "Aug 17", users: 1284, retention: [62, 48, 41, 37, 35] },
  { week: "Aug 24", users: 1102, retention: [58, 45, 39, 36] },
  { week: "Aug 31", users: 1467, retention: [66, 53, 47] },
  { week: "Sep 7", users: 1391, retention: [71, 57] },
  { week: "Sep 14", users: 1530, retention: [69] },
];

// Tint steps stay light enough for foreground text in both themes.
function heat(value: number) {
  if (value >= 65) return "bg-chart-1/50";
  if (value >= 55) return "bg-chart-1/35";
  if (value >= 45) return "bg-chart-1/25";
  if (value >= 38) return "bg-chart-1/15";
  return "bg-chart-1/10";
}

function average(index: number) {
  const rows = cohorts.filter((cohort) => cohort.retention[index] != null);
  const users = rows.reduce((sum, cohort) => sum + cohort.users, 0);
  const retained = rows.reduce(
    (sum, cohort) => sum + cohort.users * cohort.retention[index],
    0,
  );
  return Math.round(retained / users);
}

export default function Table05() {
  return (
    <Card className="w-full max-w-xl">
      <CardHeader>
        <CardTitle id="table-05-title">Weekly retention</CardTitle>
        <CardDescription>
          Share of each signup cohort still active in the weeks after signup.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Table aria-labelledby="table-05-title" className="table-fixed">
          <TableHeader className="[&_tr]:border-0">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-20 pl-0 text-xs text-muted-foreground sm:w-32">
                Cohort
              </TableHead>
              {WEEKS.map((week) => (
                <TableHead
                  key={week}
                  className="px-0.5 text-center text-xs text-muted-foreground"
                >
                  <abbr title={`Week ${week}`} className="no-underline">
                    W{week}
                  </abbr>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {cohorts.map((cohort) => (
              <TableRow
                key={cohort.week}
                className="border-0 hover:bg-transparent"
              >
                <TableHead scope="row" className="h-auto py-0.5 pl-0">
                  <span className="block text-sm font-medium">
                    {cohort.week}
                  </span>
                  <span className="block text-xs font-normal text-muted-foreground tabular-nums">
                    {cohort.users.toLocaleString("en-US")} users
                  </span>
                </TableHead>
                {WEEKS.map((week, index) => {
                  const value = cohort.retention[index];
                  return (
                    <TableCell key={week} className="px-0.5 py-0.5">
                      {value == null ? (
                        <div className="h-9 rounded-md border border-dashed">
                          <span className="sr-only">No data yet</span>
                        </div>
                      ) : (
                        <div
                          className={`flex h-9 items-center justify-center rounded-md text-[0.6875rem] font-medium tabular-nums sm:text-xs ${heat(value)}`}
                        >
                          {value}%
                        </div>
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
          <TableFooter className="bg-transparent">
            <TableRow className="hover:bg-transparent">
              <TableHead scope="row" className="pl-0 text-sm">
                Average
              </TableHead>
              {WEEKS.map((week, index) => (
                <TableCell
                  key={week}
                  className="px-0.5 text-center text-[0.6875rem] font-semibold tabular-nums sm:text-xs"
                >
                  {average(index)}%
                </TableCell>
              ))}
            </TableRow>
          </TableFooter>
        </Table>
        <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
          <span>Lower</span>
          <div aria-hidden="true" className="flex gap-0.5">
            {[30, 40, 50, 60, 70].map((sample) => (
              <span
                key={sample}
                className={`size-3 rounded-sm ${heat(sample)}`}
              />
            ))}
          </div>
          <span>Higher</span>
        </div>
      </CardContent>
    </Card>
  );
}
