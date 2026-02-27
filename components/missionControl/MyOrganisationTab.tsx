"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { Check, Eye, Globe, Mail, MapPin, Pencil, Phone, X } from "lucide-react";
import useActiveOrganization from "./useActiveOrganization";

type OrgProfile = {
  name: string;
  tagline: string;
  mission: string;
  vision: string;
  headquarters: {
    city: string;
    address: string;
  };
  contacts: {
    email: string;
    phone: string;
    website: string;
  };
  partnerFocus: {
    id: string;
    name: string;
    href: string;
  }[];
};

const STORAGE_KEY = "cfoc-org-profile";

const DEFAULT_PROFILE: OrgProfile = {
  name: "CFOC Mission International",
  tagline: "A compact snapshot of projects, impact, and community reach for sharing with partners.",
  mission:
    "Equip communities with practical resources, local leadership, and faith-centered support to create lasting impact.",
  vision:
    "A network of thriving communities empowered to lead sustainable change through collaboration and shared purpose.",
  headquarters: {
    city: "Ajax, Ontario",
    address: "158 Harwood Ave S, Ajax, ON",
  },
  contacts: {
    email: "contact@cfocimpact.org",
    phone: "+19051234567",
    website: "https://cfocimpact.org",
  },
  partnerFocus: [
    {
      id: "project-zambia-water",
      name: "Clean Water Initiative - Zambia",
      href: "/projectDetails/project-zambia-water",
    },
    {
      id: "project-haiti-youth",
      name: "Youth Empowerment Hub - Haiti",
      href: "/projectDetails/project-haiti-youth",
    },
    {
      id: "project-kenya-medical",
      name: "Kenya Medical Outreach Center",
      href: "/projectDetails/project-kenya-medical",
    },
  ],
};

const ORG_STATS = [
  { label: "Active projects", value: "8" },
  { label: "Missions this year", value: "5" },
  { label: "Communities served", value: "24" },
  { label: "Monthly donors", value: "312" },
];

const readLocalOrgProfile = (): OrgProfile => {
  if (typeof window === "undefined") return DEFAULT_PROFILE;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) return DEFAULT_PROFILE;
  try {
    const parsed = JSON.parse(stored) as Partial<OrgProfile>;
    return {
      ...DEFAULT_PROFILE,
      ...parsed,
      headquarters: {
        ...DEFAULT_PROFILE.headquarters,
        ...parsed.headquarters,
      },
      contacts: {
        ...DEFAULT_PROFILE.contacts,
        ...parsed.contacts,
      },
      partnerFocus:
        Array.isArray(parsed.partnerFocus) && parsed.partnerFocus.length > 0
          ? parsed.partnerFocus
          : DEFAULT_PROFILE.partnerFocus,
    };
  } catch {
    return DEFAULT_PROFILE;
  }
};

const normalizeOrgProfileFromDb = (
  orgRow: Record<string, unknown>,
  partnerRows: Record<string, unknown>[]
): OrgProfile => {
  const partnerFocus = partnerRows
    .map((row, index) => ({
      id:
        typeof row.id === "string" && row.id.trim()
          ? row.id
          : `partner-focus-${index}`,
      name:
        typeof row.label === "string" && row.label.trim()
          ? row.label
          : "",
      href:
        typeof row.href === "string" && row.href.trim()
          ? row.href
          : "#",
    }))
    .filter((row) => row.name.length > 0);

  return {
    ...DEFAULT_PROFILE,
    name:
      typeof orgRow.name === "string" && orgRow.name.trim()
        ? orgRow.name
        : DEFAULT_PROFILE.name,
    tagline:
      typeof orgRow.tagline === "string" && orgRow.tagline.trim()
        ? orgRow.tagline
        : DEFAULT_PROFILE.tagline,
    mission:
      typeof orgRow.mission_statement === "string" && orgRow.mission_statement.trim()
        ? orgRow.mission_statement
        : DEFAULT_PROFILE.mission,
    vision:
      typeof orgRow.vision_statement === "string" && orgRow.vision_statement.trim()
        ? orgRow.vision_statement
        : DEFAULT_PROFILE.vision,
    headquarters: {
      city:
        typeof orgRow.headquarters_city === "string" &&
        orgRow.headquarters_city.trim()
          ? orgRow.headquarters_city
          : DEFAULT_PROFILE.headquarters.city,
      address:
        typeof orgRow.headquarters_address === "string" &&
        orgRow.headquarters_address.trim()
          ? orgRow.headquarters_address
          : DEFAULT_PROFILE.headquarters.address,
    },
    contacts: {
      email:
        typeof orgRow.contact_email === "string" && orgRow.contact_email.trim()
          ? orgRow.contact_email
          : DEFAULT_PROFILE.contacts.email,
      phone:
        typeof orgRow.contact_phone === "string" && orgRow.contact_phone.trim()
          ? orgRow.contact_phone
          : DEFAULT_PROFILE.contacts.phone,
      website:
        typeof orgRow.website === "string" && orgRow.website.trim()
          ? orgRow.website
          : DEFAULT_PROFILE.contacts.website,
    },
    partnerFocus: partnerFocus.length > 0 ? partnerFocus : DEFAULT_PROFILE.partnerFocus,
  };
};

