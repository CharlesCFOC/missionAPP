"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import {
  Briefcase,
  Calendar,
  Check,
  ImagePlus,
  Loader2,
  Mail,
  Pencil,
  Phone,
  Trash2,
  UserCircle,
  X,
} from "lucide-react";
import VolunteerDocumentsSection from "@/components/volunteerDocuments/VolunteerDocumentsSection";
import VolunteerReferencesSection from "@/components/volunteerReferences/VolunteerReferencesSection";

type ProfileSection = "personal" | "availability" | "skills" | "contact";

type AvailabilityDayId = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
type AvailabilitySlotId = "anytime" | "morning" | "afternoon" | "evening" | "night";
type AvailabilityModeId = "in-person" | "remote";

type AvailabilitySelection = Record<
  AvailabilityDayId,
  { enabled: boolean; slot: AvailabilitySlotId; mode: AvailabilityModeId }
>;

type VolunteerProfile = {
  full_name: string;
  avatar_url: string;
  role: string;
  volunteer_location: string;
  birth_date: string;
  volunteer_status: "Active" | "Inactive";
  volunteer_has_car: boolean;
  bio: string;
  email: string;
  phone: string;
  volunteer_languages: string[];
  volunteer_skills: string[];
  volunteer_availability: string[];
};

type VolunteerProfilePanelProps = {
  onProfileNameChange?: (fullName: string) => void;
};

type CountryDialCodeOption = {
  value: string;
  label: string;
};

const DEMO_PROFILE_KEY = "cfoc-demo-profile";
const DEMO_VOLUNTEER_DIRECTORY_KEY = "cfoc-demo-volunteer-directory";

type DemoVolunteerDirectoryEntry = {
  email: string;
  full_name?: string;
  birth_date?: string;
  updated_at?: string;
};

const normalizeEmailKey = (email: string) => email.trim().toLowerCase();

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

const readLocalVolunteerDirectory = (): Record<string, DemoVolunteerDirectoryEntry> => {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(DEMO_VOLUNTEER_DIRECTORY_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};

    const record = parsed as Record<string, unknown>;
    const directory: Record<string, DemoVolunteerDirectoryEntry> = {};

    Object.entries(record).forEach(([key, value]) => {
      if (!value || typeof value !== "object" || Array.isArray(value)) return;
      const normalizedKey = normalizeEmailKey(key);
      const row = value as Record<string, unknown>;
      directory[normalizedKey] = {
        email:
          typeof row.email === "string"
            ? normalizeEmailKey(row.email)
            : normalizedKey,
        full_name: typeof row.full_name === "string" ? row.full_name : undefined,
        birth_date: typeof row.birth_date === "string" ? row.birth_date : undefined,
        updated_at: typeof row.updated_at === "string" ? row.updated_at : undefined,
      };
    });

    return directory;
  } catch {
    return {};
  }
};

const writeLocalVolunteerDirectoryEntry = (
  profile: VolunteerProfile,
  previousEmail?: string
) => {
  if (typeof window === "undefined") return;
  const emailKey = normalizeEmailKey(profile.email);
  if (!emailKey) return;

  try {
    const directory = readLocalVolunteerDirectory();
    const previousKey = previousEmail ? normalizeEmailKey(previousEmail) : "";

    if (previousKey && previousKey !== emailKey) {
      delete directory[previousKey];
    }

    directory[emailKey] = {
      email: emailKey,
      full_name: profile.full_name,
      birth_date: profile.birth_date,
      updated_at: new Date().toISOString(),
    };

    window.localStorage.setItem(
      DEMO_VOLUNTEER_DIRECTORY_KEY,
      JSON.stringify(directory)
    );
  } catch {
    // ignore storage failures
  }
};

