"use client";

import type { ChangeEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import {
  Building2,
  Check,
  ChevronDown,
  ChevronUp,
  Loader2,
  Mail,
  Pencil,
  Phone,
  Plus,
  UserCircle,
  X,
} from "lucide-react";

type VolunteerReferenceRow = {
  id: string;
  user_id: string;
  user_email: string;
  reference_email: string | null;
  organization: string;
  phone: string | null;
  contact_person: string;
  created_at: string;
  updated_at: string;
};

type ReferenceDraft = {
  organization: string;
  contact_person: string;
  reference_email: string;
  phone: string;
};

type VolunteerReferencesSectionProps =
  | { mode: "volunteer"; className?: string }
  | { mode: "manager"; volunteerEmail: string; className?: string };

const emptyDraft = (): ReferenceDraft => ({
  organization: "",
  contact_person: "",
  reference_email: "",
  phone: "",
});

const normalizeOptional = (value: string) => {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const normalizeRequired = (value: string) => value.trim();

const isEmailValid = (email: string) => {
  const trimmed = email.trim();
  if (!trimmed) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
};

const LOCAL_STORAGE_PREFIX = "cfoc-volunteer-references";

const getLocalStorageKey = (email: string | null) =>
  `${LOCAL_STORAGE_PREFIX}:${email ?? "anonymous"}`;

const readLocalReferences = (key: string): VolunteerReferenceRow[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(Boolean) as VolunteerReferenceRow[];
  } catch {
    return [];
  }
};

const writeLocalReferences = (key: string, items: VolunteerReferenceRow[]) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(items));
  } catch {
    // ignore storage failures (private mode, quotas, etc.)
  }
};

