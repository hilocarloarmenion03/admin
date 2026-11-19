import Link from "next/link";
import AuthCard from "@/app/components/auth-card";
import { signIn } from "@/app/actions/auth";
import { getStaffMember } from "@/lib/auth/authorization";
import { destinationForRole } from "@/lib/auth/roles";
import PasswordField from "./password-field";
import { redirect } from "next/navigation";

const messages: Record<string,string> = {invalid:"Incorrect email or password.",unauthorized:"This account is not approved for Headquarters.",configuration:"Login is not configured."};
export default async function Login({searchParams}:{searchParams:Promise<{error?:string;notice?:string}>}) {
  const params = await searchParams;
  const member = await getStaffMember();
  if (member) redirect(destinationForRole(member.role));
  const error = params.error ? messages[params.error] ?? messages.invalid : null;
  return <AuthCard>
    <h1>Sign in</h1>
    {error && <p role="alert" className="hq-error">{error}</p>}
    {params.notice === "password-reset" ? <p role="status">Password updated. Sign in with your new password.</p> : null}
    <form action={signIn}>
      <label htmlFor="hq-identity">Email or username</label>
      <input id="hq-identity" name="email" autoComplete="username" type="text" required />
      <label htmlFor="hq-password">Password</label>
      <PasswordField/>
      <Link className="mt-3 inline-block text-sm font-semibold underline underline-offset-4" href="/forgot-password">Forgot password?</Link>
      <button className="hq-signin" type="submit">Sign in</button>
    </form>
  </AuthCard>;
}
