export type StaffRole = "executive" | "tech_admin";

export function isStaffRole(role: unknown): role is StaffRole {
  return role === "executive" || role === "tech_admin";
}

export function destinationForRole(role: StaffRole): "/executive" | "/admin" {
  return role === "executive" ? "/executive" : "/admin";
}

// Only a trusted operator can grant the separate owner flag; a technical admin cannot.
export function canExerciseOwnerAuthority(role: StaffRole, isOwner: boolean): boolean {
  return role === "executive" && isOwner;
}
