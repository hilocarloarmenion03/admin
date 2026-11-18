import Form from "next/form";
import Link from "next/link";
import {
  buildStaffCube, depth, drillDown, drillUp, levels, manilaYear, parseStaffView, periodsInYear,
  roleOptions, staffReportUrl, type StaffCell, type StaffReportParams,
} from "@/lib/reporting/staff-account-model";

const numbers = new Intl.NumberFormat("en-PH");
const dates = new Intl.DateTimeFormat("en-PH", { month: "short", year: "numeric", timeZone: "UTC" });
const checked = new Intl.DateTimeFormat("en-PH", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Manila" });
const labelTime = (key: string) => depth(key) === 3 ? dates.format(new Date(key + "-01T00:00:00Z")) :
  depth(key) === 2 ? key.slice(5) + " " + key.slice(0, 4) : key;
const roleName = (role: string) => roleOptions.find(([code]) => code === role)?.[1] ?? role;

export default function StaffAccountAnalysis({ path, params, report }: {
  path: "/admin/accounts" | "/executive/accounts";
  params: StaffReportParams;
  report: { cells: StaffCell[]; checkedAt: string } | null;
}) {
  const view = parseStaffView(params);
  const year = Number(manilaYear(new Date()));
  const scopeYear = (view.period || view.focus).slice(0, 4) || String(year);
  const { quarters, months } = periodsInYear(scopeYear);
  const otherYears = [...new Set([...(report?.cells ?? []).map(cell => Number(cell.month.slice(0, 4))), Number(scopeYear)])]
    .filter(value => value !== year && value !== year - 1).sort((a, b) => b - a);
  const matrix = report && buildStaffCube(report.cells, view);
  const down = drillDown(view);
  const up = drillUp(view);
  const timeRows = view.layout === "time-rows";
  const pivot = { ...view, layout: timeRows ? "role-rows" as const : "time-rows" as const };
  const heading = (member: string) => {
    const target = drillDown(view, member);
    return target ? <Link href={staffReportUrl(path, target)} prefetch={false} aria-label={"Drill into " + labelTime(member)}>
      {labelTime(member)} <span aria-hidden="true">▾</span>
    </Link> : labelTime(member);
  };
  return <main className="hq-account-report" id="account-analysis">
    <header>
      <p className="hq-report-kicker">HEADQUARTERS / STAFF</p>
      <h1>Account Access</h1>
      <p>Analyze headquarters staff accounts by role and date. Department accounts are reported separately.</p>
    </header>
    <section className="hq-report-card" aria-labelledby="staff-account-heading">
      <h2 id="staff-account-heading">Account Analysis</h2>
      {matrix ? <p className="hq-report-count">{numbers.format(matrix.total)} current staff role records</p> :
        <p role="alert">Staff account counts are unavailable. Reload to try again.</p>}
      <Form key={JSON.stringify(view)} action={path + "#account-analysis"} className="hq-report-form">
        <input type="hidden" name="layout" value={view.layout}/>
        <input type="hidden" name="focus" value={view.focus}/>
        <input type="hidden" name="previousPeriod" value={view.period}/>
        <label>Staff role<select name="role" defaultValue={view.role}>
          <option value="">All staff roles</option>
          {roleOptions.map(([role, label]) => <option key={role} value={role}>{label}</option>)}
        </select></label>
        <label>Date range<select name="period" defaultValue={view.period}>
          <option value="">All time</option>
          <option value={year}>This year ({year})</option>
          <option value={year - 1}>Last year ({year - 1})</option>
          {otherYears.length > 0 && <optgroup label="Other years">{otherYears.map(value => <option key={value} value={value}>{value}</option>)}</optgroup>}
          <optgroup label={scopeYear + " quarters"}>{quarters.map(value => <option key={value} value={value}>{labelTime(value)}</option>)}</optgroup>
          <optgroup label={scopeYear + " months"}>{months.map(value => <option key={value} value={value}>{labelTime(value)}</option>)}</optgroup>
        </select></label>
        <label>Group dates by<select name="level" defaultValue={view.level}>
          {levels.map(level => <option key={level} value={level}>{level[0].toUpperCase() + level.slice(1)}</option>)}
        </select></label>
        <button type="submit">Apply report filters</button>
      </Form>
      <p className="hq-report-note"><strong>Applied filters</strong> · {view.role ? roleName(view.role) : "All staff roles"} · {view.period ? labelTime(view.period) : "All dates"}{view.focus ? " · Drilled into " + labelTime(view.focus) : ""}</p>
      <nav className="hq-report-drills" aria-label="Account analysis controls">
        <span>By {view.level}</span>
        {up && view.level !== "year" && <Link prefetch={false} href={staffReportUrl(path, up)}>↑ Drill up to {up.level === "year" ? "years" : "quarters"}</Link>}
        {down && <Link prefetch={false} href={staffReportUrl(path, down)}>↓ Drill down to {down.level === "quarter" ? "quarters" : "months"}</Link>}
        {view.focus && <Link prefetch={false} href={staffReportUrl(path, { ...view, focus: "" })}>Clear drill focus</Link>}
        <Link prefetch={false} href={staffReportUrl(path, pivot)}>Pivot rows and columns</Link>
        <Link prefetch={false} href={path + "#account-analysis"}>Reset report</Link>
      </nav>
      {matrix && matrix.periods.length > 0 && <div className="hq-report-table-wrap"><table aria-label={timeRows ? "Account dates by staff role" : "Staff roles by account date"}>
        <thead><tr><th scope="col">{timeRows ? "Staff record date" : "Staff role"}</th>
          {timeRows ? matrix.roles.map(role => <th key={role} scope="col">{roleName(role)}</th>) :
            matrix.periods.map(period => <th key={period} scope="col">{heading(period)}</th>)}<th scope="col">Total</th>
        </tr></thead>
        <tbody>{timeRows ? matrix.periods.map(period => <tr key={period}><th scope="row">{heading(period)}</th>
          {matrix.roles.map(role => <td key={role}>{numbers.format(matrix.counts.get(period + ":" + role) ?? 0)}</td>)}
          <td>{numbers.format(matrix.periodTotals.get(period) ?? 0)}</td></tr>) :
          matrix.roles.map(role => <tr key={role}><th scope="row">{roleName(role)}</th>
            {matrix.periods.map(period => <td key={period}>{numbers.format(matrix.counts.get(period + ":" + role) ?? 0)}</td>)}
            <td>{numbers.format(matrix.roleTotals.get(role) ?? 0)}</td></tr>)}</tbody>
        <tfoot><tr><th scope="row">Total</th>
          {timeRows ? matrix.roles.map(role => <td key={role}>{numbers.format(matrix.roleTotals.get(role) ?? 0)}</td>) :
            matrix.periods.map(period => <td key={period}>{numbers.format(matrix.periodTotals.get(period) ?? 0)}</td>)}
          <td>{numbers.format(matrix.total)}</td></tr></tfoot>
      </table></div>}
      {matrix && matrix.total === 0 && <p>No staff account records match this view.</p>}
      <p className="hq-report-note">The date is when the current staff-role record was created, in Philippine time. This is not sign-in activity or historical staffing. Staff counts are aggregate-only, so individual accounts are not linked.</p>
      {report && <p className="hq-report-note">Checked <time dateTime={report.checkedAt}>{checked.format(new Date(report.checkedAt))}</time> PHT</p>}
    </section>
  </main>;
}
