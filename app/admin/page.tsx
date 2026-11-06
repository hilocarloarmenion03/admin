import { signOut } from "@/app/actions/auth";
import { requireAdmin } from "@/lib/auth/authorization";

export default async function AdminPage() {
  const user = await requireAdmin();
  return (<div className="hq-admin"><header><strong className="hq-mark">LOXADA / HQ</strong><form action={signOut}><button className="hq-signout" type="submit">Sign out ↗</button></form></header><p className="hq-kicker" style={{marginTop:75}}>Control center / secure</p><h1>Headquarters<br />overview.</h1><p>Signed in as {user.email}</p><div className="hq-dashboard"><strong>Owner access confirmed</strong><p>Your central workspace is secured. Management tools will be added here later.</p></div></div>);
}
