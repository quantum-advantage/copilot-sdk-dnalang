import { SiteHeader } from "@/components/site-header";
import { HeroSection } from "@/components/hero-section";
import { FeaturesSection } from "@/components/features-section";
import { MetricsSection } from "@/components/metrics-section";
import { ShieldSection } from "@/components/shield-section";
import { SDKSection } from "@/components/sdk-section";
import { ArchitectureSection } from "@/components/architecture-section";
import { BenchmarksSection } from "@/components/benchmarks-section";
import { CitationsSection } from "@/components/citations-section";
import { SiteFooter } from "@/components/site-footer";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <MetricsSection />
        <ShieldSection />
        <SDKSection />
        <ArchitectureSection />
        <BenchmarksSection />
        <CitationsSection />
      </main>
      <SiteFooter />
    </div>
  );
}
