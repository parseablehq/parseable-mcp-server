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
    <div className="site-shell min-h-screen">
      <Nav />
      <main className="page-content">
        <Hero />
        <QuickSetup />
        <div className="section-separator" aria-hidden="true" />
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
