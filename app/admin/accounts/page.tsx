import StaffAccountAnalysis from "@/app/components/staff-account-analysis";
import { loadStaffAccountReport } from "@/lib/reporting/staff-account-data";
import type { StaffReportParams } from "@/lib/reporting/staff-account-model";

export default async function TechnicalAccountAccess({ searchParams }: { searchParams: Promise<StaffReportParams> }) {
  const [params, report] = await Promise.all([searchParams, loadStaffAccountReport("tech_admin")]);
  return <StaffAccountAnalysis path="/admin/accounts" params={params} report={report}/>;
}
