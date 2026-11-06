import { signIn } from "@/app/actions/auth";
import { getStaffMember } from "@/lib/auth/authorization";
import { destinationForRole } from "@/lib/auth/roles";
import { redirect } from "next/navigation";

const messages: Record<string, string> = {
  invalid: "Account or password could not be verified.",
  unauthorized: "This account does not have Headquarters access.",
  configuration: "Sign-in is not configured for this environment.",
};
export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  const member = await getStaffMember();
  if (member) redirect(destinationForRole(member.role));
  const error = params.error ? messages[params.error] ?? messages.invalid : null;
  return <main className="hq"><aside className="hq-rail"><strong>L.</strong><div><span>▦</span><span>◈</span><span>☷</span></div><small>HQ<br/>001</small></aside><div className="hq-body"><header className="hq-header"><b>LOXADA / HEADQUARTERS</b><span>AUTHORIZATION GATEWAY — 01</span></header><section className="hq-stage"><div className="hq-statement"><p className="eyebrow">CONFIDENTIAL OPERATIONS / 2026</p><h1>Lead with<br/><em>clarity.</em></h1><p>Two responsibilities.<br/>One accountable headquarters.</p><div className="hq-departments"><span>EXECUTIVE / BUSINESS</span><span>TECHNICAL / SYSTEMS</span></div></div><div className="hq-card"><div className="hq-card-head"><b>STAFF ACCESS</b><span>↗ 001</span></div><div className="hq-card-body"><div className="hq-symbol">⌘</div><h2>Identity check.</h2><p>Sign in as an approved executive or technical administrator.</p>{error && <p role="alert" className="hq-error">{error}</p>}<form action={signIn}><label htmlFor="identity">EMAIL OR USERNAME</label><input id="identity" name="email" type="text" autoComplete="username" placeholder="work@email.com" required/><label htmlFor="pass">PASSWORD</label><input id="pass" name="password" type="password" autoComplete="current-password" required/><button type="submit">AUTHORIZE ACCESS <span>↗</span></button></form></div><div className="hq-card-foot">INDIVIDUAL STAFF ACCOUNTS • VERIFIED SERVER-SIDE</div></div></section><footer className="hq-footer"><span>LOXADA ENTERTAINMENTS</span><span>PRIVATE SYSTEM / HEADQUARTERS ACCESS</span></footer></div></main>;
}