const readLocalProfile = (): VolunteerProfile => {
  if (typeof window === "undefined") return DEFAULT_PROFILE;
  try {
    const raw = window.localStorage.getItem(DEMO_PROFILE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return DEFAULT_PROFILE;
    const row = parsed as Record<string, unknown>;
    return {
      ...DEFAULT_PROFILE,
      full_name: typeof row.full_name === "string" ? row.full_name : "",
      avatar_url: typeof row.avatar_url === "string" ? row.avatar_url : "",
      role: typeof row.role === "string" ? row.role : DEFAULT_PROFILE.role,
      volunteer_location:
        typeof row.volunteer_location === "string" ? row.volunteer_location : "",
      birth_date: typeof row.birth_date === "string" ? row.birth_date : "",
      volunteer_status:
        row.volunteer_status === "Inactive" ? "Inactive" : "Active",
      volunteer_has_car:
        typeof row.volunteer_has_car === "boolean" ? row.volunteer_has_car : false,
      bio: typeof row.bio === "string" ? row.bio : "",
      email: typeof row.email === "string" ? row.email : "",
      phone: typeof row.phone === "string" ? row.phone : "",
      volunteer_languages: isStringArray(row.volunteer_languages)
        ? row.volunteer_languages
        : [],
      volunteer_skills: isStringArray(row.volunteer_skills) ? row.volunteer_skills : [],
      volunteer_availability: isStringArray(row.volunteer_availability)
        ? row.volunteer_availability
        : [],
    };
  } catch {
    return DEFAULT_PROFILE;
  }
};

const writeLocalProfile = (profile: VolunteerProfile) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DEMO_PROFILE_KEY, JSON.stringify(profile));
  } catch {
    // ignore storage failures
  }
};

const DEFAULT_PROFILE: VolunteerProfile = {
  full_name: "",
  avatar_url: "",
  role: "Volunteer",
  volunteer_location: "",
  birth_date: "",
  volunteer_status: "Active",
  volunteer_has_car: false,
  bio: "",
  email: "",
  phone: "",
  volunteer_languages: [],
  volunteer_skills: [],
  volunteer_availability: [],
};

const availabilityDays: { id: AvailabilityDayId; label: string }[] = [
  { id: "mon", label: "Mon" },
  { id: "tue", label: "Tue" },
  { id: "wed", label: "Wed" },
  { id: "thu", label: "Thu" },
  { id: "fri", label: "Fri" },
  { id: "sat", label: "Sat" },
  { id: "sun", label: "Sun" },
];

const availabilitySlots: { id: AvailabilitySlotId; label: string }[] = [
  { id: "anytime", label: "Anytime" },
  { id: "morning", label: "Morning" },
  { id: "afternoon", label: "Afternoon" },
  { id: "evening", label: "Evening" },
  { id: "night", label: "Night" },
];

const availabilityModes: { id: AvailabilityModeId; label: string }[] = [
  { id: "in-person", label: "In person" },
  { id: "remote", label: "Remote" },
];

const availabilityModeTone: Record<AvailabilityModeId, string> = {
  "in-person": "border border-[#ff9c4b]/40 bg-[#ff9c4b]/20 text-[#ffcfaa]",
  remote: "border border-[#4fa5ff]/40 bg-[#4fa5ff]/20 text-[#c7e5ff]",
};

const createEmptyAvailabilitySelection = (): AvailabilitySelection =>
  availabilityDays.reduce((acc, day) => {
    acc[day.id] = { enabled: false, slot: "anytime", mode: "in-person" };
    return acc;
  }, {} as AvailabilitySelection);

const availabilitySelectionFromList = (list: string[]): AvailabilitySelection => {
  const selection = createEmptyAvailabilitySelection();

  list.forEach((entry) => {
    const normalized = entry.trim();
    if (!normalized) return;
    const [dayLabel] = normalized.split(" ");
    const dayMatch = availabilityDays.find((day) => day.label === dayLabel);
    if (!dayMatch) return;

    const lower = normalized.toLowerCase();
    const slot: AvailabilitySlotId =
      lower.includes("morning") ? "morning" :
      lower.includes("afternoon") ? "afternoon" :
      lower.includes("evening") ? "evening" :
      lower.includes("night") ? "night" :
      "anytime";
    const mode: AvailabilityModeId = lower.includes("remote") ? "remote" : "in-person";

    selection[dayMatch.id] = { enabled: true, slot, mode };
  });

  return selection;
};

const slotLabel = (slotId: AvailabilitySlotId) =>
  availabilitySlots.find((slot) => slot.id === slotId)?.label ?? "Anytime";

const modeLabel = (modeId: AvailabilityModeId) =>
  availabilityModes.find((mode) => mode.id === modeId)?.label ?? "In person";

const buildAvailabilityList = (availabilitySelection: AvailabilitySelection) => {
  return availabilityDays
    .filter((day) => availabilitySelection[day.id]?.enabled)
    .map((day) => {
      const entry = availabilitySelection[day.id];
      const modeSuffix = entry.mode === "remote" ? "Remote" : "In person";
      return `${day.label} ${slotLabel(entry.slot)} (${modeSuffix})`;
    });
};

