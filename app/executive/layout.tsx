import { requireRole } from "@/lib/auth/authorization";
export default async function ExecutiveLayout({ children }: { children: React.ReactNode }) {
  await requireRole("executive");
  return <>{children}</>;
}
