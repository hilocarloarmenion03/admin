import Link from "next/link";
import { requireRole } from "@/lib/auth/authorization";
import styles from "./overview.module.css";

const reports = [
  { department: "Manga & Light Novel", title: "Reading engagement", href: "/executive/reading", detail: "Explore chapter starts and completions by work and month." },
  { department: "Anime", title: "Title viewing", href: "/executive/viewing", detail: "Compare viewing activity across titles and months." },
  { department: "Merchandise", title: "Inventory", href: "/executive/inventory", detail: "Check stock by product, warehouse and reporting day." },
];

export default async function ExecutiveDashboard() {
  await requireRole("executive");
  return <main className="hq-exec-empty">
    <h1>Department reports</h1>
    <p>Explore the reporting periods each department has published to Headquarters.</p>
    <div className={styles.reports}>
      {reports.map(report => <Link className={styles.report} key={report.href} href={report.href}>
        <span>{report.department}</span>
        <h2>{report.title}</h2>
        <p>{report.detail}</p>
      </Link>)}
    </div>
  </main>;
}
