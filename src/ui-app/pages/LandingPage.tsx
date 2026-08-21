import { CTABanner } from "../components/landing/CTABanner";
import { FeatureGrid } from "../components/landing/FeatureGrid";
import { Footer } from "../components/landing/Footer";
import { Hero } from "../components/landing/Hero";
import { Nav } from "../components/landing/Nav";
import { Prompts } from "../components/landing/Prompts";
import { QuickSetup } from "../components/landing/QuickSetup";
import { SlackBot } from "../components/landing/SlackBot";
import { Tools } from "../components/landing/Tools";
import { TwoWays } from "../components/landing/TwoWays";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Nav />
      <main>
        <div style={{ background: "linear-gradient(180deg, rgba(241, 231, 255, 0.8) 0%, #FFFFFF 100%)" }}>
          <Hero />
          <QuickSetup />
        </div>
        <SlackBot />
        <TwoWays />
        <Prompts />
        <Tools />
        <FeatureGrid />
        <CTABanner />
      </main>
      <Footer />
    </div>
  );
}
