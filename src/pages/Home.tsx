import { TopBanner } from "../sections/TopBanner";
import { Header } from "../sections/Header";
import { Hero } from "../sections/Hero";
import { HeroMarquee } from "../sections/HeroMarquee";
import { PlatformIntro } from "../sections/PlatformIntro";
import { AgencyLogos } from "../sections/AgencyLogos";
import { FeatureAccordion } from "../sections/FeatureAccordion";
import { CustomerSpotlight } from "../sections/CustomerSpotlight";
import { LatestNews } from "../sections/LatestNews";
import { CampaignBanner } from "../sections/CampaignBanner";
import { Footer } from "../sections/Footer";

export function Home() {
  return (
    <main>
      <TopBanner />
      <Header />
      <Hero />
      <HeroMarquee />
      <PlatformIntro />
      <AgencyLogos />
      <FeatureAccordion />
      <CustomerSpotlight />
      <LatestNews />
      <CampaignBanner />
      <Footer />
    </main>
  );
}