const normalizeCommaSeparated = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

const PHONE_COUNTRY_CODES: CountryDialCodeOption[] = [
  { value: "+1", label: "Canada / US (+1)" },
  { value: "+33", label: "France (+33)" },
  { value: "+44", label: "UK (+44)" },
  { value: "+509", label: "Haiti (+509)" },
  { value: "+260", label: "Zambia (+260)" },
  { value: "+254", label: "Kenya (+254)" },
  { value: "+234", label: "Nigeria (+234)" },
  { value: "+237", label: "Cameroon (+237)" },
  { value: "+243", label: "DR Congo (+243)" },
];

const DEFAULT_PHONE_COUNTRY_CODE = "+1";

const parsePhoneWithCountryCode = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return { countryCode: DEFAULT_PHONE_COUNTRY_CODE, localNumber: "" };
  }

  const match = trimmed.match(/^(\+\d{1,4})[\s-]*(.*)$/);
  if (!match) {
    return { countryCode: DEFAULT_PHONE_COUNTRY_CODE, localNumber: trimmed };
  }

  const [, rawCode, rest = ""] = match;
  const countryCode = PHONE_COUNTRY_CODES.some((option) => option.value === rawCode)
    ? rawCode
    : DEFAULT_PHONE_COUNTRY_CODE;
  const localNumber =
    countryCode === rawCode ? rest.trim() : trimmed.replace(rawCode, "").trim();

  return { countryCode, localNumber };
};

const buildPhoneWithCountryCode = (countryCode: string, localNumber: string) => {
  const normalizedNumber = localNumber.trim();
  if (!normalizedNumber) return "";
  const normalizedCode =
    PHONE_COUNTRY_CODES.some((option) => option.value === countryCode)
      ? countryCode
      : DEFAULT_PHONE_COUNTRY_CODE;
  return `${normalizedCode} ${normalizedNumber}`;
};

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

