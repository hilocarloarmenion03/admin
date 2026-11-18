import type { StaffRole } from "../auth/roles";

export const roleOptions = [["executive", "Executive"], ["tech_admin", "Technical administrator"]] as const;
export const levels = ["year", "quarter", "month"] as const;
type Level = (typeof levels)[number];
export type StaffCell = { month: string; role: StaffRole; total: number };
export type StaffView = { period: string; level: Level; role: StaffRole | ""; layout: "time-rows" | "role-rows" };
export type StaffReportParams = Record<string, string | string[] | undefined>;

export function periodKey(value: unknown): string {
  return typeof value === "string" && /^(?:19|20|21)\d{2}(?:-(?:0[1-9]|1[0-2]|Q[1-4]))?$/.test(value) ? value : "";
}
const quarter = (month: string) => month.slice(0, 4) + "-Q" + Math.ceil(Number(month.slice(5)) / 3);
export const depth = (period: string) => !period ? 0 : period.length === 4 ? 1 : period.includes("-Q") ? 2 : 3;
const memberOf = (month: string, level: Level) => level === "month" ? month : level === "quarter" ? quarter(month) : month.slice(0, 4);
const phYear = new Intl.DateTimeFormat("en-PH", { timeZone: "Asia/Manila", year: "numeric" });
export const manilaYear = (date: Date) => phYear.format(date);

export function parseStaffView(p: StaffReportParams): StaffView {
  return {
    period: periodKey(p.period),
    level: p.level === "month" || p.level === "quarter" ? p.level : "year",
    role: p.role === "executive" || p.role === "tech_admin" ? p.role : "",
    layout: p.layout === "role-rows" ? "role-rows" : "time-rows",
  };
}
export function staffReportUrl(path: string, view: StaffView) {
  const p = new URLSearchParams({ level: view.level, layout: view.layout });
  if (view.role) p.set("role", view.role);
  if (view.period) p.set("period", view.period);
  return path + "?" + p.toString() + "#account-analysis";
}
export function drillDown(view: StaffView, member?: string): StaffView | null {
  if (view.level === "month") return null;
  if (member && (!periodKey(member) || depth(member) !== (view.level === "year" ? 1 : 2))) return null;
  return {
    ...view,
    period: member && depth(view.period) <= depth(member) ? member : view.period,
    level: view.level === "year" ? "quarter" : "month",
  };
}
export function drillUp(view: StaffView): StaffView | null {
  if (view.level === "year") return view.period ? { ...view, period: "" } : null;
  const d = depth(view.period);
  const period = view.level === "quarter" ? (d > 1 ? view.period.slice(0, 4) : "") :
    d === 3 ? quarter(view.period) : d === 2 ? view.period.slice(0, 4) : view.period;
  return { ...view, period, level: view.level === "month" ? "quarter" : "year" };
}
export function periodsInYear(year: string) {
  return {
    quarters: Array.from({ length: 4 }, (_, i) => year + "-Q" + (i + 1)),
    months: Array.from({ length: 12 }, (_, i) => year + "-" + String(i + 1).padStart(2, "0")),
  };
}
export function isStaffCells(data: unknown): data is StaffCell[] {
  return Array.isArray(data) && data.every(cell => cell && depth(periodKey(cell.month)) === 3 &&
    roleOptions.some(([role]) => role === cell.role) && Number.isSafeInteger(cell.total) && cell.total >= 0);
}
export function buildStaffCube(cells: StaffCell[], view: StaffView) {
  const roles = roleOptions.map(([role]) => role).filter(role => !view.role || role === view.role);
  const inScope = (month: string) => !view.period || view.period === month || view.period === quarter(month) || view.period === month.slice(0, 4);
  const eligible = cells.filter(cell => roles.includes(cell.role) && inScope(cell.month));
  const months = view.period ? periodsInYear(view.period.slice(0, 4)).months.filter(inScope) : eligible.map(cell => cell.month);
  const periods = [...new Set(months.map(month => memberOf(month, view.level)))].sort().reverse();
  const counts = new Map<string, number>();
  const roleTotals = new Map<StaffRole, number>();
  const periodTotals = new Map<string, number>();
  let total = 0;
  for (const cell of eligible) {
    const period = memberOf(cell.month, view.level);
    const key = period + ":" + cell.role;
    counts.set(key, (counts.get(key) ?? 0) + cell.total);
    roleTotals.set(cell.role, (roleTotals.get(cell.role) ?? 0) + cell.total);
    periodTotals.set(period, (periodTotals.get(period) ?? 0) + cell.total);
    total += cell.total;
  }
  return { roles, periods, counts, roleTotals, periodTotals, total };
}
