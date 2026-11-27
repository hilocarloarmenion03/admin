"use client";

import { useState } from "react";

import { monthsBetween, readingIndex, readingValue, type ReadingRow, type Measure } from "./reading-model";
export type { ReadingRow } from "./reading-model";
const measures = {
  read_starts: "Reading starts", read_completions: "Completed reads",
  title_distinct_readers: "Distinct readers", completion_rate: "Completion rate"
};

const periods = ["Year", "Quarter", "Month"] as const;
function periodKey(month: string, depth: number) {
  if (depth === 0) return month.slice(0,4);
  if (depth === 1) return month.slice(0,4) + " Q" + Math.ceil(Number(month.slice(5,7))/3);
  return month.slice(0,7);
}
export default function ReadingExplorer({rows}: {rows: ReadingRow[]}) {
  const [selectedWorks,setSelectedWorks] = useState<string[]>([]);
  const [from,setFrom] = useState("");
  const [to,setTo] = useState("");
  const [depth,setDepth] = useState(2);
  const [focus,setFocus] = useState<{depth:number,key:string} | null>(null);
  const [swap,setSwap] = useState(false);
  const [metric,setMetric] = useState<Measure>("read_starts");
  const works = [...new Set(rows.flatMap(r=>r.work_id ? [r.work_id] : []))].sort();
  const available = rows.map(row => row.month.slice(0,7)).sort();
  const start = from || available[0];
  const end = to || available[available.length - 1];
  const months = monthsBetween(start, end).filter(month => !focus || periodKey(month,focus.depth) === focus.key);
  const byPeriod = [...new Set(months.map(month => periodKey(month,depth)))];
  const index = readingIndex(rows);
  const titles = selectedWorks.length ? selectedWorks : works;
  const subset = rows.filter(row => months.includes(row.month.slice(0,7)));
  const cell = (period: string | null, title: string | null) => readingValue(index,
    period ? months.filter(month => periodKey(month,depth) === period) : months,
    title ? [title] : titles, metric);
  const drill = (key: string) => {
    setFocus({depth,key});
    setDepth(depth+1);
  };
  const periodHeading = (key:string) => depth<2 ? <button onClick={()=>drill(key)}>{key} ▾</button> : key;
  return <section>
    <fieldset><legend>Explore published readings</legend>
      <label>Measure <select value={metric} onChange={e=>setMetric(e.target.value as Measure)}>{Object.entries(measures).map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label>{" "}
      <details><summary>{selectedWorks.length ? selectedWorks.length + " selected works" : "All works"}</summary>
        <button type="button" onClick={()=>setSelectedWorks([])}>Show all works</button>
        {works.map(id=><label key={id}><input type="checkbox" checked={selectedWorks.includes(id)}
          onChange={e=>setSelectedWorks(e.target.checked ? [...selectedWorks,id] : selectedWorks.filter(selected=>selected!==id))}/>{id}</label>)}
      </details>
      <label>From <input type="month" value={start} min={available[0]} max={end} onChange={e=>setFrom(e.target.value)}/></label>{" "}
      <label>Through <input type="month" value={end} min={start} max={available[available.length - 1]} onChange={e=>setTo(e.target.value)}/></label>{" "}
      <label>Group by <select value={depth} onChange={e=>{setDepth(Number(e.target.value));setFocus(null);}}>{periods.map((v,i)=><option value={i} key={v}>{v}</option>)}</select></label>{" "}
      <button type="button" onClick={()=>setSwap(!swap)}>Swap axes</button>{" "}
      <button type="button" disabled={depth===0} onClick={()=>{setDepth(depth-1);setFocus(null);}}>Roll up</button>
    </fieldset>
    {focus && <p>{focus.key} <button onClick={()=>setFocus(null)}>Clear focus</button></p>}
    <p>Figures cover the selected Manila months. Missing or withheld months prevent a complete total. Distinct readers are available at their original work-month grain.</p>
    <div style={{overflowX:"auto"}}><table><caption>{measures[metric]} by {periods[depth].toLowerCase()} and work</caption>
      <thead><tr><th>{swap ? "Work" : periods[depth]}</th>{(swap ? byPeriod : titles).map(k=><th scope="col" key={k}>{swap ? periodHeading(k) : k}</th>)}<th scope="col">Total</th></tr></thead>
      <tbody>{(swap ? titles : byPeriod).map(a=><tr key={a}><th scope="row">{swap ? a : periodHeading(a)}</th>
        {(swap ? byPeriod : titles).map(b=><td key={b}>{swap ? cell(b,a) : cell(a,b)}</td>)}<td>{swap ? cell(null,a) : cell(a,null)}</td></tr>)}</tbody>
      <tfoot><tr><th scope="row">Total</th>{(swap ? byPeriod : titles).map(k=><td key={k}>{swap ? cell(k,null) : cell(null,k)}</td>)}<td>{cell(null,null)}</td></tr></tfoot>
    </table></div>
    <details><summary>Publication coverage</summary><ul>{[...new Map(subset.map(row=>[row.month,row])).values()].map(row=><li key={row.month}>{row.month.slice(0,7)} · {row.coverage==="released" ? "Published" : row.coverage==="no_data" ? "Verified empty" : "Withheld"} · Revision {row.revision} · Source through {row.through_time}</li>)}</ul></details>
  </section>;
}
