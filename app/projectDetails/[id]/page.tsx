"use client";
import { ChangeEvent, CSSProperties, useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Calendar, Mail, Pencil, Upload } from "lucide-react";
import { TextInput, Textarea } from "./components/inputs";
import { ensureMissionControlFolders } from "@/components/missionControl/storage";
import OrganisationHeader from "@/components/organisation/OrganisationHeader";

type ProjectNeed = { name: string; price: number };

type ProjectUpdate = {
  date: string;
  title: string;
  description: string;
  image: string;
};

type ProjectGalleryItem = {
  src: string;
  alt: string;
};

type ProjectStat = {
  label: string;
  value: string;
};

type ProjectSolutionStep = {
  title: string;
  detail: string;
};

type ProjectMissionary = {
  name: string;
  role: string;
  image: string;
  contact: string;
};

type ProjectData = {
  id: string;
  name: string;
  country: string;
  region: string;
  summary: string;
  beneficiaries: string;
  timeline: string;
  focus: string;
  organization: string;
  missionary: ProjectMissionary;
  description: string;
  progress: number;
  goal: number;
  raised: number;
  image: string;
  problemMedia: string;
  problemSummary: string;
  problemPoints: string[];
  solutionBeforeMedia: string;
  solutionAfterMedia: string;
  solutionSteps: ProjectSolutionStep[];
  trustPoints: string[];
  impactSummary: string;
  impactStats: ProjectStat[];
  needs: ProjectNeed[];
  updates: ProjectUpdate[];
  gallery: ProjectGalleryItem[];
  quizCopy: string;
  testimonialsCopy: string;
  ctaTitle: string;
  ctaDescription: string;
  ctaPrimaryLabel: string;
  ctaSecondaryLabel: string;
};

const LOCAL_STORAGE_KEY = "cfoc-projects";

const baseTemplate: ProjectData = {
  id: "base",
  name: "Clean Water Initiative - Zambia",
  country: "Zambia 🇿🇲",
  region: "Chibombo District, Zambia",
  summary: "A community-led well bringing safe water to more than 200 families.",
  beneficiaries: "200+ families",
  timeline: "6 months",
  focus: "Clean water access",
  organization: "CFOC Mission International",
  missionary: {
    name: "John Mwansa",
    role: "Local coordinator - drilling and logistics",
    image:
      "https://images.unsplash.com/photo-1523978591478-c753949ff840?auto=format&fit=crop&w=800&q=60",
    contact: "mailto:john.mwansa@cfocmissions.org",
  },
  description:
    "This project provides lasting access to safe drinking water for more than 200 families in the rural region of Chibombo. The work includes drilling, installing the pump, and training residents to maintain the well.",
  progress: 72,
  goal: 18000,
  raised: 12960,
  image:
    "https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=1600&q=80",
  problemMedia: "/videos/problem-context.mp4",
  problemSummary:
    "In Chibombo, water access is fragile. During dry months, families rely on unsafe sources that affect health, income, and school attendance.",
  problemPoints: [
    "Families walk long distances to reach seasonal water sources.",
    "Unsafe water increases waterborne illness and missed school days.",
    "There is no local infrastructure to maintain a reliable well.",
  ],
  solutionBeforeMedia: "/images/solution-before.png",
  solutionAfterMedia: "/images/solution-after.png",
  solutionSteps: [
    {
      title: "Drill & test",
      detail: "Locate groundwater and drill a deep well with quality testing.",
    },
    {
      title: "Install & secure",
      detail: "Install the pump, casing, and safe access area for the village.",
    },
    {
      title: "Train & transfer",
      detail: "Train local caretakers and establish a long-term maintenance plan.",
    },
  ],
  trustPoints: [
    "Local coordinator on site",
    "Transparent budget with monthly updates",
    "Community training for long-term care",
  ],
  impactSummary: "",
  impactStats: [
    { label: "Families served", value: "200+ families" },
    { label: "Funding progress", value: "72%" },
    { label: "Raised to date", value: "$12,960" },
    { label: "Total goal", value: "$18,000" },
  ],
  needs: [
    { name: "Hand pump", price: 150 },
    { name: "Cement (bag)", price: 25 },
    { name: "Piping & fittings", price: 80 },
    { name: "Local training", price: 200 },
  ],
  updates: [
    {
      date: "12 Oct 2025",
      title: "Barrels shipped",
      description:
        "Material barrels have left the warehouse and are on their way to Lusaka.",
      image: "/images/updates-barrels-shipped.png",
    },
    {
      date: "25 Oct 2025",
      title: "Drilling in progress",
      description:
        "The local team has begun drilling in Chibombo under the coordinator's supervision.",
      image: "/images/updates-drilling.webp",
    },
    {
      date: "10 Nov 2025",
      title: "Pump installed",
      description:
        "The first water pump has been installed and tested, providing water to 50 families.",
      image: "/images/updates-pump-installed.png",
    },
  ],
  gallery: [
    {
      src: "https://images.unsplash.com/photo-1523978591478-c753949ff840?auto=format&fit=crop&w=600&q=60",
      alt: "Field team",
    },
    {
      src: "https://images.unsplash.com/photo-1556767576-cfba48c6e716?auto=format&fit=crop&w=600&q=60",
      alt: "Community training",
    },
    {
      src: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=600&q=60",
      alt: "Well construction",
    },
    {
      src: "https://images.unsplash.com/photo-1558981285-6f0c94958bb6?auto=format&w=600&q=60",
      alt: "Water access",
    },
    {
      src: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=60",
      alt: "Local families",
    },
  ],
  quizCopy: "Fun interactive content coming here soon...",
  testimonialsCopy: "Testimonials will be displayed here...",
  ctaTitle: "Ready to help this community?",
  ctaDescription: "Your gift builds safe water access and equips local caretakers for the future.",
  ctaPrimaryLabel: "Donate now",
  ctaSecondaryLabel: "Share project",
};

