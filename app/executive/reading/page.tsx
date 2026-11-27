import { requireRole } from "@/lib/auth/authorization";
import { createClient } from "@/lib/supabase/server";

import ReadingExplorer, {type ReadingRow} from "./reading-explorer";

export default async function ReadingPage() {
  await requireRole("executive");
  const db = await createClient();
  const { data, error } = await db.rpc("hq_reading_report");
  const rows: ReadingRow[] = data ?? [];
  return <main className="hq-exec-empty">
    <h1>Manga reading</h1>
    {error ? <p>{error.code === "42501" ? "This report requires approved executive access to reading figures." : "Published figures are temporarily unavailable."}</p>
      : !rows.length ? <p>No approved reading figures are available.</p>
      : <ReadingExplorer rows={rows}/>}
  </main>;
}
