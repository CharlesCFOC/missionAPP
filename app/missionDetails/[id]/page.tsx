"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { AboutSection } from "./components/AboutSection";
import { CallToActionSection } from "./components/CallToActionSection";
import { DocumentsSection } from "./components/DocumentsSection";
import { GallerySection } from "./components/GallerySection";
import { HeaderSection } from "./components/HeaderSection";
import { LeadersSection } from "./components/LeadersSection";
import { PracticalInfoSection } from "./components/PracticalInfoSection";
import { ProgramSection } from "./components/ProgramSection";
import { TestimonialsSection } from "./components/TestimonialsSection";
import OrganisationHeader from "@/components/organisation/OrganisationHeader";
import { useMissionDetails } from "./useMissionDetails";
import { formatDateRange } from "./utils";

export default function MissionDetailsPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const missionId = params?.id;
  const isEditMode = searchParams?.get("edit") === "true";
  const isPrivateView = ["1", "true", "yes", "on"].includes(
    (searchParams?.get("private") ?? "").toLowerCase()
  );
  const [scrollProgress, setScrollProgress] = useState(0);
  const sections = [
    { id: "mission", label: "Mission" },
    { id: "about", label: "About" },
    { id: "infos", label: "Informations" },
    { id: "program", label: "Program" },
    { id: "leaders", label: "Leaders" },
    { id: "documents", label: "Documents" },
    { id: "testimonials", label: "Temoignages" },
    { id: "cta", label: "CTA" },
  ];

  const mission = useMissionDetails(missionId);
  const formattedDateRange = formatDateRange(
    mission.dateRange.startDate,
    mission.dateRange.endDate
  );

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? scrollTop / maxScroll : 0;
      setScrollProgress(Math.max(0, Math.min(1, progress)));
    };

    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        updateProgress();
        ticking = false;
      });
    };

    updateProgress();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", updateProgress);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", updateProgress);
    };
  }, []);

  const handleScrollTo = (id: string) => {
    const target = document.getElementById(id);
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#080313] via-[#260d5c] to-[#5d3ab9] text-white pb-20">
      {isPrivateView && <OrganisationHeader />}
      <div
        className="hidden lg:flex fixed left-4 top-1/2 -translate-y-1/2 z-30 items-center gap-4"
      >
        <div className="relative h-44 w-px bg-white/60 rounded-full overflow-hidden">
          <div
            className="absolute inset-x-0 top-0 h-full bg-gradient-to-b from-[#ff9c4b] to-[#ffd08b] origin-top"
            style={{ transform: `scaleY(${scrollProgress})` }}
          />
        </div>
        <div className="flex flex-col justify-between h-44 text-xs uppercase tracking-[0.22em] text-white/80 pointer-events-auto">
          {sections.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => handleScrollTo(section.id)}
              className="text-left text-white/80 hover:text-white transition"
            >
              {section.label}
            </button>
          ))}
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-6 py-16 space-y-16">
        <div id="mission" className="scroll-mt-24">
          <HeaderSection missionState={mission.missionState} isEditMode={isEditMode} dateRange={mission.dateRange}
            formattedDateRange={formattedDateRange} spotsRemaining={mission.spotsRemaining}
            progressPercentage={mission.progressPercentage} priceFormatter={mission.priceFormatter}
            onUpdateField={mission.updateField} onUpdateNumberField={mission.updateNumberField}
            onDateChange={mission.handleDateChange} onCoverFileChange={mission.handleCoverFileChange}
            coverFileInputRef={mission.coverFileInputRef}
          />
        </div>

        <div id="about" className="scroll-mt-24">
          <AboutSection missionState={mission.missionState} isEditMode={isEditMode}
            onUpdateField={mission.updateField} onAddObjective={mission.addObjective}
            onObjectiveChange={mission.handleObjectiveChange} onAddStat={mission.addStat}
            onStatChange={mission.handleStatChange}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-stretch">
          <div id="infos" className="scroll-mt-24">
            <PracticalInfoSection missionState={mission.missionState} isEditMode={isEditMode}
              onAddPractical={mission.addPractical} onPracticalChange={mission.handlePracticalChange}
            />
          </div>

          <div id="program" className="scroll-mt-24">
            <ProgramSection timeline={mission.missionState.timeline} isEditMode={isEditMode}
              onAddTimelineEntry={mission.addTimelineEntry} onTimelineChange={mission.handleTimelineChange}
            />
          </div>
        </div>

        <div id="leaders" className="scroll-mt-24">
          <LeadersSection leaders={mission.missionState.leaders} isEditMode={isEditMode}
            onAddLeader={mission.addLeader} onRemoveLeader={mission.removeLeader}
            onLeaderChange={mission.handleLeaderChange}
          />
        </div>

        <div id="documents" className="scroll-mt-24">
          <DocumentsSection documents={mission.missionState.documents} isEditMode={isEditMode}
            onAddDocument={mission.addDocument} onDocumentChange={mission.handleDocumentChange}
            onDocumentFileChange={mission.handleDocumentFileChange}
          />
        </div>

        <div id="testimonials" className="scroll-mt-24">
          <TestimonialsSection testimonials={mission.missionState.testimonials} isEditMode={isEditMode}
            onAddTestimonial={mission.addTestimonial} onTestimonialChange={mission.handleTestimonialChange}
            gallerySlot={
              <GallerySection gallery={mission.missionState.gallery} isEditMode={isEditMode}
                onAddGalleryItem={mission.addGalleryItem} onGalleryChange={mission.handleGalleryChange}
                onGalleryFileChange={mission.handleGalleryFileChange}
              />
            }
          />
        </div>

        <div id="cta" className="scroll-mt-24">
          <CallToActionSection isEditMode={isEditMode} missionName={mission.missionState.name} />
        </div>
      </div>

      {isEditMode && (
        <div className="fixed bottom-6 left-4 right-4 md:left-auto md:right-8 flex flex-col sm:flex-row items-stretch gap-3 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-3 rounded-2xl shadow-2xl">
          <button
            onClick={() => {
              mission.handleSave();
              router.push("/missionControl?tab=missions");
            }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-[#271c70] hover:bg-[#ff9c4b] hover:text-black transition font-semibold"
          >
            💾 Save changes
          </button>
          <button
            onClick={mission.handlePreview}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition font-semibold"
          >
            👁 Preview
          </button>
          <button
            onClick={mission.handleCancel}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-white/10 hover:bg-red-500/80 transition font-semibold"
          >
            ❌ Cancel
          </button>
        </div>
      )}
    </main>
  );
}