const DEFAULT_UPDATE_IMAGES = [
  "/images/updates-barrels-shipped.png",
  "/images/updates-drilling.webp",
  "/images/updates-pump-installed.png",
];

const normalizeUpdateImages = (project: ProjectData): ProjectData => {
  const baseMedia = {
    problemMedia: project.problemMedia || baseTemplate.problemMedia,
    solutionBeforeMedia: project.solutionBeforeMedia || baseTemplate.solutionBeforeMedia,
    solutionAfterMedia: project.solutionAfterMedia || baseTemplate.solutionAfterMedia,
  };
  if (!project.updates.length) {
    return { ...project, ...baseMedia };
  }
  const updates = project.updates.map((update, index) => {
    const preferred = DEFAULT_UPDATE_IMAGES[index];
    if (!preferred) return update;
    const image = update.image?.trim() ?? "";
    if (!image || image.includes("unsplash.com")) {
      return { ...update, image: preferred };
    }
    return update;
  });
  return { ...project, ...baseMedia, updates };
};

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });

const isVideoSource = (src?: string) => {
  if (!src) return false;
  if (src.startsWith("data:video")) return true;
  return /\.(mp4|webm|mov|m4v|ogg)(\?.*)?$/i.test(src);
};

const cloneProject = (project: ProjectData): ProjectData =>
  JSON.parse(JSON.stringify(project)) as ProjectData;

const buildProject = (id: string, overrides: Partial<ProjectData> = {}): ProjectData => {
  const base = cloneProject(baseTemplate);
  const project: ProjectData = { ...base, ...overrides, id };
  project.missionary = { ...base.missionary, ...(overrides.missionary ?? {}) };
  project.problemPoints = overrides.problemPoints ?? base.problemPoints;
  project.solutionSteps = overrides.solutionSteps ?? base.solutionSteps;
  project.trustPoints = overrides.trustPoints ?? base.trustPoints;
  project.impactStats = overrides.impactStats ?? base.impactStats;
  project.needs = overrides.needs ?? base.needs;
  project.updates = overrides.updates ?? base.updates;
  project.gallery = overrides.gallery ?? base.gallery;
  return project;
};

const DEFAULT_PROJECTS: Record<string, ProjectData> = {
  "1": buildProject("1"),
  "2": buildProject("2", {
    name: "School Construction - Kenya",
    country: "Kenya 🇰🇪",
    region: "Kisumu County, Kenya",
    summary: "Building safe classrooms and new learning spaces for rural students.",
    beneficiaries: "350 students",
    timeline: "9 months",
    focus: "Education access",
    description:
      "This project delivers safe classrooms, supplies, and teacher support so more children can attend school year-round.",
    progress: 60,
    goal: 24000,
    raised: 14400,
    image:
      "https://images.unsplash.com/photo-1553775927-a071d5a6a39a?auto=format&fit=crop&q=80&w=800",
    missionary: {
      name: "Grace Wanjiku",
      role: "Project lead - education",
      image:
        "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=60",
      contact: "mailto:grace.wanjiku@cfocmissions.org",
    },
    impactStats: [
      { label: "Students served", value: "350 students" },
      { label: "Funding progress", value: "60%" },
      { label: "Raised to date", value: "$14,400" },
      { label: "Total goal", value: "$24,000" },
    ],
  }),
  "3": buildProject("3", {
    name: "Community School - DRC",
    country: "DRC 🇨🇩",
    region: "Kasai Province, DRC",
    summary: "A permanent school site to keep children learning year after year.",
    beneficiaries: "120 children",
    timeline: "12 months",
    focus: "Education infrastructure",
    description:
      "We are building a permanent school site, equipping teachers, and supporting families so education becomes sustainable.",
    progress: 30,
    goal: 25000,
    raised: 7500,
    image:
      "https://images.unsplash.com/photo-1473649085228-583485e6e4d7?auto=format&fit=crop&q=80&w=2064",
    missionary: {
      name: "Samuel Kabila",
      role: "Project coordinator",
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=60",
      contact: "mailto:samuel.kabila@cfocmissions.org",
    },
    impactStats: [
      { label: "Children served", value: "120 children" },
      { label: "Funding progress", value: "30%" },
      { label: "Raised to date", value: "$7,500" },
      { label: "Total goal", value: "$25,000" },
    ],
  }),
};

