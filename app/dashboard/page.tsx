import { SiteHeader } from "@/components/site-header";
import { QuantumDashboard } from "@/components/quantum-dashboard";

export const metadata = {
  title: "Quantum Dashboard | DNA-Lang",
  description:
    "Live quantum metrics, circuit simulation, and CCCE consciousness tracking.",
};

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 px-6 py-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">
              Quantum Dashboard
            </h1>
            <p className="mt-1 text-muted-foreground">
              Interactive circuit simulation, CCCE metrics, and agent
              orchestration monitor.
            </p>
          </div>
          <QuantumDashboard />
        </div>
      </main>
    </div>
  );
}
