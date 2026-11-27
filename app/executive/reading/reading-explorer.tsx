"use client";

import { useState } from "react";

export type ReadingRow = {
  month: string;
  revision: number;
  through_time: string;
  coverage: "released" | "no_data" | "withheld";
  work_id: string | null;
  read_starts: number | null;
  read_completions: number | null;
  title_distinct_readers: number | null;
};
const measures = {
  read_starts: "Reading starts", read_completions: "Completed reads",
  title_distinct_readers: "Distinct readers", completion_rate: "Completion rate"
};
type Measure = keyof typeof measures;
const periods = ["Year", "Quarter", "Month"] as const;
function periodKey(month: string, depth: number) {
  if (depth === 0) return month.slice(0,4);
  if (depth === 1) return month.slice(0,4) + " Q" + Math.ceil(Number(month.slice(5,7))/3);
  return month.slice(0,7);
}
function value(rows: ReadingRow[], metric: Measure) {
  if (!rows.length) return "Unavailable";
  if (metric === "title_distinct_readers") return rows.length === 1 ? rows[0].title_distinct_readers : "Unavailable";
  const total = (key: "read_starts" | "read_completions") => rows.reduce((n,r) => n+(r[key] ?? 0),0);
  if (metric === "completion_rate") return total("read_starts") ? (100*total("read_completions")/total("read_starts")).toFixed(1)+"%" : "Unavailable";
  return total(metric).toLocaleString("en-PH");
}

export default function ReadingExplorer({rows}: {rows: ReadingRow[]}) {
  const [work,setWork] = useState("");
  const [from,setFrom] = useState("");
  const [to,setTo] = useState("");
  const [depth,setDepth] = useState(2);
  const [focus,setFocus] = useState<{depth:number,key:string} | null>(null);
  const [swap,setSwap] = useState(false);
  const [metric,setMetric] = useState<Measure>("read_starts");
  const works = [...new Set(rows.flatMap(r=>r.work_id ? [r.work_id] : []))].sort();
  const subset = rows.filter(r=>(!from || r.month.slice(0,7)>=from) && (!to || r.month.slice(0,7)<=to)
    && (!focus || periodKey(r.month,focus.depth)===focus.key));
  const byPeriod = [...new Set(subset.map(r=>periodKey(r.month,depth)))].sort();
  const cells = new Map<string,ReadingRow[]>();
  const visibleWorks = new Set<string>();
  for (const row of subset) {
    if (!row.work_id || (work && row.work_id!==work)) continue;
    visibleWorks.add(row.work_id);
    const key = JSON.stringify([periodKey(row.month,depth),row.work_id]);
    const group = cells.get(key) ?? [];
    group.push(row);
    cells.set(key,group);
  }
  const titles = [...visibleWorks].sort();
  const drill = (key: string) => {
    setFocus({depth,key});
    setDepth(depth+1);
  };
  const periodHeading = (key:string) => depth<2 ? <button onClick={()=>drill(key)}>{key} ▾</button> : key;
  return <section>
    <fieldset><legend>Explore published readings</legend>
      <label>Measure <select value={metric} onChange={e=>setMetric(e.target.value as Measure)}>{Object.entries(measures).map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label>{" "}
      <label>Work <select value={work} onChange={e=>setWork(e.target.value)}><option value="">All works</option>{works.map(id=><option key={id}>{id}</option>)}</select></label>{" "}
      <label>From <input type="month" value={from} max={to || undefined} onChange={e=>setFrom(e.target.value)}/></label>{" "}
      <label>Through <input type="month" value={to} min={from || undefined} onChange={e=>setTo(e.target.value)}/></label>{" "}
      <label>Group by <select value={depth} onChange={e=>{setDepth(Number(e.target.value));setFocus(null);}}>{periods.map((v,i)=><option value={i} key={v}>{v}</option>)}</select></label>{" "}
      <button type="button" onClick={()=>setSwap(!swap)}>Swap axes</button>{" "}
      <button type="button" disabled={depth===0} onClick={()=>{setDepth(depth-1);setFocus(null);}}>Roll up</button>
    </fieldset>
    {focus && <p>{focus.key} <button onClick={()=>setFocus(null)}>Clear focus</button></p>}
    <p>Figures cover published work-months only. Distinct readers are available at their original work-month grain.</p>
    <div style={{overflowX:"auto"}}><table><caption>{measures[metric]} by {periods[depth].toLowerCase()} and work</caption>
      <thead><tr><th>{swap ? "Work" : periods[depth]}</th>{(swap ? byPeriod : titles).map(k=><th scope="col" key={k}>{swap ? periodHeading(k) : k}</th>)}</tr></thead>
      <tbody>{(swap ? titles : byPeriod).map(a=><tr key={a}><th scope="row">{swap ? a : periodHeading(a)}</th>
        {(swap ? byPeriod : titles).map(b=><td key={b}>{value(cells.get(JSON.stringify(swap?[b,a]:[a,b])) ?? [],metric)}</td>)}</tr>)}</tbody>
    </table></div>
    <details><summary>Publication coverage</summary><ul>{[...new Map(subset.map(row=>[row.month,row])).values()].map(row=><li key={row.month}>{row.month.slice(0,7)} · {row.coverage==="released" ? "Published" : row.coverage==="no_data" ? "Verified empty" : "Withheld"} · Revision {row.revision} · Source through {row.through_time}</li>)}</ul></details>
  </section>;
}
