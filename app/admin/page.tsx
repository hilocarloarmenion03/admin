import Link from "next/link";
import { requireRole } from "@/lib/auth/authorization";
export default async function TechnicalDashboard() {
  await requireRole("tech_admin");
  return <main className="hq-empty"><h1>Technical dashboard</h1><p>Review headquarters staff-role counts in <Link href="/admin/accounts">Account Access</Link>.</p></main>;
}