const createNewProject = (id: string): ProjectData =>
  buildProject(id, {
    name: "New project",
    country: "Country",
    region: "Region",
    summary: "Add a short summary for this project.",
    beneficiaries: "0 families",
    timeline: "Timeline",
    focus: "Project focus",
    description: "Add the project story here.",
    progress: 0,
    goal: 10000,
    raised: 0,
    problemMedia: "/videos/problem-context.mp4",
    problemSummary: "Describe the local challenge the project will address.",
    problemPoints: ["Add a problem point"],
    solutionBeforeMedia: "/images/solution-before.png",
    solutionAfterMedia: "/images/solution-after.png",
    solutionSteps: [{ title: "Step 1", detail: "Describe the first step." }],
    trustPoints: ["Add a trust point"],
    impactSummary: "Describe the impact this project will create.",
    impactStats: [
      { label: "Families served", value: "0" },
      { label: "Funding progress", value: "0%" },
      { label: "Raised to date", value: "$0" },
      { label: "Total goal", value: "$10,000" },
    ],
    needs: [],
    updates: [],
    gallery: [],
  });

export default function ProjectDetailsPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const projectId = params?.id ?? "1";
  const isEditMode = searchParams?.get("edit") === "true";
  const isPrivateView = ["1", "true", "yes", "on"].includes(
    (searchParams?.get("private") ?? "").toLowerCase()
  );

  const [activeTab, setActiveTab] = useState("shop");
  const [scrollProgress, setScrollProgress] = useState(0);
  const [solutionSplit, setSolutionSplit] = useState(55);
  const [openEditors, setOpenEditors] = useState<Record<string, boolean>>({});
  const [projectState, setProjectState] = useState<ProjectData>(() => {
    const seed = DEFAULT_PROJECTS[projectId] ?? createNewProject(projectId);
    return cloneProject(normalizeUpdateImages(seed));
  });

  const toggleEditor = (sectionId: string) => {
    setOpenEditors((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const sections = [
    { id: "project", label: "Project" },
    { id: "about", label: "About" },
    { id: "problem", label: "Problem" },
    { id: "solution", label: "Solution" },
    { id: "team", label: "Team" },
    { id: "updates", label: "Updates" },
  ];
  const tabs = [
    { id: "shop", label: "Shop / Needs" },
    { id: "quiz", label: "Quiz" },
    { id: "testimonials", label: "Testimonials" },
  ];

  useEffect(() => {
    const seed = DEFAULT_PROJECTS[projectId] ?? createNewProject(projectId);
    if (typeof window === "undefined") {
      setProjectState(cloneProject(normalizeUpdateImages(seed)));
      return;
    }

    const storedRaw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!storedRaw) {
      setProjectState(cloneProject(normalizeUpdateImages(seed)));
      return;
    }

    try {
      const storedProjects = JSON.parse(storedRaw) as ProjectData[];
      const found = storedProjects.find((item) => item.id === projectId);
      setProjectState(cloneProject(normalizeUpdateImages(found ?? seed)));
    } catch (error) {
      console.error("Failed to load project from localStorage", error);
      setProjectState(cloneProject(normalizeUpdateImages(seed)));
    }
  }, [projectId]);

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

  const updateField = <K extends keyof ProjectData>(field: K, value: ProjectData[K]) => {
    setProjectState((prev) => ({ ...prev, [field]: value }));
  };

  const updateNumberField = (field: "progress" | "goal" | "raised", value: string) => {
    if (!value.trim()) {
      updateField(field, 0 as ProjectData[typeof field]);
      return;
    }
    const parsed = Number(value);
    if (Number.isNaN(parsed)) return;
    updateField(field, parsed as ProjectData[typeof field]);
  };

  const updateMissionaryField = (field: keyof ProjectMissionary, value: string) => {
    setProjectState((prev) => ({
      ...prev,
      missionary: { ...prev.missionary, [field]: value },
    }));
  };

  const updateStringListItem = (
    field: "problemPoints" | "trustPoints",
    index: number,
    value: string
  ) => {
    setProjectState((prev) => {
      const next = [...prev[field]];
      next[index] = value;
      return { ...prev, [field]: next };
    });
  };

  const addStringListItem = (field: "problemPoints" | "trustPoints") => {
    setProjectState((prev) => ({ ...prev, [field]: [...prev[field], ""] }));
  };

  const removeStringListItem = (field: "problemPoints" | "trustPoints", index: number) => {
    setProjectState((prev) => {
      const next = prev[field].filter((_, i) => i !== index);
      return { ...prev, [field]: next };
    });
  };

  const updateSolutionStep = (
    index: number,
    field: keyof ProjectSolutionStep,
    value: string
  ) => {
    setProjectState((prev) => {
      const next = [...prev.solutionSteps];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, solutionSteps: next };
    });
  };

  const addSolutionStep = () => {
    setProjectState((prev) => ({
      ...prev,
      solutionSteps: [...prev.solutionSteps, { title: "", detail: "" }],
    }));
  };

  const removeSolutionStep = (index: number) => {
    setProjectState((prev) => ({
      ...prev,
      solutionSteps: prev.solutionSteps.filter((_, i) => i !== index),
    }));
  };

  const updateImpactStat = (index: number, field: keyof ProjectStat, value: string) => {
    setProjectState((prev) => {
      const next = [...prev.impactStats];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, impactStats: next };
    });
  };

  const addImpactStat = () => {
    setProjectState((prev) => ({
      ...prev,
      impactStats: [...prev.impactStats, { label: "", value: "" }],
    }));
  };

  const removeImpactStat = (index: number) => {
    setProjectState((prev) => ({
      ...prev,
      impactStats: prev.impactStats.filter((_, i) => i !== index),
    }));
  };

  const updateNeed = (index: number, field: keyof ProjectNeed, value: string) => {
    setProjectState((prev) => {
      const next = [...prev.needs];
      if (field === "price") {
        if (!value.trim()) {
          next[index] = { ...next[index], price: 0 };
        } else {
          const parsed = Number(value);
          if (!Number.isNaN(parsed)) {
            next[index] = { ...next[index], price: parsed };
          }
        }
      } else {
        next[index] = { ...next[index], name: value };
      }
      return { ...prev, needs: next };
    });
  };

  const addNeed = () => {
    setProjectState((prev) => ({
      ...prev,
      needs: [...prev.needs, { name: "", price: 0 }],
    }));
  };

  const removeNeed = (index: number) => {
    setProjectState((prev) => ({
      ...prev,
      needs: prev.needs.filter((_, i) => i !== index),
    }));
  };

  const updateUpdate = (index: number, field: keyof ProjectUpdate, value: string) => {
    setProjectState((prev) => {
      const next = [...prev.updates];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, updates: next };
    });
  };

  const addUpdate = () => {
    setProjectState((prev) => ({
      ...prev,
      updates: [...prev.updates, { date: "", title: "", description: "", image: "" }],
    }));
  };

  const removeUpdate = (index: number) => {
    setProjectState((prev) => ({
      ...prev,
      updates: prev.updates.filter((_, i) => i !== index),
    }));
  };

  const handleSave = () => {
    if (typeof window === "undefined") return;
    const storedRaw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    let storedProjects: ProjectData[] = [];
    if (storedRaw) {
      try {
        storedProjects = JSON.parse(storedRaw) as ProjectData[];
      } catch (error) {
        console.error("Failed to read stored projects", error);
      }
    }

    const index = storedProjects.findIndex((item) => item.id === projectState.id);
    const isNewProject = index < 0;
    if (index >= 0) {
      storedProjects[index] = projectState;
    } else {
      storedProjects.push(projectState);
    }

    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(storedProjects));
    if (isNewProject) {
      ensureMissionControlFolders({
        type: "project",
        id: projectState.id,
        name: projectState.name,
        location: projectState.country,
      });
    }
  };

  const handleScrollTo = (sectionId: string) => {
    const target = document.getElementById(sectionId);
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const summaryCards = [
    { label: "Region", field: "region", value: projectState.region },
    { label: "Beneficiaries", field: "beneficiaries", value: projectState.beneficiaries },
    { label: "Timeline", field: "timeline", value: projectState.timeline },
    { label: "Focus", field: "focus", value: projectState.focus },
  ] as const;

  const progressText = `${projectState.progress}% funded — $${projectState.raised.toLocaleString(
    "en-US"
  )} of $${projectState.goal.toLocaleString("en-US")}`;
  const renderHoverTitle = (value: string) => (
    <span className="inline-block">
      {value.split("").map((char, index) => (
        <span
          key={`${char}-${index}`}
          aria-hidden="true"
          className="inline-block opacity-70 transition duration-300 ease-out hover:opacity-100 hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.6)]"
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </span>
  );

  const renderMedia = (
    src: string,
    alt: string,
    className: string,
    style?: CSSProperties
  ) => {
    if (isVideoSource(src)) {
      return (
        <video
          src={src}
          muted
          loop
          autoPlay
          playsInline
          className={className}
          style={style}
          aria-label={alt}
        />
      );
    }
    return <img src={src} alt={alt} className={className} style={style} />;
  };

  const handleMediaUpload = async (
    file: File | null,
    updater: (value: string) => void
  ) => {
    if (!file) return;
    try {
      const dataUrl = await readFileAsDataUrl(file);
      updater(dataUrl);
    } catch (error) {
      console.error("Failed to read media file", error);
    }
  };

  const handleHeroMediaUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    void handleMediaUpload(file, (value) =>
      setProjectState((prev) => ({ ...prev, image: value }))
    );
  };

  const handleProblemMediaUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    void handleMediaUpload(file, (value) =>
      setProjectState((prev) => ({ ...prev, problemMedia: value }))
    );
  };

  const handleSolutionMediaUpload = (
    field: "solutionBeforeMedia" | "solutionAfterMedia",
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0] ?? null;
    void handleMediaUpload(file, (value) =>
      setProjectState((prev) => ({ ...prev, [field]: value }))
    );
  };

  const handleMissionaryImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    void handleMediaUpload(file, (value) =>
      setProjectState((prev) => ({
        ...prev,
        missionary: { ...prev.missionary, image: value },
      }))
    );
  };

  const handleUpdateMediaUpload = (
    index: number,
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0] ?? null;
    void handleMediaUpload(file, (value) =>
      setProjectState((prev) => {
        const updates = [...prev.updates];
        updates[index] = { ...updates[index], image: value };
        return { ...prev, updates };
      })
    );
  };

  return (
    <div className="min-h-screen animate-fadeIn bg-gradient-to-br from-[#080313] via-[#260d5c] to-[#5d3ab9] text-white">
      {isPrivateView && <OrganisationHeader />}
      <div className="hidden lg:flex fixed left-4 top-1/2 -translate-y-1/2 z-30 items-center gap-4">
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

      <section
        id="project"
        className="scroll-mt-24 relative w-full h-72 md:h-80 overflow-hidden shadow-md rounded-b-3xl"
      >
        {renderMedia(
          projectState.image,
          projectState.name,
          "w-full h-full object-cover brightness-90"
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        {isEditMode && (
          <button
            type="button"
            onClick={() => toggleEditor("hero")}
            className="absolute right-5 top-5 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-black/40 text-white/80 transition hover:border-white/60 hover:text-white"
            aria-label="Edit hero"
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-5">
          <p className="text-[10px] uppercase tracking-[0.35em] text-white/70">Project</p>
          <h1
            className="text-3xl md:text-4xl font-bold mt-3"
            aria-label={projectState.name}
          >
            {renderHoverTitle(projectState.name)}
          </h1>
          <p className="text-sm text-white/80 mt-2 max-w-xl">{projectState.summary}</p>
          <div className="mt-5 w-full max-w-xs mx-auto">
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#ff9c4b] to-[#ffd08b]"
                style={{ width: `${projectState.progress}%` }}
              />
            </div>
            <p className="text-xs text-white/70 mt-2">{progressText}</p>
          </div>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <button className="px-6 py-2 rounded-lg border border-white/30 text-[#ff9c4b] text-sm font-semibold animate-pulse hover:border-[#ff9c4b] transition">
              {projectState.ctaPrimaryLabel}
            </button>
          </div>
        </div>
      </section>

      {isEditMode && openEditors.hero && (
        <div className="max-w-5xl mx-auto px-6 pb-8">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                Edit hero
              </p>
              <button
                type="button"
                onClick={() => toggleEditor("hero")}
                className="text-xs uppercase tracking-[0.2em] text-white/70 hover:text-white"
              >
                Close
              </button>
            </div>
            <div className="grid gap-3">
              <TextInput
                value={projectState.name}
                onChange={(value) => updateField("name", value)}
                placeholder="Project name"
                className="text-base"
              />
              <Textarea
                value={projectState.summary}
                onChange={(value) => updateField("summary", value)}
                placeholder="Project summary"
                className="text-sm min-h-[90px]"
              />
              <div className="grid sm:grid-cols-3 gap-2">
                <TextInput
                  value={projectState.country}
                  onChange={(value) => updateField("country", value)}
                  placeholder="Country"
                  className="text-sm"
                />
                <TextInput
                  value={projectState.beneficiaries}
                  onChange={(value) => updateField("beneficiaries", value)}
                  placeholder="Beneficiaries"
                  className="text-sm"
                />
                <TextInput
                  value={projectState.timeline}
                  onChange={(value) => updateField("timeline", value)}
                  placeholder="Timeline"
                  className="text-sm"
                />
              </div>
              <div className="grid sm:grid-cols-3 gap-2">
                <TextInput
                  value={projectState.progress.toString()}
                  onChange={(value) => updateNumberField("progress", value)}
                  placeholder="Progress"
                  className="text-sm"
                />
                <TextInput
                  value={projectState.raised.toString()}
                  onChange={(value) => updateNumberField("raised", value)}
                  placeholder="Raised"
                  className="text-sm"
                />
                <TextInput
                  value={projectState.goal.toString()}
                  onChange={(value) => updateNumberField("goal", value)}
                  placeholder="Goal"
                  className="text-sm"
                />
              </div>
              <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-center">
                <TextInput
                  value={projectState.image}
                  onChange={(value) => updateField("image", value)}
                  placeholder="Hero image or video URL"
                  className="text-sm"
                />
                <label className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-2 text-xs uppercase tracking-[0.2em] text-white/70 hover:border-white/50 hover:text-white transition cursor-pointer">
                  <Upload className="h-4 w-4" aria-hidden="true" />
                  Upload media
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleHeroMediaUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-6 py-14 space-y-16">
        <section id="about" className="scroll-mt-24 space-y-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-[#ff9c4b]">About the project</h2>
            {isEditMode && (
              <button
                type="button"
                onClick={() => toggleEditor("about")}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-white/70 hover:border-white/50 hover:text-white transition"
                aria-label="Edit about section"
              >
                <Pencil className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <div className="flex-1">
              <p className="text-sm text-white/80 leading-relaxed">{projectState.description}</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 flex-1">
              {summaryCards.map((card) => (
                <div
                  key={card.label}
                  className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 shadow-lg"
                >
                  <p className="text-xs text-white/60 uppercase tracking-wide">{card.label}</p>
                  <p className="text-base font-semibold text-white mt-2">{card.value}</p>
                </div>
              ))}
            </div>
          </div>
          {isEditMode && openEditors.about && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4">
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                Edit about
              </p>
              <Textarea
                value={projectState.description}
                onChange={(value) => updateField("description", value)}
                placeholder="Project description"
                className="text-sm min-h-[140px]"
              />
              <div className="grid sm:grid-cols-2 gap-3">
                {summaryCards.map((card) => (
                  <TextInput
                    key={card.label}
                    value={card.value}
                    onChange={(value) => updateField(card.field, value)}
                    placeholder={card.label}
                    className="text-sm"
                  />
                ))}
              </div>
            </div>
          )}
        </section>

        <section id="problem" className="scroll-mt-24 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-[#ff9c4b]">The problem</h2>
            {isEditMode && (
              <button
                type="button"
                onClick={() => toggleEditor("problem")}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-white/70 hover:border-white/50 hover:text-white transition"
                aria-label="Edit problem section"
              >
                <Pencil className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>
          <div className="grid gap-6 lg:grid-cols-[1fr_1.6fr] items-start">
            <div className="space-y-4">
              <p className="text-sm text-white/80">{projectState.problemSummary}</p>
              <ul className="grid gap-3">
                {projectState.problemPoints.map((point, index) => (
                  <li
                    key={`problem-${index}`}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80"
                  >
                    {point}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative aspect-video overflow-hidden rounded-2xl">
              {renderMedia(
                projectState.problemMedia,
                "Problem context media",
                "h-full w-full object-cover"
              )}
            </div>
          </div>
          {isEditMode && openEditors.problem && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4">
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                Edit problem
              </p>
              <Textarea
                value={projectState.problemSummary}
                onChange={(value) => updateField("problemSummary", value)}
                placeholder="Problem summary"
                className="text-sm min-h-[120px]"
              />
              <div className="grid gap-2">
                {projectState.problemPoints.map((point, index) => (
                  <div key={`problem-edit-${index}`} className="flex items-center gap-2">
                    <TextInput
                      value={point}
                      onChange={(value) => updateStringListItem("problemPoints", index, value)}
                      placeholder="Problem point"
                      className="text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => removeStringListItem("problemPoints", index)}
                      className="text-xs text-white/60 hover:text-white"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addStringListItem("problemPoints")}
                  className="text-xs uppercase tracking-[0.2em] text-white/70 hover:text-white"
                >
                  Add point
                </button>
              </div>
              <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-center">
                <TextInput
                  value={projectState.problemMedia}
                  onChange={(value) => updateField("problemMedia", value)}
                  placeholder="Problem media URL"
                  className="text-sm"
                />
                <label className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-2 text-xs uppercase tracking-[0.2em] text-white/70 hover:border-white/50 hover:text-white transition cursor-pointer">
                  <Upload className="h-4 w-4" aria-hidden="true" />
                  Upload media
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleProblemMediaUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}
        </section>

        <section id="solution" className="scroll-mt-24 space-y-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-[#ff9c4b]">The solution</h2>
            {isEditMode && (
              <button
                type="button"
                onClick={() => toggleEditor("solution")}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-white/70 hover:border-white/50 hover:text-white transition"
                aria-label="Edit solution section"
              >
                <Pencil className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>
          <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] items-start">
            <div className="space-y-3">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl">
                {renderMedia(
                  projectState.solutionAfterMedia,
                  "Solution visualization",
                  "absolute inset-0 h-full w-full object-cover"
                )}
                <div className="absolute inset-0">
                  {renderMedia(
                    projectState.solutionBeforeMedia,
                    "Problem visualization",
                    "h-full w-full object-cover",
                    {
                      clipPath: `inset(0 ${100 - solutionSplit}% 0 0)`,
                      WebkitClipPath: `inset(0 ${100 - solutionSplit}% 0 0)`,
                    }
                  )}
                </div>
                <div
                  className="pointer-events-none absolute inset-y-0"
                  style={{ left: `calc(${solutionSplit}% - 1px)` }}
                >
                  <div className="h-full w-[2px] bg-white" />
                  <div className="absolute top-1/2 -translate-y-1/2 -left-3 h-6 w-6 rounded-full border border-white bg-white" />
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={solutionSplit}
                  onChange={(event) => setSolutionSplit(Number(event.target.value))}
                  aria-label="Reveal solution image"
                  className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
                />
              </div>
              <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-white/50">
                <span>Before</span>
                <span>After</span>
              </div>
            </div>
            <div className="space-y-5">
              {projectState.solutionSteps.map((step, index) => (
                <div key={`solution-${index}`} className="space-y-2">
                  <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-white/50">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/20 text-[10px] text-white/70">
                      {index + 1}
                    </span>
                    <span>Step</span>
                  </div>
                  <>
                    <h3 className="text-base font-semibold text-white">{step.title}</h3>
                    <p className="text-sm text-white/70">{step.detail}</p>
                  </>
                </div>
              ))}
            </div>
          </div>
          {isEditMode && openEditors.solution && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4">
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                Edit solution
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <TextInput
                    value={projectState.solutionBeforeMedia}
                    onChange={(value) => updateField("solutionBeforeMedia", value)}
                    placeholder="Before media URL"
                    className="text-sm"
                  />
                  <label className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-2 text-xs uppercase tracking-[0.2em] text-white/70 hover:border-white/50 hover:text-white transition cursor-pointer">
                    <Upload className="h-4 w-4" aria-hidden="true" />
                    Upload before
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={(event) => handleSolutionMediaUpload("solutionBeforeMedia", event)}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="space-y-2">
                  <TextInput
                    value={projectState.solutionAfterMedia}
                    onChange={(value) => updateField("solutionAfterMedia", value)}
                    placeholder="After media URL"
                    className="text-sm"
                  />
                  <label className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-2 text-xs uppercase tracking-[0.2em] text-white/70 hover:border-white/50 hover:text-white transition cursor-pointer">
                    <Upload className="h-4 w-4" aria-hidden="true" />
                    Upload after
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={(event) => handleSolutionMediaUpload("solutionAfterMedia", event)}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
              <div className="space-y-3">
                {projectState.solutionSteps.map((step, index) => (
                  <div key={`solution-edit-${index}`} className="space-y-2">
                    <TextInput
                      value={step.title}
                      onChange={(value) => updateSolutionStep(index, "title", value)}
                      placeholder="Step title"
                      className="text-sm"
                    />
                    <Textarea
                      value={step.detail}
                      onChange={(value) => updateSolutionStep(index, "detail", value)}
                      placeholder="Step detail"
                      className="text-sm min-h-[90px]"
                    />
                    <button
                      type="button"
                      onClick={() => removeSolutionStep(index)}
                      className="text-xs text-white/60 hover:text-white"
                    >
                      Remove step
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addSolutionStep}
                  className="text-xs uppercase tracking-[0.2em] text-white/70 hover:text-white"
                >
                  Add step
                </button>
              </div>
            </div>
          )}
        </section>

        <section id="team" className="scroll-mt-24 space-y-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-[#ff9c4b]">Team & trust</h2>
            {isEditMode && (
              <button
                type="button"
                onClick={() => toggleEditor("team")}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-white/70 hover:border-white/50 hover:text-white transition"
                aria-label="Edit team section"
              >
                <Pencil className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>
          <div className="grid lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3">
              <div className="flex flex-col sm:flex-row items-start gap-4">
                {renderMedia(
                  projectState.missionary.image,
                  projectState.missionary.name,
                  "w-[7.5rem] shrink-0 aspect-[2/3] rounded-xl object-cover"
                )}
                <div className="flex min-h-[11.25rem] flex-col text-center sm:text-left">
                  <>
                    <h3 className="text-lg font-semibold text-white">{projectState.missionary.name}</h3>
                    <p className="text-sm text-white/70">{projectState.missionary.role}</p>
                    <p className="text-xs text-white/70 mt-1">
                      Organization: <span className="font-semibold text-white">{projectState.organization}</span>
                    </p>
                  </>
                  <div className="mt-auto flex items-center gap-3 justify-center sm:justify-start pt-4">
                    <a
                      href={projectState.missionary.contact}
                      aria-label="Contact"
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white transition hover:border-white/60 hover:bg-white/10"
                    >
                      <Mail className="h-5 w-5" aria-hidden="true" />
                    </a>
                    <button
                      type="button"
                      aria-label="Schedule a call"
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white transition hover:border-white/60 hover:bg-white/10"
                    >
                      <Calendar className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-2">
              <h3 className="text-lg font-semibold text-white">Why trust this project</h3>
              <ul className="mt-4 space-y-2 text-sm text-white/70 list-disc list-inside">
                {projectState.trustPoints.map((point, index) => (
                  <li key={`trust-${index}`}>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {isEditMode && openEditors.team && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4">
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                Edit team & trust
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                <TextInput
                  value={projectState.missionary.name}
                  onChange={(value) => updateMissionaryField("name", value)}
                  placeholder="Leader name"
                  className="text-sm"
                />
                <TextInput
                  value={projectState.missionary.role}
                  onChange={(value) => updateMissionaryField("role", value)}
                  placeholder="Role"
                  className="text-sm"
                />
                <TextInput
                  value={projectState.organization}
                  onChange={(value) => updateField("organization", value)}
                  placeholder="Organization"
                  className="text-sm sm:col-span-2"
                />
                <TextInput
                  value={projectState.missionary.contact}
                  onChange={(value) => updateMissionaryField("contact", value)}
                  placeholder="Contact email"
                  className="text-sm sm:col-span-2"
                />
                <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-center sm:col-span-2">
                  <TextInput
                    value={projectState.missionary.image}
                    onChange={(value) => updateMissionaryField("image", value)}
                    placeholder="Leader media URL"
                    className="text-sm"
                  />
                  <label className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-2 text-xs uppercase tracking-[0.2em] text-white/70 hover:border-white/50 hover:text-white transition cursor-pointer">
                    <Upload className="h-4 w-4" aria-hidden="true" />
                    Upload media
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleMissionaryImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
              <div className="space-y-2">
                {projectState.trustPoints.map((point, index) => (
                  <div key={`trust-edit-${index}`} className="flex items-center gap-2">
                    <TextInput
                      value={point}
                      onChange={(value) => updateStringListItem("trustPoints", index, value)}
                      placeholder="Trust point"
                      className="text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => removeStringListItem("trustPoints", index)}
                      className="text-xs text-white/60 hover:text-white"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addStringListItem("trustPoints")}
                  className="text-xs uppercase tracking-[0.2em] text-white/70 hover:text-white"
                >
                  Add trust point
                </button>
              </div>
            </div>
          )}
        </section>


        <section id="updates" className="scroll-mt-24 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
            <h2 className="text-2xl font-bold text-[#ff9c4b]">Updates</h2>
            <p className="text-sm text-white/70 max-w-xl">
              Follow the latest field news and project progress from the team.
            </p>
            {isEditMode && (
              <button
                type="button"
                onClick={() => toggleEditor("updates")}
                className="ml-auto flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-white/70 hover:border-white/50 hover:text-white transition"
                aria-label="Edit updates section"
              >
                <Pencil className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>
          {projectState.updates.length === 0 && !isEditMode && (
            <p className="text-sm text-white/60">No updates yet.</p>
          )}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projectState.updates.map((update, index) => (
              <div
                key={`update-${index}`}
                className="flex flex-col gap-3"
              >
                {renderMedia(
                  update.image || projectState.image,
                  update.title,
                  "w-full aspect-[3/2] object-cover rounded-xl"
                )}
                <>
                  <div className="text-xs text-[#ffb86b] mb-1">{update.date}</div>
                  <h3 className="text-base font-semibold text-white mb-2">{update.title}</h3>
                  <p className="text-sm text-white/70 leading-relaxed">{update.description}</p>
                </>
              </div>
            ))}
          </div>
          {isEditMode && openEditors.updates && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4">
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                Edit updates
              </p>
              <div className="space-y-4">
                {projectState.updates.map((update, index) => (
                  <div key={`update-edit-${index}`} className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
                    <div className="grid sm:grid-cols-2 gap-2">
                      <TextInput
                        value={update.date}
                        onChange={(value) => updateUpdate(index, "date", value)}
                        placeholder="Date"
                        className="text-sm"
                      />
                      <TextInput
                        value={update.title}
                        onChange={(value) => updateUpdate(index, "title", value)}
                        placeholder="Title"
                        className="text-sm"
                      />
                    </div>
                    <Textarea
                      value={update.description}
                      onChange={(value) => updateUpdate(index, "description", value)}
                      placeholder="Update description"
                      className="text-sm min-h-[100px]"
                    />
                    <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-center">
                      <TextInput
                        value={update.image}
                        onChange={(value) => updateUpdate(index, "image", value)}
                        placeholder="Image or video URL"
                        className="text-sm"
                      />
                      <label className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-2 text-xs uppercase tracking-[0.2em] text-white/70 hover:border-white/50 hover:text-white transition cursor-pointer">
                        <Upload className="h-4 w-4" aria-hidden="true" />
                        Upload media
                        <input
                          type="file"
                          accept="image/*,video/*"
                          onChange={(event) => handleUpdateMediaUpload(index, event)}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeUpdate(index)}
                      className="text-xs text-white/60 hover:text-white"
                    >
                      Remove update
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addUpdate}
                  className="text-xs uppercase tracking-[0.2em] text-white/70 hover:text-white"
                >
                  Add update
                </button>
              </div>
            </div>
          )}
        </section>

        <section id="cta" className="scroll-mt-24">
          <div className="relative mt-10 bg-gradient-to-br from-white/10 via-white/5 to-transparent border border-white/20 rounded-2xl p-6 shadow-lg">
            {isEditMode && (
              <button
                type="button"
                onClick={() => toggleEditor("cta")}
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-white/70 hover:border-white/50 hover:text-white transition"
                aria-label="Edit call to action"
              >
                <Pencil className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white">{projectState.ctaTitle}</h3>
                <p className="text-sm text-white/70 mt-2">{projectState.ctaDescription}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button className="bg-gradient-to-r from-[#ff9c4b] via-[#ffb86b] to-[#ff9c4b] text-white px-6 py-2 rounded-lg font-semibold text-sm transition hover:from-[#ffb86b] hover:to-[#ff9c4b]">
                  {projectState.ctaPrimaryLabel}
                </button>
                <button className="px-6 py-2 rounded-lg border border-white/30 text-white/90 text-sm hover:border-[#ff9c4b] transition">
                  {projectState.ctaSecondaryLabel}
                </button>
              </div>
            </div>
          </div>
          {isEditMode && openEditors.cta && (
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4">
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                Edit call to action
              </p>
              <TextInput
                value={projectState.ctaTitle}
                onChange={(value) => updateField("ctaTitle", value)}
                placeholder="CTA title"
                className="text-sm"
              />
              <Textarea
                value={projectState.ctaDescription}
                onChange={(value) => updateField("ctaDescription", value)}
                placeholder="CTA description"
                className="text-sm min-h-[90px]"
              />
              <div className="grid sm:grid-cols-2 gap-2">
                <TextInput
                  value={projectState.ctaPrimaryLabel}
                  onChange={(value) => updateField("ctaPrimaryLabel", value)}
                  placeholder="Primary button"
                  className="text-sm"
                />
                <TextInput
                  value={projectState.ctaSecondaryLabel}
                  onChange={(value) => updateField("ctaSecondaryLabel", value)}
                  placeholder="Secondary button"
                  className="text-sm"
                />
              </div>
            </div>
          )}
        </section>

      </div>

      {isEditMode && (
        <div className="fixed bottom-6 left-4 right-4 md:left-auto md:right-8 flex flex-col sm:flex-row items-stretch gap-3 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-3 rounded-2xl shadow-2xl">
          <button
            type="button"
            onClick={() => {
              handleSave();
              router.push("/missionControl?tab=projects");
            }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-[#271c70] hover:bg-[#ff9c4b] hover:text-black transition font-semibold"
          >
            Save changes
          </button>
          <button
            type="button"
            onClick={() => router.push(`/projectDetails/${projectState.id}`)}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition font-semibold"
          >
            Preview
          </button>
          <button
            type="button"
            onClick={() => router.replace(`/projectDetails/${projectState.id}`)}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition font-semibold"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
