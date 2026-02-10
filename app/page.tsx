import { SiteHeader } from "@/components/site-header";
import { HeroSection } from "@/components/hero-section";
import { FeaturesSection } from "@/components/features-section";
import { MetricsSection } from "@/components/metrics-section";
import { SDKSection } from "@/components/sdk-section";
import { ArchitectureSection } from "@/components/architecture-section";
import { BenchmarksSection } from "@/components/benchmarks-section";
import { CitationsSection } from "@/components/citations-section";
import { SiteFooter } from "@/components/site-footer";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main>
        <HeroSection />
        <div id="features">
          <FeaturesSection />
        </div>
        <div id="metrics">
          <MetricsSection />
        </div>
        <div id="quickstart">
          <SDKSection />
        </div>
        <div id="architecture">
          <ArchitectureSection />
        </div>
        <div id="benchmarks">
          <BenchmarksSection />
        </div>
        <CitationsSection />
      </main>
      <SiteFooter />
    </div>
  );
}
