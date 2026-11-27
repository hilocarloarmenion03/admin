import Link from "next/link";
import { signOut } from "@/app/actions/auth";
import { requireRole } from "@/lib/auth/authorization";
export default async function ExecutiveLayout({children}:{children:React.ReactNode}) {
  const member = await requireRole("executive");
  const username = member.user.email?.split("@")[0] ?? "Staff";
  return <div className="hq-exec-shell">
    <header className="hq-exec-bar">
      <strong>Loxada <span>Headquarters</span></strong>
      <nav aria-label="Executive navigation"><Link href="/executive">Overview</Link><Link href="/executive/reading">Manga reading</Link><Link href="/executive/accounts">Account Access</Link><Link href="/executive/opportunities">Feasibility reviews</Link></nav>
      <div className="hq-exec-account"><div><b title={member.user.email}>{username}</b><small>Executive</small></div><form action={signOut}><button type="submit">Log out</button></form></div>
    </header>
    <div className="hq-exec-content">{children}</div>
  </div>;
}
