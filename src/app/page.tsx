import { Header } from "@/components/header";
import ArchitectureSection from "@/components/sections/ArchitectureSection";
import CredentialsSection from "@/components/sections/CredentialsSection";
import DecisionLedgerSection from "@/components/sections/DecisionLedgerSection";
import FindingsSection from "@/components/sections/FindingsSection";
import HeroSection from "@/components/sections/HeroSection";
import OrgThinkingSection from "@/components/sections/OrgThinkingSection";
import TheEdgeSection from "@/components/sections/TheEdgeSection";

export default function HomePage() {
  return (
    <>
      <Header />
      <main id="top" className="flex-1">
        <HeroSection />
        <OrgThinkingSection />
        <TheEdgeSection />
        <FindingsSection />
        <DecisionLedgerSection />
        <ArchitectureSection />
        <CredentialsSection />
      </main>
      <footer className="border-t border-fog-border bg-pure-surface">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-2 px-6 py-8 text-xs text-ash-medium md:flex-row md:items-center md:justify-between">
          <p>HeliQuant · The all-seeing quant · Mantle Turing Test Hackathon 2026</p>
          <p>Honesty-by-design · verifiable on-chain · we publish what doesn&apos;t work too.</p>
        </div>
      </footer>
    </>
  );
}
