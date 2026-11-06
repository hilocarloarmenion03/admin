import { signOut } from "@/app/actions/auth";
import { requireRole } from "@/lib/auth/authorization";

export default async function TechnicalDashboard() {
  const member = await requireRole("tech_admin");
  return <main className="tech-shell">
    <aside className="tech-sidebar">
      <div className="tech-logo"><span>⌘</span> LOXADA / IT</div>
      <div className="tech-nav-caption">SYSTEM CONTROL</div>
      <div className="tech-active">◉ Overview</div>
      <div className="tech-nav-disabled">▤ Staff access · planned</div>
      <div className="tech-nav-disabled">⛨ Security logs · planned</div>
      <div className="tech-nav-disabled">▦ Infrastructure · planned</div>
      <div className="tech-sidebar-foot">TECHNICAL ADMINISTRATOR<br/>BUSINESS APPROVALS DISABLED</div>
    </aside>
    <section className="tech-main">
      <header className="tech-bar"><span><span className="tech-led">●</span> SYSTEM OPERATIONS / 01</span><form action={signOut}><button className="tech-logout" type="submit">Sign out ↗</button></form></header>
      <div className="tech-content">
        <p className="tech-kicker">TECHNICAL OPERATIONS · RESTRICTED AREA</p>
        <h1>System<br/><em>administration.</em></h1>
        <p className="tech-welcome">Signed in as {member.user.email} · Technical Admin</p>
        <div className="tech-command"><span>ACCESS VERIFICATION</span><strong>ADMIN ROLE CONFIRMED</strong><small>Your server-verified technical role permits entry to this workspace.</small></div>
        <div className="tech-widgets">
          <article><span>01 / IDENTITY</span><h2>Access management</h2><p>Account provisioning and permissions tools are not available yet.</p></article>
          <article><span>02 / INFRASTRUCTURE</span><h2>Service controls</h2><p>Deployment monitoring and technical settings will be connected later.</p></article>
          <article><span>03 / AUDIT</span><h2>Security records</h2><p>Audit logging dashboards are planned, not active.</p></article>
        </div>
        <p className="tech-boundary">Technical administrators cannot approve business spending or projects.</p>
      </div>
    </section>
  </main>;
}