export default function VolunteerReferencesSection(
  props: VolunteerReferencesSectionProps
) {
  const supabase = useSupabaseClient();
  const session = useSession();
  const userId = session?.user?.id ?? null;
  const userEmail = session?.user?.email ?? null;
  const isSignedIn = Boolean(session?.user);

  const mode = props.mode;
  const targetEmail = mode === "manager" ? props.volunteerEmail : userEmail;

  const [references, setReferences] = useState<VolunteerReferenceRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [addDraft, setAddDraft] = useState<ReferenceDraft>(() => emptyDraft());
  const [editId, setEditId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<ReferenceDraft | null>(null);

  const isEditing = useMemo(() => editId !== null, [editId]);
  const localStorageKey = useMemo(
    () => getLocalStorageKey(userEmail),
    [userEmail]
  );

  useEffect(() => {
    let cancelled = false;

    const fetchReferences = async () => {
      setError(null);
      setFeedback(null);

      if (mode === "volunteer") {
        if (!isSignedIn || !userId) {
          setReferences(readLocalReferences(localStorageKey));
          return;
        }

        setLoading(true);

        const query = supabase
          .from("volunteer_references")
          .select(
            "id,user_id,user_email,reference_email,organization,phone,contact_person,created_at,updated_at"
          )
          .order("created_at", { ascending: false });

        const { data, error } = await query.eq("user_id", userId);

        if (cancelled) return;

        if (error) {
          setError(error.message);
          setReferences([]);
        } else {
          setReferences((data ?? []) as VolunteerReferenceRow[]);
        }

        setLoading(false);
        return;
      }

      if (!isSignedIn || !targetEmail) {
        setReferences([]);
        return;
      }

      setLoading(true);

      const query = supabase
        .from("volunteer_references")
        .select(
          "id,user_id,user_email,reference_email,organization,phone,contact_person,created_at,updated_at"
        )
        .order("created_at", { ascending: false });

      const { data, error } = await query.eq("user_email", targetEmail);

      if (cancelled) return;

      if (error) {
        setError(error.message);
        setReferences([]);
      } else {
        setReferences((data ?? []) as VolunteerReferenceRow[]);
      }

      setLoading(false);
    };

    fetchReferences();

    return () => {
      cancelled = true;
    };
  }, [isSignedIn, localStorageKey, mode, supabase, targetEmail, userId]);

  const resetMessages = () => {
    setError(null);
    setFeedback(null);
  };

  const toggleExpanded = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleAddChange =
    (field: keyof ReferenceDraft) => (event: ChangeEvent<HTMLInputElement>) => {
      setAddDraft((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleEditChange =
    (field: keyof ReferenceDraft) => (event: ChangeEvent<HTMLInputElement>) => {
      setEditDraft((prev) => (prev ? { ...prev, [field]: event.target.value } : prev));
    };

  const openAdd = () => {
    resetMessages();
    setAddOpen(true);
    setEditId(null);
    setEditDraft(null);
    setAddDraft(emptyDraft());
  };

  const closeAdd = () => {
    setAddOpen(false);
    setAddDraft(emptyDraft());
  };

  const startEdit = (ref: VolunteerReferenceRow) => {
    resetMessages();
    setAddOpen(false);
    setAddDraft(emptyDraft());
    setExpandedId(ref.id);
    setEditId(ref.id);
    setEditDraft({
      organization: ref.organization ?? "",
      contact_person: ref.contact_person ?? "",
      reference_email: ref.reference_email ?? "",
      phone: ref.phone ?? "",
    });
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditDraft(null);
  };

  const saveNewReference = async () => {
    resetMessages();

    const organization = normalizeRequired(addDraft.organization);
    const contactPerson = normalizeRequired(addDraft.contact_person);
    const referenceEmail = normalizeOptional(addDraft.reference_email);
    const phone = normalizeOptional(addDraft.phone);

    if (!organization || !contactPerson) {
      setError("Organisation/School and contact person are required.");
      return;
    }

    if (referenceEmail && !isEmailValid(referenceEmail)) {
      setError("Please enter a valid email.");
      return;
    }

    setSaving(true);

    if (!userId || !userEmail) {
      const now = new Date().toISOString();
      const row: VolunteerReferenceRow = {
        id: `local-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`,
        user_id: "local",
        user_email: userEmail ?? "local",
        reference_email: referenceEmail,
        organization,
        phone,
        contact_person: contactPerson,
        created_at: now,
        updated_at: now,
      };

      setReferences((prev) => {
        const next = [row, ...prev];
        writeLocalReferences(localStorageKey, next);
        return next;
      });
      setFeedback("Référence ajoutée.");
      setSaving(false);
      setAddOpen(false);
      setAddDraft(emptyDraft());
      setExpandedId(row.id);
      return;
    }

    const { data: row, error } = await supabase
      .from("volunteer_references")
      .insert({
        user_id: userId,
        user_email: userEmail,
        organization,
        contact_person: contactPerson,
        reference_email: referenceEmail,
        phone,
      })
      .select(
        "id,user_id,user_email,reference_email,organization,phone,contact_person,created_at,updated_at"
      )
      .single();

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }

    setReferences((prev) => [row as VolunteerReferenceRow, ...prev]);
    setFeedback("Référence ajoutée.");
    setSaving(false);
    setAddOpen(false);
    setAddDraft(emptyDraft());
    setExpandedId((row as VolunteerReferenceRow).id);
  };

  const saveEditedReference = async () => {
    resetMessages();

    if (mode !== "volunteer") return;
    if (!editId || !editDraft) return;

    const organization = normalizeRequired(editDraft.organization);
    const contactPerson = normalizeRequired(editDraft.contact_person);
    const referenceEmail = normalizeOptional(editDraft.reference_email);
    const phone = normalizeOptional(editDraft.phone);

    if (!organization || !contactPerson) {
      setError("Organisation/School and contact person are required.");
      return;
    }

    if (referenceEmail && !isEmailValid(referenceEmail)) {
      setError("Please enter a valid email.");
      return;
    }

    setSaving(true);

    if (!userId || !userEmail) {
      setReferences((prev) => {
        const next = prev.map((item) =>
          item.id === editId
            ? {
                ...item,
                organization,
                contact_person: contactPerson,
                reference_email: referenceEmail,
                phone,
                updated_at: new Date().toISOString(),
              }
            : item
        );
        writeLocalReferences(localStorageKey, next);
        return next;
      });
      setFeedback("Référence mise à jour.");
      setSaving(false);
      setEditId(null);
      setEditDraft(null);
      return;
    }

    const { data: row, error } = await supabase
      .from("volunteer_references")
      .update({
        organization,
        contact_person: contactPerson,
        reference_email: referenceEmail,
        phone,
        updated_at: new Date().toISOString(),
      })
      .eq("id", editId)
      .select(
        "id,user_id,user_email,reference_email,organization,phone,contact_person,created_at,updated_at"
      )
      .single();

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }

    setReferences((prev) =>
      prev.map((item) => (item.id === editId ? (row as VolunteerReferenceRow) : item))
    );
    setFeedback("Référence mise à jour.");
    setSaving(false);
    setEditId(null);
    setEditDraft(null);
  };

  const inputClass =
    "mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-[#ff9c4b] focus:outline-none";

  const className = props.className ?? "";

  return (
    <section
      className={`rounded-2xl border border-white/10 bg-white/5 p-5 ${className}`}
      aria-label="Volunteer references"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Building2 className="h-4 w-4 text-[#4fa5ff]" aria-hidden="true" />
            Mes références
          </div>
          <p className="mt-1 text-xs text-white/60">
            Ajoute des contacts pour vérifier ton expérience.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {loading && (
            <div className="inline-flex items-center gap-2 text-xs text-white/60">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Loading
            </div>
          )}
          {mode === "volunteer" && (
            <button
              type="button"
              onClick={() => {
                if (saving) return;
                openAdd();
              }}
              aria-disabled={saving}
              className={`inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/80 transition hover:border-white/40 ${
                saving ? "opacity-50" : ""
              }`}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Ajouter
            </button>
          )}
        </div>
      </div>

      {feedback && (
        <p className="mt-3 text-xs font-semibold text-emerald-200">
          {feedback}
        </p>
      )}
      {error && (
        <p className="mt-3 text-xs font-semibold text-rose-200">{error}</p>
      )}

      {addOpen && mode === "volunteer" && (
        <div className="mt-4 rounded-xl border border-white/10 bg-[#120626]/40 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-white/50">
            Nouvelle référence
          </p>
          <div className="mt-3 grid gap-3">
            <div>
              <label className="text-xs text-white/50">
                Nom de l’entreprise / school
              </label>
              <input
                type="text"
                value={addDraft.organization}
                onChange={handleAddChange("organization")}
                className={inputClass}
                placeholder="CFOC Impact / University…"
              />
            </div>
            <div>
              <label className="text-xs text-white/50">Personne de contact</label>
              <input
                type="text"
                value={addDraft.contact_person}
                onChange={handleAddChange("contact_person")}
                className={inputClass}
                placeholder="Nom complet"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="text-xs text-white/50">Email</label>
                <input
                  type="email"
                  value={addDraft.reference_email}
                  onChange={handleAddChange("reference_email")}
                  className={inputClass}
                  placeholder="contact@exemple.com"
                />
              </div>
              <div>
                <label className="text-xs text-white/50">Phone number</label>
                <input
                  type="tel"
                  value={addDraft.phone}
                  onChange={handleAddChange("phone")}
                  className={inputClass}
                  placeholder="+1 555 000 0000"
                />
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={saveNewReference}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-[#271c70] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#ff9c4b] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Check className="h-4 w-4" aria-hidden="true" />
              Enregistrer
            </button>
            <button
              type="button"
              onClick={closeAdd}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80 transition hover:border-white/40 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <X className="h-4 w-4" aria-hidden="true" />
              Annuler
            </button>
          </div>
        </div>
      )}

      <div className="mt-4 space-y-2">
        {references.length === 0 ? (
          <p className="rounded-xl border border-white/10 bg-[#120626]/40 px-4 py-3 text-xs text-white/60">
            Aucune référence ajoutée.
          </p>
        ) : (
          references.map((ref) => {
            const isExpanded = expandedId === ref.id;
            const isRowEditing = isEditing && editId === ref.id;
            const draft = isRowEditing ? editDraft : null;

            return (
              <div
                key={ref.id}
                className="rounded-xl border border-white/10 bg-[#120626]/40"
              >
                <div className="flex items-center justify-between gap-3 px-4 py-3">
                  <button
                    type="button"
                    onClick={() => toggleExpanded(ref.id)}
                    aria-expanded={isExpanded}
                    className="flex min-w-0 flex-1 items-center justify-between gap-3 text-left"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white/90">
                        {ref.organization}
                      </p>
                      <p className="truncate text-xs text-white/60">
                        {ref.contact_person}
                      </p>
                    </div>
                    {isExpanded ? (
                      <ChevronUp
                        className="h-5 w-5 shrink-0 text-white/60"
                        aria-hidden="true"
                      />
                    ) : (
                      <ChevronDown
                        className="h-5 w-5 shrink-0 text-white/60"
                        aria-hidden="true"
                      />
                    )}
                  </button>
                  {mode === "volunteer" && (
                    <button
                      type="button"
                      onClick={() => startEdit(ref)}
                      disabled={saving}
                      className="shrink-0 rounded-full border border-white/15 p-2 text-white/70 transition hover:border-white/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label="Edit reference"
                    >
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                    </button>
                  )}
                </div>

                {isExpanded && (
                  <div className="border-t border-white/10 px-4 py-4">
                    {isRowEditing && draft ? (
                      <>
                        <div className="grid gap-3">
                          <div>
                            <label className="text-xs text-white/50">
                              Nom de l’entreprise / school
                            </label>
                            <input
                              type="text"
                              value={draft.organization}
                              onChange={handleEditChange("organization")}
                              className={inputClass}
                            />
                          </div>
                          <div>
                            <label className="text-xs text-white/50">
                              Personne de contact
                            </label>
                            <input
                              type="text"
                              value={draft.contact_person}
                              onChange={handleEditChange("contact_person")}
                              className={inputClass}
                            />
                          </div>
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                              <label className="text-xs text-white/50">
                                Email
                              </label>
                              <input
                                type="email"
                                value={draft.reference_email}
                                onChange={handleEditChange("reference_email")}
                                className={inputClass}
                              />
                            </div>
                            <div>
                              <label className="text-xs text-white/50">
                                Phone number
                              </label>
                              <input
                                type="tel"
                                value={draft.phone}
                                onChange={handleEditChange("phone")}
                                className={inputClass}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={saveEditedReference}
                            disabled={saving}
                            className="inline-flex items-center gap-2 rounded-full bg-[#271c70] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#ff9c4b] disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <Check className="h-4 w-4" aria-hidden="true" />
                            Enregistrer
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            disabled={saving}
                            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80 transition hover:border-white/40 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <X className="h-4 w-4" aria-hidden="true" />
                            Annuler
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="space-y-2 text-sm text-white/70">
                        <div className="flex items-center gap-2">
                          <UserCircle className="h-4 w-4 text-white/50" aria-hidden="true" />
                          <span>{ref.contact_person}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-white/50" aria-hidden="true" />
                          <span>{ref.reference_email || "—"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-white/50" aria-hidden="true" />
                          <span>{ref.phone || "—"}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
