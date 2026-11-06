import { signIn } from "@/app/actions/auth";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
const messages: Record<string, string> = {invalid:"Invalid account or password.",unauthorized:"This account is not approved for Headquarters.",configuration:"Sign-in has not been configured."};
export default async function Login({searchParams}:{searchParams:Promise<{error?:string}>}){
 const params=await searchParams;
 if(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY){
   const supabase=await createClient();
   const {data:{user}}=await supabase.auth.getUser();
   if(user?.email_confirmed_at){
     const {data:staff}=await supabase.from("staff_roles").select("role").eq("user_id",user.id).maybeSingle();
     if(staff?.role==="owner_admin")redirect("/admin");
   }
 }
 const error=params.error ? messages[params.error] ?? messages.invalid : null;
 return <main className="hq"><aside className="hq-rail"><strong>L.</strong><div><span>▦</span><span>◈</span><span>☷</span></div><small>HQ<br/>001</small></aside><div className="hq-body"><header className="hq-header"><b>LOXADA / HEADQUARTERS</b><span>AUTHORIZATION GATEWAY — 01</span></header><section className="hq-stage"><div className="hq-statement"><p className="eyebrow">CONFIDENTIAL OPERATIONS / 2026</p><h1>Lead with<br/><em>clarity.</em></h1><p>One command center.<br/>Three departments. One direction.</p><div className="hq-departments"><span>01 / INK</span><span>02 / ANIME</span><span>03 / MERCH</span></div></div><div className="hq-card"><div className="hq-card-head"><b>STAFF ACCESS</b><span>↗ 001</span></div><div className="hq-card-body"><div className="hq-symbol">⌘</div><h2>Identity check.</h2><p>Enter your approved Headquarters credentials.</p>{error && <p role="alert" className="hq-error">{error}</p>}<form action={signIn}><label htmlFor="identity">EMAIL OR USERNAME</label><input id="identity" name="email" type="text" autoComplete="username" placeholder="admin" required/><label htmlFor="pass">PASSWORD</label><input id="pass" name="password" type="password" autoComplete="current-password" required/><button type="submit">AUTHORIZE ACCESS <span>↗</span></button></form></div><div className="hq-card-foot">STAFF IDENTITY • VERIFIED SERVER-SIDE</div></div></section><footer className="hq-footer"><span>LOXADA ENTERTAINMENTS</span><span>PRIVATE SYSTEM / ADMINISTRATIVE ACCESS</span></footer></div></main>;
}