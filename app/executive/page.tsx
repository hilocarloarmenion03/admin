import Link from "next/link";
import { requireRole } from "@/lib/auth/authorization";
export default async function ExecutiveDashboard() {
  await requireRole("executive");
  return <main className="hq-exec-empty"><h1>Executive dashboard</h1><p>Explore headquarters staff totals in <Link href="/executive/accounts">Account Access</Link>.</p></main>;
}
