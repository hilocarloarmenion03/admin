import Link from "next/link";
import { signOut } from "@/app/actions/auth";
import { requireRole } from "@/lib/auth/authorization";
export default async function TechnicalLayout({children}:{children:React.ReactNode}) {
  const member = await requireRole("tech_admin");
  const username = member.user.email?.split("@")[0] ?? "Staff";
  return <div className="hq-tech-shell">
    <aside className="hq-tech-rail">
      <div className="hq-tech-brand">Loxada <span>IT</span></div>
      <nav aria-label="Technical navigation"><Link href="/admin" aria-current="page">Overview</Link></nav>
      <div className="hq-tech-account"><strong title={member.user.email}>{username}</strong><span>Technical Admin</span><form action={signOut}><button type="submit">Log out</button></form></div>
    </aside>
    <div className="hq-tech-content">{children}</div>
  </div>;
}
