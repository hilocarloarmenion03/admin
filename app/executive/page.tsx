import { signOut } from "@/app/actions/auth";
import { requireRole } from "@/lib/auth/authorization";
export default async function ExecutiveDashboard() {
  const member = await requireRole("executive");
  return <main className="exec-shell">
    <header className="exec-header"><div className="exec-wordmark">L. <span>LOXADA / EXECUTIVE OFFICE</span></div><div className="exec-heading-actions"><span>BUSINESS GOVERNANCE</span><form action={signOut}><button type="submit">Sign out ↗</button></form></div></header>
    <section className="exec-content">
      <div className="exec-intro"><p className="exec-eyebrow">HEADQUARTERS / LEADERSHIP</p><h1>A clear view<br/>of the <em>business.</em></h1><p>Welcome, {member.user.email}. Your executive account has been verified.</p></div>
      <div className="exec-status"><span>EXECUTIVE ACCESS</span><strong>Confirmed</strong><small>{member.isOwner ? "Owner authority independently verified" : "Owner-level approvals require separate authorization"}</small></div>
      <div className="exec-section-title"><h2>Business workspaces</h2><span>01 / 03 DEPARTMENTS</span></div>
      <div className="exec-departments">
        <article><span>01 / PUBLISHING</span><h3>Manga & Light Novel</h3><p>Approved performance reports and editorial decisions will appear here later.</p><small>PLANNED</small></article>
        <article><span>02 / DISTRIBUTION</span><h3>Anime</h3><p>Licensing, commissions and business oversight will appear here later.</p><small>PLANNED</small></article>
        <article><span>03 / COMMERCE</span><h3>Merchandise</h3><p>Authorized sales, suppliers and financial reporting will appear here later.</p><small>PLANNED</small></article>
      </div>
      <div className="exec-note"><strong>Business authority is separate from technical access.</strong><p>There are no live approvals or financial reports in this placeholder. Owner-required decisions must use verified Owner authority when built.</p></div>
    </section>
  </main>;
}
