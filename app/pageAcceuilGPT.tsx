"use client";

import HeroSection from "@/components/homepage/HeroSection";
import ImpactSection from "@/components/homepage/ImpactSection";
import MissionsPreview from "@/components/homepage/MissionsPreview";
import HowItWorks from "@/components/homepage/HowItWorks";
import StoriesCarousel from "@/components/homepage/StoriesCarousel";
import JoinMovement from "@/components/homepage/JoinMovement";

export default function HomePage() {
  return (
    <main className="bg-gradient-to-b from-[#271c70] via-[#3a267d] to-[#5b3098] text-white min-h-screen overflow-x-hidden">
      {/* Section 1: Primary hero with globe */}
      <HeroSection />

      {/* Section 2: Global impact */}
      <ImpactSection />

      {/* Section 3: Missions preview */}
      <MissionsPreview />

      {/* Section 4: How it works */}
      <HowItWorks />

      {/* Section 5: Testimonials / Stories */}
      <StoriesCarousel />

      {/* Section 6: Join the movement */}
      <JoinMovement />
    </main>
  );
}
