#!/usr/bin/env node
// Trusted manual operator only. Never expose this as an app endpoint.
import { randomBytes } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;
const email = process.env.STAFF_EMAIL;
const role = process.env.STAFF_ROLE;
if (!url || !key || !email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) ||
    !["executive", "tech_admin"].includes(role)) {
  console.error("Set private SUPABASE_URL, SUPABASE_SECRET_KEY, STAFF_EMAIL and STAFF_ROLE (executive or tech_admin).");
  process.exit(1);
}
const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
});
const temporaryPassword = randomBytes(24).toString("base64url");
const { data, error } = await supabase.auth.admin.createUser({
  email, password: temporaryPassword, email_confirm: false,
});
if (error || !data.user) {
  console.error("Unable to create an Auth user:", error?.message || "Unknown error");
  process.exit(1);
}
const { error: roleError } = await supabase.from("staff_roles").insert({
  user_id: data.user.id, role, is_owner: false,
});
if (roleError) {
  console.error("Auth user created but staff role assignment failed; manually reconcile the account:", roleError.message);
  process.exit(1);
}
console.log("Unconfirmed staff account created for", email, "with role", role);
console.log("Temporary password shown once in this trusted terminal:", temporaryPassword);
console.log("Confirm account email ownership; change the temporary password before production use.");
console.log("Owner authority has NOT been granted.");
