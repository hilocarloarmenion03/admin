import { requireRole } from "@/lib/auth/authorization";
export default async function TechnicalDashboard() {
  await requireRole("tech_admin");
  return <main className="hq-empty"><h1>Technical dashboard</h1><p>No tools added yet.</p></main>;
}
