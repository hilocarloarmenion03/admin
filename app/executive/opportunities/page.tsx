import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/authorization";
import { createClient } from "@/lib/supabase/server";

type Proposal = {
  id: string; path: string; subject_ref: string; revision: number;
  period_start: string; period_end: string; rationale: string; rights_inquiry: string;
  product_category: string | null; outcome: string | null; reason: string | null;
  evidence_ref: string; evidence_revision: number;
};

async function review(form: FormData) {
  "use server";
  await requireRole("executive");
  const db = await createClient();
  const { error } = await db.rpc("hq_review_opportunity", {
    p_id: form.get("id"), p_outcome: form.get("outcome"), p_reason: form.get("reason"),
  });
  redirect(error ? "/executive/opportunities?result=error" : "/executive/opportunities?result=saved");
}

export default async function Opportunities({ searchParams }: {
  searchParams: Promise<{ result?: string }>;
}) {
  await requireRole("executive");
  const db = await createClient();
  const { data, error } = await db.rpc("hq_opportunities_for_review");
  const { result } = await searchParams;
  return <main><h1>Feasibility reviews</h1>
    {result === "error" && <p role="alert">Decision could not be saved. Check the current proposal and try again.</p>}
    {result === "saved" && <p role="status">Decision recorded.</p>}
    {error ? <p role="alert">Reviews are unavailable.</p> : (data as Proposal[]).length === 0
      ? <p>No department proposals have reached Headquarters.</p>
      : (data as Proposal[]).map(p => <article key={p.id}>
        <h2>{p.subject_ref}</h2>
        <p>{p.path === "manga_to_anime" ? "Anime adaptation" : "Merchandise investigation"} · Revision {p.revision}</p>
        <p>{p.rationale}</p><p>Evidence period {p.period_start} – {p.period_end}</p>
        <p>Evidence {p.evidence_ref} · Revision {p.evidence_revision}</p>
        <p>Rights inquiry · {p.rights_inquiry}</p>
        {p.product_category && <p>Product category · {p.product_category}</p>}
        {p.outcome ? <p>Decision · {p.outcome} · {p.reason}</p> : <form action={review}>
          <input type="hidden" name="id" value={p.id} />
          <label>Feasibility decision <select name="outcome" required defaultValue="">
            <option value="" disabled>Select a decision</option><option value="investigate">Approve investigation</option>
            <option value="return">Return for information</option><option value="decline">Decline</option>
          </select></label>
          <label>Reason <input name="reason" maxLength={240} required /></label><button>Record decision</button>
        </form>}
      </article>)}
  </main>;
}
