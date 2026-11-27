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
export type Measure = "read_starts" | "read_completions" | "title_distinct_readers" | "completion_rate";

export function monthsBetween(from: string, to: string) {
  const result: string[] = [];
  if (!/^\d{4}-\d{2}$/.test(from) || !/^\d{4}-\d{2}$/.test(to)) return result;
  const cursor = new Date(from + "-01T00:00:00Z");
  while (Number.isFinite(cursor.valueOf()) && cursor.toISOString().slice(0,7) <= to && result.length < 25) {
    result.push(cursor.toISOString().slice(0,7));
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }
  return result;
}

export function readingIndex(rows: ReadingRow[]) {
  const index = new Map<string, {coverage: ReadingRow["coverage"]; works: Map<string, ReadingRow>}>();
  for (const row of rows) {
    const month = row.month.slice(0,7);
    const entry = index.get(month) ?? {coverage: row.coverage, works: new Map<string, ReadingRow>()};
    if (row.work_id) entry.works.set(row.work_id, row);
    index.set(month, entry);
  }
  return index;
}

export function readingValue(index: ReturnType<typeof readingIndex>, months: string[], works: string[], measure: Measure) {
  if (!months.length) return "Unavailable";
  let starts = 0, completions = 0, readers = 0;
  for (const month of months) {
    const entry = index.get(month);
    if (!entry) return "Unavailable";
    if (entry.coverage === "withheld") return "Withheld";
    for (const work of works) {
      const row = entry.works.get(work);
      starts += row?.read_starts ?? 0;
      completions += row?.read_completions ?? 0;
      readers += row?.title_distinct_readers ?? 0;
    }
  }
  if (measure === "title_distinct_readers" && (months.length !== 1 || works.length !== 1)) return "Unavailable";
  if (measure === "completion_rate") return starts ? (100 * completions / starts).toFixed(1) + "%" : "N/A";
  return (measure === "read_starts" ? starts : measure === "read_completions" ? completions : readers).toLocaleString("en-PH");
}
