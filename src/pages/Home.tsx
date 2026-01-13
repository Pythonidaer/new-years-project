import { TopBanner } from "../sections/TopBanner";
import { Header } from "../sections/Header";
import { Hero } from "../sections/Hero";
import { HeroMarquee } from "../sections/HeroMarquee";
import { PlatformIntro } from "../sections/PlatformIntro";
import { AgencyLogos } from "../sections/AgencyLogos";
import { FeatureAccordion } from "../sections/FeatureAccordion";
import { CustomerSpotlight } from "../sections/CustomerSpotlight";
import { LatestBlogs } from "../sections/LatestBlogs";
import { CampaignBanner } from "../sections/CampaignBanner";
import { Footer } from "../sections/Footer";
import { MetaTags } from "../components/MetaTags";

export function Home() {
  return (
    <main>
      <MetaTags
        title="Johnny H. | Software Engineer & Developer"
        description="Portfolio of Johnny Hammond - Software Engineer specializing in React, TypeScript, and modern web development. View projects, experience, and technical blog posts."
        url="/"
        type="website"
      />
      <TopBanner />
      <Header />
      <Hero />
      <HeroMarquee />
      <PlatformIntro />
      <AgencyLogos />
      <FeatureAccordion />
      <CustomerSpotlight />
      <LatestBlogs />
      <CampaignBanner />
      <Footer />
    </main>
  );
}
