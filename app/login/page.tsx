import { signIn } from "@/app/actions/auth";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const messages: Record<string, string> = {
 invalid: "The email or password could not be verified.",
 unauthorized: "This account does not have permission to enter the admin area.",
 configuration: "Sign-in is not configured for this environment.",
};

export default async function Login({ searchParams }: { searchParams: Promise<{error?: string}> }) {
  const params = await searchParams;
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: record } = await supabase.from("staff_roles").select("role").eq("user_id", user.id).maybeSingle();
      if (record?.role === "owner_admin" && user.email_confirmed_at) redirect("/admin");
    }
  }
  const error = params.error ? messages[params.error] ?? messages.invalid : null;
  return (<div className="hq-shell"><section className="hq-left"><div className="hq-mark">LOXADA / HQ</div><div><div className="hq-number">01.</div><div className="hq-lead">A place for decisions that matter.</div></div><div className="hq-note">HEADQUARTERS · RESTRICTED ACCESS</div></section><section className="hq-right"><div className="hq-form"><div className="hq-kicker">Private access / 01</div><h1>Welcome back.</h1><p>Sign in to the central management workspace. Only approved owners and administrators can enter.</p>{error && <div className="hq-alert" role="alert">{error}</div>}<form action={signIn}><label htmlFor="email">WORK EMAIL</label><input id="email" type="email" name="email" autoComplete="username" required placeholder="name@company.com" /><label htmlFor="password">PASSWORD</label><input id="password" name="password" type="password" autoComplete="current-password" required minLength={1} /><button type="submit">Enter headquarters <span aria-hidden="true">↗</span></button></form></div></section></div>);
}