export default function VolunteerProfilePanel({
  onProfileNameChange,
}: VolunteerProfilePanelProps) {
  const supabase = useSupabaseClient();
  const session = useSession();
  const userId = session?.user?.id ?? null;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [profile, setProfile] = useState<VolunteerProfile>(DEFAULT_PROFILE);
  const [draft, setDraft] = useState<VolunteerProfile>(DEFAULT_PROFILE);
  const [editingSection, setEditingSection] = useState<ProfileSection | null>(
    null
  );

  const [availabilitySelection, setAvailabilitySelection] =
    useState<AvailabilitySelection>(() =>
      availabilitySelectionFromList(DEFAULT_PROFILE.volunteer_availability)
    );
  const [skillsText, setSkillsText] = useState("");
  const [languagesText, setLanguagesText] = useState("");
  const [phoneCountryCode, setPhoneCountryCode] = useState(DEFAULT_PHONE_COUNTRY_CODE);
  const [phoneLocalNumber, setPhoneLocalNumber] = useState("");
  const avatarFileInputRef = useRef<HTMLInputElement | null>(null);

  const isEditingPersonal = editingSection === "personal";
  const isEditingAvailability = editingSection === "availability";
  const isEditingSkills = editingSection === "skills";
  const isEditingContact = editingSection === "contact";

  useEffect(() => {
    let cancelled = false;

    const fetchProfile = async () => {
      setLoading(true);
      setError(null);

      if (!userId) {
        const local = readLocalProfile();
        if (cancelled) return;
        setProfile(local);
        setDraft(local);
        setAvailabilitySelection(
          availabilitySelectionFromList(local.volunteer_availability)
        );
        setSkillsText(local.volunteer_skills.join(", "));
        setLanguagesText(local.volunteer_languages.join(", "));
        const parsedPhone = parsePhoneWithCountryCode(local.phone);
        setPhoneCountryCode(parsedPhone.countryCode);
        setPhoneLocalNumber(parsedPhone.localNumber);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        setError(error.message);
        setProfile(DEFAULT_PROFILE);
        setDraft(DEFAULT_PROFILE);
        setLoading(false);
        return;
      }

      const row = (data ?? {}) as Record<string, unknown>;
      const normalized: VolunteerProfile = {
        ...DEFAULT_PROFILE,
        full_name: (row.full_name as string) ?? "",
        avatar_url: (row.avatar_url as string) ?? "",
        role: (row.role as string) ?? DEFAULT_PROFILE.role,
        volunteer_location:
          (row.volunteer_location as string) ??
          [row.city, row.country].filter(Boolean).join(", "),
        birth_date: (row.birth_date as string) ?? "",
        volunteer_status:
          (row.volunteer_status as VolunteerProfile["volunteer_status"]) ??
          DEFAULT_PROFILE.volunteer_status,
        volunteer_has_car:
          typeof row.volunteer_has_car === "boolean"
            ? (row.volunteer_has_car as boolean)
            : DEFAULT_PROFILE.volunteer_has_car,
        bio: (row.bio as string) ?? "",
        email:
          (row.email as string) ??
          session?.user?.email ??
          DEFAULT_PROFILE.email,
        phone: (row.phone as string) ?? "",
        volunteer_languages: Array.isArray(row.volunteer_languages)
          ? (row.volunteer_languages as string[])
          : [],
        volunteer_skills: Array.isArray(row.volunteer_skills)
          ? (row.volunteer_skills as string[])
          : [],
        volunteer_availability: Array.isArray(row.volunteer_availability)
          ? (row.volunteer_availability as string[])
          : [],
      };

      setProfile(normalized);
      setDraft(normalized);
      onProfileNameChange?.(normalized.full_name.trim());
      setAvailabilitySelection(
        availabilitySelectionFromList(normalized.volunteer_availability)
      );
      setSkillsText(normalized.volunteer_skills.join(", "));
      setLanguagesText(normalized.volunteer_languages.join(", "));
      const parsedPhone = parsePhoneWithCountryCode(normalized.phone);
      setPhoneCountryCode(parsedPhone.countryCode);
      setPhoneLocalNumber(parsedPhone.localNumber);
      setLoading(false);
    };

    fetchProfile();

    return () => {
      cancelled = true;
    };
  }, [onProfileNameChange, session?.user?.email, supabase, userId]);

  const startEditSection = (section: ProfileSection) => {
    setFeedback(null);
    setError(null);
    setDraft(profile);
    setAvailabilitySelection(
      availabilitySelectionFromList(profile.volunteer_availability)
    );
    setSkillsText(profile.volunteer_skills.join(", "));
    setLanguagesText(profile.volunteer_languages.join(", "));
    const parsedPhone = parsePhoneWithCountryCode(profile.phone);
    setPhoneCountryCode(parsedPhone.countryCode);
    setPhoneLocalNumber(parsedPhone.localNumber);
    setEditingSection(section);
  };

  const cancelEditSection = () => {
    setDraft(profile);
    setAvailabilitySelection(
      availabilitySelectionFromList(profile.volunteer_availability)
    );
    setSkillsText(profile.volunteer_skills.join(", "));
    setLanguagesText(profile.volunteer_languages.join(", "));
    const parsedPhone = parsePhoneWithCountryCode(profile.phone);
    setPhoneCountryCode(parsedPhone.countryCode);
    setPhoneLocalNumber(parsedPhone.localNumber);
    setEditingSection(null);
    setFeedback(null);
    setError(null);
  };

  const savePatch = async (patch: Partial<VolunteerProfile>) => {
    setSaving(true);
    setFeedback(null);
    setError(null);

    if (!userId) {
      const nextProfile = { ...profile, ...patch };
      writeLocalProfile(nextProfile);
      writeLocalVolunteerDirectoryEntry(nextProfile, profile.email);
      setProfile(nextProfile);
      setDraft(nextProfile);
      onProfileNameChange?.(nextProfile.full_name.trim());
      setFeedback("Saved.");
      setEditingSection(null);
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .upsert(
        { id: userId, ...patch, updated_at: new Date().toISOString() },
        { onConflict: "id" }
      );

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }

    const nextProfile = { ...profile, ...patch };
    setProfile(nextProfile);
    setDraft(nextProfile);
    onProfileNameChange?.(nextProfile.full_name.trim());
    writeLocalVolunteerDirectoryEntry(nextProfile, profile.email);
    setFeedback("Saved.");
    setEditingSection(null);
    setSaving(false);
  };

  const savePersonal = async () => {
    await savePatch({
      full_name: draft.full_name,
      avatar_url: draft.avatar_url,
      role: draft.role,
      volunteer_location: draft.volunteer_location,
      birth_date: draft.birth_date,
      volunteer_has_car: draft.volunteer_has_car,
      volunteer_status: draft.volunteer_status,
      bio: draft.bio,
    });
  };

  const saveAvailability = async () => {
    await savePatch({
      volunteer_availability: buildAvailabilityList(availabilitySelection),
    });
  };

  const saveSkills = async () => {
    await savePatch({
      volunteer_skills: normalizeCommaSeparated(skillsText),
      volunteer_languages: normalizeCommaSeparated(languagesText),
    });
  };

  const saveContact = async () => {
    await savePatch({
      email: draft.email,
      phone: buildPhoneWithCountryCode(phoneCountryCode, phoneLocalNumber),
    });
  };

  const handleAvatarFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setDraft((prev) => ({ ...prev, avatar_url: dataUrl }));
    } catch {
      setError("Unable to read selected image.");
    } finally {
      event.target.value = "";
    }
  };

  const availabilityRows = useMemo(() => {
    return (profile.volunteer_availability ?? []).map((item, index) => {
      const normalized = item.trim();
      const [day = "", slot = "Anytime"] = normalized.split(" ");
      const lower = normalized.toLowerCase();
      const modeId: AvailabilityModeId = lower.includes("remote")
        ? "remote"
        : "in-person";
      return {
        id: `${day}-${index}`,
        day,
        slot,
        mode: modeLabel(modeId),
        modeId,
      };
    });
  }, [profile.volunteer_availability]);

  const inputBase =
    "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-[#ff9c4b] focus:outline-none";

  if (loading) {
    return (
      <motion.div
        key="settings-profile-loading"
        id="settings-panel-profile"
        role="tabpanel"
        aria-labelledby="settings-tab-profile"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center rounded-3xl bg-white/10 p-12 backdrop-blur-xl shadow-2xl"
      >
        <div className="inline-flex items-center gap-2 text-sm text-white/70">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Loading profile…
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      key="settings-profile"
      id="settings-panel-profile"
      role="tabpanel"
      aria-labelledby="settings-tab-profile"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {(error || feedback) && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            error
              ? "border-rose-400/40 bg-rose-500/10 text-rose-100"
              : "border-emerald-300/30 bg-emerald-500/10 text-emerald-100"
          }`}
        >
          {error ?? feedback}
        </div>
      )}

      <div className="space-y-6">
        <section
          className="rounded-3xl border border-white/10 bg-white/5 p-5 md:p-6"
          aria-label="General profile information"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/50">
            General
          </p>

          <div className="mt-5 grid items-start gap-6 lg:grid-cols-2">
            <section className="rounded-2xl border border-white/10 bg-white/5 p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <UserCircle className="h-4 w-4 text-[#4fa5ff]" aria-hidden="true" />
              Personal info
            </div>
            {isEditingPersonal ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={savePersonal}
                  disabled={saving}
                  className="rounded-full border border-white/20 p-2 text-white/70 transition hover:border-white/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                  aria-label="Save personal info"
                >
                  <Check className="h-3 w-3" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={cancelEditSection}
                  disabled={saving}
                  className="rounded-full border border-white/20 p-2 text-white/70 transition hover:border-white/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                  aria-label="Cancel edit"
                >
                  <X className="h-3 w-3" aria-hidden="true" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => startEditSection("personal")}
                className="rounded-full border border-[#ff9c4b] p-2 text-white/70 transition hover:border-[#ffd08b] hover:text-white"
                aria-label="Edit personal info"
              >
                <Pencil className="h-3 w-3 text-[#ff9c4b]" aria-hidden="true" />
              </button>
            )}
          </div>

          {isEditingPersonal ? (
            <div className="mt-4 space-y-3 text-sm text-white/70">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-20 w-20 overflow-hidden rounded-2xl border border-white/15 bg-white/5">
                      {draft.avatar_url ? (
                        <img
                          src={draft.avatar_url}
                          alt={`${draft.full_name || "Volunteer"} profile`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <UserCircle
                            className="h-10 w-10 text-white/35"
                            aria-hidden="true"
                          />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                        Profile image
                      </p>
                      <p className="mt-1 text-xs text-white/60">
                        JPG / PNG. Stored with your profile.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      ref={avatarFileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarFileChange}
                    />
                    <button
                      type="button"
                      onClick={() => avatarFileInputRef.current?.click()}
                      className="rounded-full border border-[#ff9c4b]/70 p-2 text-white/80 transition hover:border-[#ffd08b] hover:text-white"
                      aria-label="Change profile image"
                      title="Change profile image"
                    >
                      <ImagePlus className="h-4 w-4 text-[#ff9c4b]" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setDraft((prev) => ({ ...prev, avatar_url: "" }))
                      }
                      className="rounded-full border border-white/20 p-2 text-white/70 transition hover:border-rose-300/70 hover:text-rose-100"
                      aria-label="Remove profile image"
                      title="Remove profile image"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs text-white/50">Full name</label>
                  <input
                    value={draft.full_name}
                    onChange={(event) =>
                      setDraft((prev) => ({ ...prev, full_name: event.target.value }))
                    }
                    className={`${inputBase} mt-1`}
                  />
                </div>
                <div>
                  <label className="text-xs text-white/50">Role</label>
                  <input
                    value={draft.role}
                    onChange={(event) =>
                      setDraft((prev) => ({ ...prev, role: event.target.value }))
                    }
                    className={`${inputBase} mt-1`}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs text-white/50">Location</label>
                  <input
                    value={draft.volunteer_location}
                    onChange={(event) =>
                      setDraft((prev) => ({
                        ...prev,
                        volunteer_location: event.target.value,
                      }))
                    }
                    className={`${inputBase} mt-1`}
                    placeholder="City, Country"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/50">Date of birth</label>
                  <input
                    type="date"
                    value={draft.birth_date ? draft.birth_date.substring(0, 10) : ""}
                    onChange={(event) =>
                      setDraft((prev) => ({ ...prev, birth_date: event.target.value }))
                    }
                    className={`${inputBase} mt-1`}
                  />
                </div>
                <div>
                  <label className="text-xs text-white/50">Has a car</label>
                  <select
                    value={draft.volunteer_has_car ? "yes" : "no"}
                    onChange={(event) =>
                      setDraft((prev) => ({
                        ...prev,
                        volunteer_has_car: event.target.value === "yes",
                      }))
                    }
                    className={`${inputBase} mt-1`}
                  >
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-white/50">Status</label>
                  <select
                    value={draft.volunteer_status}
                    onChange={(event) =>
                      setDraft((prev) => ({
                        ...prev,
                        volunteer_status: event.target.value as VolunteerProfile["volunteer_status"],
                      }))
                    }
                    className={`${inputBase} mt-1`}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-white/50">Bio</label>
                <textarea
                  value={draft.bio}
                  onChange={(event) =>
                    setDraft((prev) => ({ ...prev, bio: event.target.value }))
                  }
                  rows={3}
                  className={`${inputBase} mt-1 resize-none`}
                  placeholder="Tell us about your volunteer experience."
                />
              </div>
            </div>
          ) : (
            <div className="mt-4 space-y-3 text-sm text-white/70">
              <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="h-20 w-20 overflow-hidden rounded-2xl border border-white/15 bg-white/5">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={`${profile.full_name || "Volunteer"} profile`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <UserCircle
                        className="h-10 w-10 text-white/35"
                        aria-hidden="true"
                      />
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                    Profile image
                  </p>
                  <p className="mt-1 text-sm text-white/60">
                    {profile.avatar_url ? "Photo uploaded" : "No photo yet"}
                  </p>
                </div>
              </div>
              <div className="grid gap-1">
                <p className="text-lg font-semibold text-white">
                  {profile.full_name || "—"}
                </p>
                <p className="text-sm text-white/70">{profile.role || "—"}</p>
                <p className="text-sm text-white/50">
                  {profile.volunteer_location || "—"}
                </p>
                <p className="text-sm text-white/50">
                  Date of birth:{" "}
                  {profile.birth_date ? profile.birth_date.substring(0, 10) : "—"}
                </p>
                <p className="text-sm text-white/50">
                  Has a car: {profile.volunteer_has_car ? "Yes" : "No"}
                </p>
                <p className="text-sm text-white/50">
                  Status: {profile.volunteer_status}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                  Bio
                </p>
                <p className="mt-2 text-sm text-white/70">{profile.bio || "—"}</p>
              </div>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Briefcase className="h-4 w-4 text-[#4fa5ff]" aria-hidden="true" />
              Skills and languages
            </div>
            {isEditingSkills ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={saveSkills}
                  disabled={saving}
                  className="rounded-full border border-white/20 p-2 text-white/70 transition hover:border-white/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                  aria-label="Save skills"
                >
                  <Check className="h-3 w-3" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={cancelEditSection}
                  disabled={saving}
                  className="rounded-full border border-white/20 p-2 text-white/70 transition hover:border-white/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                  aria-label="Cancel edit"
                >
                  <X className="h-3 w-3" aria-hidden="true" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => startEditSection("skills")}
                className="rounded-full border border-[#ff9c4b] p-2 text-white/70 transition hover:border-[#ffd08b] hover:text-white"
                aria-label="Edit skills"
              >
                <Pencil className="h-3 w-3 text-[#ff9c4b]" aria-hidden="true" />
              </button>
            )}
          </div>
          {isEditingSkills ? (
            <div className="mt-4 space-y-3 text-sm text-white/70">
              <div>
                <label className="text-xs text-white/50">
                  Skills (comma separated)
                </label>
                <input
                  type="text"
                  value={skillsText}
                  onChange={(event) => setSkillsText(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-[#ff9c4b] focus:outline-none"
                  placeholder="Logistics, Food prep, Youth mentoring"
                />
              </div>
              <div>
                <label className="text-xs text-white/50">
                  Languages (comma separated)
                </label>
                <input
                  type="text"
                  value={languagesText}
                  onChange={(event) => setLanguagesText(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-[#ff9c4b] focus:outline-none"
                  placeholder="English, French"
                />
              </div>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                  Skills
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(profile.volunteer_skills ?? []).length === 0 ? (
                    <span className="text-xs text-white/50">—</span>
                  ) : (
                    profile.volunteer_skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/70"
                      >
                        {skill}
                      </span>
                    ))
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                  Languages
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(profile.volunteer_languages ?? []).length === 0 ? (
                    <span className="text-xs text-white/50">—</span>
                  ) : (
                    profile.volunteer_languages.map((language) => (
                      <span
                        key={language}
                        className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/70"
                      >
                        {language}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Mail className="h-4 w-4 text-[#4fa5ff]" aria-hidden="true" />
              Contact
            </div>
            {isEditingContact ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={saveContact}
                  disabled={saving}
                  className="rounded-full border border-white/20 p-2 text-white/70 transition hover:border-white/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                  aria-label="Save contact"
                >
                  <Check className="h-3 w-3" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={cancelEditSection}
                  disabled={saving}
                  className="rounded-full border border-white/20 p-2 text-white/70 transition hover:border-white/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                  aria-label="Cancel edit"
                >
                  <X className="h-3 w-3" aria-hidden="true" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => startEditSection("contact")}
                className="rounded-full border border-[#ff9c4b] p-2 text-white/70 transition hover:border-[#ffd08b] hover:text-white"
                aria-label="Edit contact"
              >
                <Pencil className="h-3 w-3 text-[#ff9c4b]" aria-hidden="true" />
              </button>
            )}
          </div>
          {isEditingContact ? (
            <div className="mt-4 space-y-3 text-sm text-white/70">
              <div>
                <label className="text-xs text-white/50">Email</label>
                <input
                  type="email"
                  value={draft.email}
                  onChange={(event) =>
                    setDraft((prev) => ({ ...prev, email: event.target.value }))
                  }
                  className={`${inputBase} mt-2`}
                />
              </div>
              <div>
                <label className="text-xs text-white/50">Phone</label>
                <div className="mt-2 grid grid-cols-[180px_1fr] gap-2">
                  <select
                    value={phoneCountryCode}
                    onChange={(event) => setPhoneCountryCode(event.target.value)}
                    className={inputBase}
                    aria-label="Country calling code"
                  >
                    {PHONE_COUNTRY_CODES.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={phoneLocalNumber}
                    onChange={(event) => setPhoneLocalNumber(event.target.value)}
                    className={inputBase}
                    placeholder="Phone number"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4 space-y-2 text-sm text-white/70">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-white/50" aria-hidden="true" />
                <span>{profile.email || "—"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-white/50" aria-hidden="true" />
                <span>{profile.phone || "—"}</span>
              </div>
            </div>
          )}
        </section>
          </div>
        </section>

        <section
          className="rounded-3xl border border-white/10 bg-white/5 p-5 md:p-6"
          aria-label="Volunteer and mission trip information"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/50">
            Volunteer &amp; Mission Trips
          </p>

          <div className="mt-5 grid items-start gap-6 lg:grid-cols-2">
            <section className="rounded-2xl border border-white/10 bg-white/5 p-5 lg:col-span-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Calendar
                    className="h-4 w-4 text-[#4fa5ff]"
                    aria-hidden="true"
                  />
                  Availability
                </div>
                {isEditingAvailability ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={saveAvailability}
                      disabled={saving}
                      className="rounded-full border border-white/20 p-2 text-white/70 transition hover:border-white/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                      aria-label="Save availability"
                    >
                      <Check className="h-3 w-3" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={cancelEditSection}
                      disabled={saving}
                      className="rounded-full border border-white/20 p-2 text-white/70 transition hover:border-white/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                      aria-label="Cancel edit"
                    >
                      <X className="h-3 w-3" aria-hidden="true" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => startEditSection("availability")}
                    className="rounded-full border border-[#ff9c4b] p-2 text-white/70 transition hover:border-[#ffd08b] hover:text-white"
                    aria-label="Edit availability"
                  >
                    <Pencil
                      className="h-3 w-3 text-[#ff9c4b]"
                      aria-hidden="true"
                    />
                  </button>
                )}
              </div>

              {isEditingAvailability ? (
                <div className="mt-4 space-y-3 text-sm text-white/70">
                  <div className="grid grid-cols-[100px_1fr_1fr] gap-3 text-[10px] uppercase tracking-[0.2em] text-white/50">
                    <span>Day</span>
                    <span>Time</span>
                    <span>Mode</span>
                  </div>
                  <div className="space-y-2">
                    {availabilityDays.map((day) => (
                      <div
                        key={day.id}
                        className="grid grid-cols-[100px_1fr_1fr] items-center gap-3"
                      >
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={availabilitySelection[day.id]?.enabled ?? false}
                            onChange={() =>
                              setAvailabilitySelection((prev) => ({
                                ...prev,
                                [day.id]: {
                                  ...prev[day.id],
                                  enabled: !prev[day.id]?.enabled,
                                },
                              }))
                            }
                            className="h-4 w-4 rounded border-white/40 bg-transparent text-[#ff9c4b] focus:ring-[#ff9c4b]"
                          />
                          <span className="text-[10px] uppercase tracking-[0.2em] text-white/70">
                            {day.label}
                          </span>
                        </label>
                        <select
                          value={availabilitySelection[day.id]?.slot ?? "anytime"}
                          onChange={(event) =>
                            setAvailabilitySelection((prev) => ({
                              ...prev,
                              [day.id]: {
                                ...prev[day.id],
                                slot: event.target.value as AvailabilitySlotId,
                              },
                            }))
                          }
                          disabled={!availabilitySelection[day.id]?.enabled}
                          className={`rounded-full border border-white/20 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70 focus:outline-none ${
                            availabilitySelection[day.id]?.enabled
                              ? "hover:border-white/40"
                              : "cursor-not-allowed opacity-40"
                          }`}
                        >
                          {availabilitySlots.map((slot) => (
                            <option key={slot.id} value={slot.id}>
                              {slot.label}
                            </option>
                          ))}
                        </select>
                        <select
                          value={availabilitySelection[day.id]?.mode ?? "in-person"}
                          onChange={(event) =>
                            setAvailabilitySelection((prev) => ({
                              ...prev,
                              [day.id]: {
                                ...prev[day.id],
                                mode: event.target.value as AvailabilityModeId,
                              },
                            }))
                          }
                          disabled={!availabilitySelection[day.id]?.enabled}
                          className={`rounded-full border border-white/20 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70 focus:outline-none ${
                            availabilitySelection[day.id]?.enabled
                              ? "hover:border-white/40"
                              : "cursor-not-allowed opacity-40"
                          }`}
                        >
                          {availabilityModes.map((mode) => (
                            <option key={mode.id} value={mode.id}>
                              {mode.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  <div className="grid grid-cols-[100px_1fr_1fr] gap-3 text-[10px] uppercase tracking-[0.2em] text-white/50">
                    <span>Day</span>
                    <span>Time</span>
                    <span>Mode</span>
                  </div>
                  {availabilityRows.length === 0 ? (
                    <span className="text-xs text-white/50">
                      No availability set.
                    </span>
                  ) : (
                    <div className="space-y-2">
                      {availabilityRows.map((row) => (
                        <div
                          key={row.id}
                          className="grid grid-cols-[100px_1fr_1fr] items-center gap-3 text-xs text-white/80"
                        >
                          <span className="font-semibold text-white">{row.day}</span>
                          <span className="text-white/70">{row.slot}</span>
                          <span
                            className={`inline-flex w-fit rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${availabilityModeTone[row.modeId]}`}
                          >
                            {row.mode}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </section>

            <VolunteerDocumentsSection mode="volunteer" />
            <VolunteerReferencesSection mode="volunteer" />
          </div>
        </section>
      </div>
    </motion.div>
  );
}
