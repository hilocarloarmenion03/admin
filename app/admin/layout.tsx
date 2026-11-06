import { requireRole } from "@/lib/auth/authorization";
export default async function TechnicalLayout({ children }: { children: React.ReactNode }) {
  await requireRole("tech_admin");
  return <>{children}</>;
}
