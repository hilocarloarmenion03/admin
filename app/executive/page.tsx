import { requireRole } from "@/lib/auth/authorization";
export default async function ExecutiveDashboard() {
  await requireRole("executive");
  return <main className="hq-exec-empty"><h1>Executive dashboard</h1><p>No modules added yet.</p></main>;
}
