import type { ReactNode } from "react";

export default function AuthCard({ children }: { children: ReactNode }) {
  return (
  <main className="hq-login-screen"><section className="hq-login-card">
      <div className="hq-login-logo">Loxada<span>Headquarters</span></div>
      {children}
    </section>
  </main>
  );
}
