import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isStaffRole, type StaffRole } from "@/lib/auth/roles";

export async function getStaffMember() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return null;
  }
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user?.email_confirmed_at) return null;

  // RLS limits this lookup to the signed-in user's own UUID.
  const { data: staff, error: roleError } = await supabase
    .from("staff_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();
  if (roleError || !isStaffRole(staff?.role)) return null;
  return { user, role: staff.role };
}

export async function requireRole(requiredRole: StaffRole) {
  const member = await getStaffMember();
  if (!member || member.role !== requiredRole) redirect("/login?error=unauthorized");
  return member;
}

