import assert from "node:assert/strict";
import test from "node:test";
import { monthsBetween, readingIndex, readingValue } from "../app/executive/reading/reading-model.ts";

const months = monthsBetween("2025-12", "2026-02");
const base = { month: "2025-12-01", coverage: "released", work_id: "first", read_starts: 20, read_completions: 12, title_distinct_readers: 13 };
const index = readingIndex([base, {...base, month: "2026-02-01", coverage: "withheld", work_id: null}]);

test("rollups require coverage of every selected month", () => {
  assert.deepEqual(months, ["2025-12","2026-01","2026-02"]);
  assert.equal(readingValue(index, months.slice(0,2), ["first"], "read_starts"), "Unavailable");
  assert.equal(readingValue(index, [months[2]], ["first"], "read_starts"), "Withheld");
});
test("rates use summed starts and unique readers stay at work-month grain", () => {
  const idx = readingIndex([base, {...base, work_id: "second", read_starts: 80, read_completions: 20}]);
  assert.equal(readingValue(idx,[months[0]],["first","second"],"completion_rate"),"32.0%");
  assert.equal(readingValue(idx,[months[0]],["first","second"],"title_distinct_readers"),"Unavailable");
  assert.equal(readingValue(idx,[months[0]],["first"],"title_distinct_readers"),"13");
});
test("a verified empty month contributes zero starts", () => {
  const idx = readingIndex([{...base, coverage: "no_data", work_id:null}]);
  assert.equal(readingValue(idx,[months[0]],["first"],"read_starts"),"0");
  assert.equal(readingValue(idx,[months[0]],["first"],"completion_rate"),"N/A");
});
