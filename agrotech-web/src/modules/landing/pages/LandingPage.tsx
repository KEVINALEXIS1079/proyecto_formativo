import LandingHeader from "../ui/LandingHeader";
import LandingHero from "../ui/LandingHero";
import LandingFeatures from "../ui/LandingFeatures";
import LandingAbout from "../ui/LandingAbout";
import LandingCTA from "../ui/LandingCTA";
import LandingFooter from "../ui/LandingFooter";

export default function LandingPage() {
  return (
    <main className="bg-white text-foreground">
      <LandingHeader />
      <LandingHero />
      <LandingFeatures />
      <LandingAbout />
      <LandingCTA />
      <LandingFooter />
    </main>
  );
}
