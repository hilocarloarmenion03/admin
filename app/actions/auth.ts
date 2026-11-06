"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isStaffRole, destinationForRole } from "@/lib/auth/roles";

export async function signIn(formData: FormData) {
  const identity = formData.get("email");
  const password = formData.get("password");
  const raw = typeof identity === "string" ? identity.trim() : "";
  // Optional private alias. This NEVER grants a role.
  const email = raw.toLowerCase() === "admin" ? process.env.ADMIN_LOGIN_EMAIL : raw;
  if (typeof email !== "string" || !email.includes("@") || email.length > 254 ||
      typeof password !== "string" || !password || password.length > 1024) {
    redirect("/login?error=invalid");
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    redirect("/login?error=configuration");
  }
  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
  if (signInError) redirect("/login?error=invalid");
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user?.email_confirmed_at) {
    await supabase.auth.signOut();
    redirect("/login?error=invalid");
  }
  const { data: membership, error: roleError } = await supabase
    .from("staff_roles").select("role").eq("user_id", user.id).maybeSingle();
  if (roleError || !isStaffRole(membership?.role)) {
    await supabase.auth.signOut();
    redirect("/login?error=unauthorized");
  }
  redirect(destinationForRole(membership.role));
}

export async function signOut() {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/login");
}