type MyOrganisationTabProps = {
  allowEdit?: boolean;
  embedded?: boolean;
  showEditInSettingsLink?: boolean;
};

export default function MyOrganisationTab({
  allowEdit = true,
  embedded = false,
  showEditInSettingsLink = false,
}: MyOrganisationTabProps) {
  const supabase = useSupabaseClient();
  const { userId, membership, loading: membershipLoading, error: membershipError } =
    useActiveOrganization();
  const [profile, setProfile] = useState<OrgProfile>(DEFAULT_PROFILE);
  const [draftProfile, setDraftProfile] = useState<OrgProfile>(DEFAULT_PROFILE);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const applyProfile = (next: OrgProfile) => {
      if (cancelled) return;
      setProfile(next);
      setDraftProfile(next);
      setLoading(false);
    };

    const loadProfile = async () => {
      setLoadError(null);
      setSaveFeedback(null);

      if (membershipLoading) {
        setLoading(true);
        return;
      }

      if (!userId || !membership?.organizationId) {
        applyProfile(readLocalOrgProfile());
        if (userId && !membership?.organizationId) {
          setLoadError("No active organization is linked to this account yet.");
        } else if (membershipError) {
          setLoadError(membershipError);
        }
        return;
      }

      setLoading(true);

      const { data: orgData, error: orgError } = await supabase
        .from("organizations")
        .select(
          [
            "id",
            "name",
            "tagline",
            "mission_statement",
            "vision_statement",
            "headquarters_city",
            "headquarters_address",
            "contact_email",
            "contact_phone",
            "website",
          ].join(",")
        )
        .eq("id", membership.organizationId)
        .maybeSingle();

      if (cancelled) return;

      if (orgError) {
        applyProfile(readLocalOrgProfile());
        setLoadError(orgError.message);
        return;
      }

      if (!orgData) {
        applyProfile(readLocalOrgProfile());
        setLoadError("Organization record not found for the active membership.");
        return;
      }

      const { data: focusData, error: focusError } = await supabase
        .from("organization_partner_focus")
        .select("id, label, href, sort_order")
        .eq("organization_id", membership.organizationId)
        .order("sort_order", { ascending: true });

      if (cancelled) return;

      if (focusError) {
        applyProfile(
          normalizeOrgProfileFromDb(
            orgData as Record<string, unknown>,
            []
          )
        );
        setLoadError(focusError.message);
        return;
      }

      const normalized = normalizeOrgProfileFromDb(
        orgData as Record<string, unknown>,
        (focusData ?? []) as Record<string, unknown>[]
      );
      applyProfile(normalized);
    };

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, [
    membership?.organizationId,
    membershipError,
    membershipLoading,
    supabase,
    userId,
  ]);

  const handleEdit = () => {
    if (!allowEdit) return;
    setLoadError(null);
    setSaveFeedback(null);
    setDraftProfile(profile);
    setIsEditMode(true);
  };

  const handleCancel = () => {
    setDraftProfile(profile);
    setIsEditMode(false);
    setSaveFeedback(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setLoadError(null);
    setSaveFeedback(null);

    const trimmedPartnerFocus = draftProfile.partnerFocus
      .map((item) => ({
        id: item.id,
        name: item.name.trim(),
        href: item.href.trim(),
      }))
      .filter((item) => item.name.length > 0);

    const nextProfile: OrgProfile = {
      ...draftProfile,
      partnerFocus:
        trimmedPartnerFocus.length > 0
          ? trimmedPartnerFocus.map((item) => ({
              ...item,
              href: item.href || "#",
            }))
          : DEFAULT_PROFILE.partnerFocus,
    };

    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextProfile));
    }

    if (!userId || !membership?.organizationId) {
      setProfile(nextProfile);
      setDraftProfile(nextProfile);
      setIsEditMode(false);
      setSaveFeedback("Saved locally.");
      setSaving(false);
      return;
    }

    const { error: updateOrgError } = await supabase
      .from("organizations")
      .update({
        name: nextProfile.name,
        tagline: nextProfile.tagline,
        mission_statement: nextProfile.mission,
        vision_statement: nextProfile.vision,
        headquarters_city: nextProfile.headquarters.city,
        headquarters_address: nextProfile.headquarters.address,
        contact_email: nextProfile.contacts.email,
        contact_phone: nextProfile.contacts.phone,
        website: nextProfile.contacts.website,
        updated_by: userId,
      })
      .eq("id", membership.organizationId);

    if (updateOrgError) {
      setLoadError(updateOrgError.message);
      setSaving(false);
      return;
    }

    const { error: deleteFocusError } = await supabase
      .from("organization_partner_focus")
      .delete()
      .eq("organization_id", membership.organizationId);

    if (deleteFocusError) {
      setLoadError(deleteFocusError.message);
      setSaving(false);
      return;
    }

    if (trimmedPartnerFocus.length > 0) {
      const { error: insertFocusError } = await supabase
        .from("organization_partner_focus")
        .insert(
          trimmedPartnerFocus.map((item, index) => ({
            organization_id: membership.organizationId,
            label: item.name,
            href: item.href || null,
            sort_order: index,
          }))
        );

      if (insertFocusError) {
        setLoadError(insertFocusError.message);
        setSaving(false);
        return;
      }
    }

    setProfile(nextProfile);
    setDraftProfile(nextProfile);
    setIsEditMode(false);
    setSaveFeedback("Saved.");
    setSaving(false);
  };

  const activeProfile = isEditMode ? draftProfile : profile;
  const inputBase =
    "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-[#ff9c4b] focus:outline-none";

  const headerCardClass = embedded
    ? "rounded-3xl border border-white/10 bg-white/5 p-5 md:p-6 backdrop-blur-xl"
    : "rounded-2xl border border-white/10 bg-[#ff9c4b]/20 backdrop-blur-md p-6 space-y-4";

  const statsCardClass = embedded
    ? "rounded-2xl border border-white/10 bg-white/5 p-4 text-center"
    : "rounded-2xl border border-white/10 bg-[#ff9c4b]/20 p-4 text-center";

  return (
    <section className={`${embedded ? "text-white" : "p-6 text-white"}`}>
      <div className={`${embedded ? "space-y-6" : "max-w-6xl mx-auto space-y-6"}`}>
        {loading && (
          <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
            Loading organization profile…
          </div>
        )}

        {loadError && (
          <div className="rounded-xl border border-amber-300/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            {loadError}
          </div>
        )}

        {saveFeedback && (
          <div className="rounded-xl border border-emerald-300/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
            {saveFeedback}
          </div>
        )}

        <div className={`${headerCardClass} space-y-4`}>
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#ff9c4b] via-[#ffd08b] to-[#4fa5ff] text-[#271c70] font-bold flex items-center justify-center text-sm">
                CFOC
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/60">
                  My organization
                </p>
                {isEditMode ? (
                  <div className="mt-2 space-y-2">
                    <input
                      value={activeProfile.name}
                      onChange={(event) =>
                        setDraftProfile((prev) => ({
                          ...prev,
                          name: event.target.value,
                        }))
                      }
                      className={inputBase}
                      placeholder="Organization name"
                    />
                    <textarea
                      value={activeProfile.tagline}
                      onChange={(event) =>
                        setDraftProfile((prev) => ({
                          ...prev,
                          tagline: event.target.value,
                        }))
                      }
                      className={`${inputBase} min-h-[70px]`}
                      placeholder="Short tagline"
                    />
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-semibold">
                      {activeProfile.name}
                    </h2>
                    <p className="text-sm text-white/70 max-w-xl">
                      {activeProfile.tagline}
                    </p>
                  </>
                )}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <a
                href={`mailto:${activeProfile.contacts.email}`}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/80 hover:border-white/40 hover:text-white transition"
                aria-label="Email"
                title="Email"
              >
                <Mail size={16} />
              </a>
              <a
                href={`tel:${activeProfile.contacts.phone}`}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/80 hover:border-white/40 hover:text-white transition"
                aria-label="Call"
                title="Call"
              >
                <Phone size={16} />
              </a>
              <a
                href={activeProfile.contacts.website}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-[#ff9c4b] via-[#ffb86b] to-[#ff9c4b] text-[#271c70] hover:from-[#ffd08b] hover:to-[#ff9c4b] transition"
                aria-label="Website"
                title="Website"
              >
                <Globe size={16} />
              </a>
              {embedded ? (
                isEditMode ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={saving}
                      className="rounded-full border border-white/20 p-2 text-white/70 transition hover:border-white/40 hover:text-white"
                      aria-label="Save organization profile"
                    >
                      <Check className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="rounded-full border border-white/20 p-2 text-white/70 transition hover:border-white/40 hover:text-white"
                      aria-label="Cancel edit"
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                ) : allowEdit ? (
                  <button
                    type="button"
                    onClick={handleEdit}
                    disabled={loading}
                    className="rounded-full border border-[#ff9c4b] p-2 text-white/70 transition hover:border-[#ffd08b] hover:text-white"
                    aria-label="Edit organization profile"
                  >
                    <Pencil className="h-4 w-4 text-[#ff9c4b]" aria-hidden="true" />
                  </button>
                ) : null
              ) : isEditMode ? (
                <>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="rounded-full bg-white text-[#271c70] px-4 py-2 text-xs uppercase tracking-[0.2em] font-semibold hover:bg-white/90 transition disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? "Saving…" : "Save"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="rounded-full border border-white/30 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white/80 hover:border-white/60 hover:text-white transition"
                  >
                    Cancel
                  </button>
                </>
              ) : allowEdit ? (
                <button
                  type="button"
                  onClick={handleEdit}
                  disabled={loading}
                  className="rounded-full border border-white/30 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white/80 hover:border-white/60 hover:text-white transition disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Edit
                </button>
              ) : showEditInSettingsLink ? (
                <Link
                  href="/settings?tab=organisation"
                  className="rounded-full border border-white/30 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white/80 hover:border-white/60 hover:text-white transition"
                >
                  Edit in Settings
                </Link>
              ) : null}
            </div>
          </div>
          {isEditMode && (
            <div className="grid gap-3 md:grid-cols-3">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-[0.2em] text-white/60">
                  Email
                </label>
                <input
                  type="email"
                  value={activeProfile.contacts.email}
                  onChange={(event) =>
                    setDraftProfile((prev) => ({
                      ...prev,
                      contacts: {
                        ...prev.contacts,
                        email: event.target.value,
                      },
                    }))
                  }
                  className={inputBase}
                  placeholder="contact@org.org"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-[0.2em] text-white/60">
                  Phone
                </label>
                <input
                  type="tel"
                  value={activeProfile.contacts.phone}
                  onChange={(event) =>
                    setDraftProfile((prev) => ({
                      ...prev,
                      contacts: {
                        ...prev.contacts,
                        phone: event.target.value,
                      },
                    }))
                  }
                  className={inputBase}
                  placeholder="+1 905 123 4567"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-[0.2em] text-white/60">
                  Website
                </label>
                <input
                  type="url"
                  value={activeProfile.contacts.website}
                  onChange={(event) =>
                    setDraftProfile((prev) => ({
                      ...prev,
                      contacts: {
                        ...prev.contacts,
                        website: event.target.value,
                      },
                    }))
                  }
                  className={inputBase}
                  placeholder="https://org.org"
                />
              </div>
            </div>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ORG_STATS.map((stat) => (
            <div
              key={stat.label}
              className={statsCardClass}
            >
              <p className="text-xs uppercase tracking-[0.2em] text-white/60">
                {stat.label}
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="text-lg font-semibold text-[#ff9c4b]">Our mission</h3>
            {isEditMode ? (
              <textarea
                value={activeProfile.mission}
                onChange={(event) =>
                  setDraftProfile((prev) => ({
                    ...prev,
                    mission: event.target.value,
                  }))
                }
                className={`${inputBase} mt-3 min-h-[110px]`}
              />
            ) : (
              <p className="mt-3 text-sm text-white/70">
                {activeProfile.mission}
              </p>
            )}
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="text-lg font-semibold text-[#ff9c4b]">Our vision</h3>
            {isEditMode ? (
              <textarea
                value={activeProfile.vision}
                onChange={(event) =>
                  setDraftProfile((prev) => ({
                    ...prev,
                    vision: event.target.value,
                  }))
                }
                className={`${inputBase} mt-3 min-h-[110px]`}
              />
            ) : (
              <p className="mt-3 text-sm text-white/70">
                {activeProfile.vision}
              </p>
            )}
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="text-lg font-semibold text-white">Headquarters</h3>
            <div className="mt-3 rounded-xl border border-white/10 bg-gradient-to-br from-[#0b041d]/70 via-[#1d0b49]/50 to-[#3a216f]/60 p-4">
              {isEditMode ? (
                <div className="space-y-2">
                  <input
                    value={activeProfile.headquarters.city}
                    onChange={(event) =>
                      setDraftProfile((prev) => ({
                        ...prev,
                        headquarters: {
                          ...prev.headquarters,
                          city: event.target.value,
                        },
                      }))
                    }
                    className={inputBase}
                    placeholder="City"
                  />
                  <input
                    value={activeProfile.headquarters.address}
                    onChange={(event) =>
                      setDraftProfile((prev) => ({
                        ...prev,
                        headquarters: {
                          ...prev.headquarters,
                          address: event.target.value,
                        },
                      }))
                    }
                    className={inputBase}
                    placeholder="Address"
                  />
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-white/80">
                    <MapPin size={18} />
                    <span className="text-sm">
                      {activeProfile.headquarters.city}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-white/60">
                    {activeProfile.headquarters.address}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <h3 className="text-lg font-semibold text-white">Partner focus</h3>
            <p className="mt-2 text-sm text-white/70">
              Highlight priority projects to keep the community engaged.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-white/80">
              {activeProfile.partnerFocus.map((project, index) => (
                <li
                  key={project.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2"
                >
                  {isEditMode ? (
                    <div className="flex-1 space-y-2">
                      <input
                        value={project.name}
                        onChange={(event) =>
                          setDraftProfile((prev) => {
                            const next = [...prev.partnerFocus];
                            next[index] = {
                              ...next[index],
                              name: event.target.value,
                            };
                            return { ...prev, partnerFocus: next };
                          })
                        }
                        className={inputBase}
                        placeholder="Project name"
                      />
                      <input
                        value={project.href}
                        onChange={(event) =>
                          setDraftProfile((prev) => {
                            const next = [...prev.partnerFocus];
                            next[index] = {
                              ...next[index],
                              href: event.target.value,
                            };
                            return { ...prev, partnerFocus: next };
                          })
                        }
                        className={inputBase}
                        placeholder="Project link"
                      />
                    </div>
                  ) : (
                    <span className="text-sm text-white/80">{project.name}</span>
                  )}
                  <Link
                    href={project.href}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-white/70 transition hover:border-white/40 hover:text-white"
                    aria-label={`View ${project.name}`}
                  >
                    <Eye size={16} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <h3 className="text-lg font-semibold text-white">Next milestone</h3>
            <p className="mt-2 text-sm text-white/70">
              Share the next public update with impact highlights and photos.
            </p>
            <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-white/60">
                Upcoming share
              </p>
              <p className="mt-2 text-base font-semibold text-white">
                Community update - July 2025
              </p>
              <p className="mt-1 text-sm text-white/70">
                Project outcomes, volunteer stories, and donor thank-you notes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
