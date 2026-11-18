import assert from "node:assert/strict";
import test from "node:test";
import { buildStaffCube, drillDown, drillUp, isStaffCells, manilaYear, parseStaffView, staffReportUrl } from "../lib/reporting/staff-account-model.ts";

const cells = [
  { month: "2025-10", role: "tech_admin", total: 2 },
  { month: "2025-12", role: "executive", total: 1 },
  { month: "2025-12", role: "tech_admin", total: 3 },
  { month: "2026-01", role: "executive", total: 4 },
];

test("staff role, date scope, and grouping are independent", () => {
  const view = parseStaffView({ role: "tech_admin", period: "2025", level: "month" });
  const matrix = buildStaffCube(cells, view);
  assert.deepEqual(matrix.roles, ["tech_admin"]);
  assert.equal(matrix.periods.length, 12);
  assert.equal(matrix.counts.get("2025-12:tech_admin"), 3);
  assert.equal(matrix.total, 5);
});

test("drill and pivot retain the role filter and aggregate counts", () => {
  const all = parseStaffView({ role: "tech_admin", layout: "role-rows" });
  const year = drillDown(all, "2025");
  const quarter = drillDown(year, "2025-Q4");
  assert.deepEqual(quarter, { ...all, period: "2025-Q4", level: "month" });
  assert.deepEqual(drillUp(quarter), year);
  assert.deepEqual(drillUp(year), all);
  const a = buildStaffCube(cells, quarter);
  const b = buildStaffCube(cells, { ...quarter, layout: "time-rows" });
  assert.deepEqual(a, b);
  assert.equal(a.total, [...a.periodTotals.values()].reduce((sum, count) => sum + count, 0));
  assert.equal(a.total, [...a.roleTotals.values()].reduce((sum, count) => sum + count, 0));
  assert.match(staffReportUrl("/executive/accounts", quarter), /role=tech_admin&period=2025-Q4#account-analysis/);
});

test("aggregate contract excludes unknown roles and distinguishes zero from bad data", () => {
  assert.equal(isStaffCells(cells), true);
  assert.equal(isStaffCells([]), true);
  assert.equal(isStaffCells(null), false);
  assert.equal(isStaffCells([{ month: "2025-12", role: "owner", total: 1 }]), false);
  assert.equal(isStaffCells([{ month: "2025-12", role: "executive", total: -1 }]), false);
  assert.equal(isStaffCells([{ month: "2025-Q4", role: "executive", total: 1 }]), false);
  assert.equal(buildStaffCube([], parseStaffView({ period: "2025-Q4", level: "month" })).total, 0);
  assert.equal(manilaYear(new Date("2025-12-31T16:00:00Z")), "2026");
});
