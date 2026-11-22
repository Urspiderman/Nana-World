
import HeroSection from "@/components/home/HeroSection";
import SectionDivider from "@/components/home/SectionDivider";
import UniverseCarousel from "@/components/home/UniverseCarousel";
import InteractiveLetter from "@/components/home/InteractiveLetter";
import FinalSurprise from "@/components/home/FinalSurprise";

export default function HomePage() {
  return (
    <main>
      <HeroSection />

      <SectionDivider variant="chapter" />

      <UniverseCarousel />

      <SectionDivider variant="letter" />

      <InteractiveLetter />

      <SectionDivider variant="finale" />

      <FinalSurprise />
    </main>
  );
}
