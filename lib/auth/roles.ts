export type StaffRole = "executive" | "tech_admin";

export function isStaffRole(role: unknown): role is StaffRole {
  return role === "executive" || role === "tech_admin";
}

export function destinationForRole(role: StaffRole): "/executive" | "/admin" {
  return role === "executive" ? "/executive" : "/admin";
}

