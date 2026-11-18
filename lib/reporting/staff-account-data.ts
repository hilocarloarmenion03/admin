import "server-only";
import { requireRole } from "@/lib/auth/authorization";
import type { StaffRole } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";
import { isStaffCells } from "./staff-account-model";

export async function loadStaffAccountReport(role: StaffRole) {
  await requireRole(role);
  const db = await createClient();
  const { data, error } = await db.rpc("hq_staff_account_counts");
  if (error || !isStaffCells(data)) return null;
  return { cells: data, checkedAt: new Date().toISOString() };
}
