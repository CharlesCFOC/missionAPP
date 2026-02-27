"use client";

import type { ChangeEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import {
  CheckCircle2,
  Eye,
  FileText,
  Loader2,
  Trash2,
  Upload,
} from "lucide-react";

const ACCEPTED_MIME_TYPES = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
]);

const FILE_INPUT_ACCEPT = "application/pdf,image/png,image/jpeg";

type VolunteerDocumentType = "vulnerability_check" | "id" | "other";

type VolunteerDocumentRow = {
  id: string;
  user_id: string;
  user_email: string;
  doc_type: VolunteerDocumentType;
  title: string | null;
  file_path: string;
  file_name: string;
  mime_type: string;
  size_bytes: number | string | null;
  uploaded_at: string;
};

const DOCUMENT_TYPE_LABEL: Record<VolunteerDocumentType, string> = {
  vulnerability_check: "Vulnerability check",
  id: "ID",
  other: "Other documents",
};

const DOCUMENT_TYPE_DESCRIPTION: Record<VolunteerDocumentType, string> = {
  vulnerability_check: "Background / vulnerability check certificate.",
  id: "Passport or national ID card scan.",
  other: "Any supporting document (training, certifications, etc.).",
};

const formatBytes = (value: number | string | null) => {
  if (value === null || value === undefined) return "—";
  const parsed =
    typeof value === "string" ? Number.parseInt(value, 10) : value;
  if (!Number.isFinite(parsed) || parsed <= 0) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let size = parsed;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }
  const precision = unitIndex === 0 ? 0 : 1;
  return `${size.toFixed(precision)} ${units[unitIndex]}`;
};

const sanitizeFilename = (filename: string) => {
  const normalized = filename.normalize("NFKD");
  const cleaned = normalized.replace(/[^\w.\-() ]+/g, "");
  return cleaned.trim().replace(/\s+/g, "_").slice(0, 120) || "document";
};

type VolunteerDocumentsSectionProps =
  | { mode: "volunteer"; className?: string }
  | { mode: "manager"; volunteerEmail: string; className?: string };

export default function VolunteerDocumentsSection(
  props: VolunteerDocumentsSectionProps
) {
  const supabase = useSupabaseClient();
  const session = useSession();
  const userId = session?.user?.id ?? null;
  const userEmail = session?.user?.email ?? null;
  const isSignedIn = Boolean(session?.user);

  const mode = props.mode;
  const targetEmail = mode === "manager" ? props.volunteerEmail : userEmail;

  const [documents, setDocuments] = useState<VolunteerDocumentRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [uploadingType, setUploadingType] =
    useState<VolunteerDocumentType | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const documentsByType = useMemo(() => {
    return documents.reduce<Record<VolunteerDocumentType, VolunteerDocumentRow[]>>(
      (acc, doc) => {
        acc[doc.doc_type].push(doc);
        return acc;
      },
      { vulnerability_check: [], id: [], other: [] }
    );
  }, [documents]);

  useEffect(() => {
    let cancelled = false;

    const fetchDocuments = async () => {
      setError(null);
      setFeedback(null);

      const shouldFetch =
        isSignedIn &&
        ((mode === "volunteer" && Boolean(userId)) ||
          (mode === "manager" && Boolean(targetEmail)));
      if (!shouldFetch) {
        setDocuments([]);
        return;
      }

      setLoading(true);

      const query = supabase
        .from("volunteer_documents")
        .select(
          "id,user_id,user_email,doc_type,title,file_path,file_name,mime_type,size_bytes,uploaded_at"
        )
        .order("uploaded_at", { ascending: false });

      const { data, error } =
        mode === "volunteer"
          ? await query.eq("user_id", userId)
          : await query.eq("user_email", targetEmail);

      if (cancelled) return;

      if (error) {
        setError(error.message);
        setDocuments([]);
      } else {
        setDocuments((data ?? []) as VolunteerDocumentRow[]);
      }

      setLoading(false);
    };

    fetchDocuments();

    return () => {
      cancelled = true;
    };
  }, [isSignedIn, mode, supabase, targetEmail, userId]);

  const openDocument = async (doc: VolunteerDocumentRow) => {
    setError(null);
    setFeedback(null);
    if (!isSignedIn) {
      setError("Unable to view documents right now. Please refresh this page.");
      return;
    }
    const { data, error } = await supabase.storage
      .from("volunteer-documents")
      .createSignedUrl(doc.file_path, 60 * 10);

    if (error) {
      setError(error.message);
      return;
    }

    if (!data?.signedUrl) {
      setError("Could not generate a preview link for this document.");
      return;
    }

    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  };

  const uploadDocument = async (docType: VolunteerDocumentType, file: File) => {
    setError(null);
    setFeedback(null);

    if (!userId || !userEmail) {
      setError("Unable to upload documents right now. Please refresh this page.");
      return;
    }

    if (!ACCEPTED_MIME_TYPES.has(file.type)) {
      setError("Accepted formats are PDF, PNG, and JPEG.");
      return;
    }

    const objectName = `${userId}/${docType}/${Date.now()}-${sanitizeFilename(
      file.name
    )}`;

    setUploadingType(docType);

    const { error: storageError } = await supabase.storage
      .from("volunteer-documents")
      .upload(objectName, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (storageError) {
      setError(storageError.message);
      setUploadingType(null);
      return;
    }

    const { data: row, error: insertError } = await supabase
      .from("volunteer_documents")
      .insert({
        user_id: userId,
        user_email: userEmail,
        doc_type: docType,
        title: null,
        file_path: objectName,
        file_name: file.name,
        mime_type: file.type,
        size_bytes: file.size,
      })
      .select(
        "id,user_id,user_email,doc_type,title,file_path,file_name,mime_type,size_bytes,uploaded_at"
      )
      .single();

    if (insertError) {
      await supabase.storage.from("volunteer-documents").remove([objectName]);
      setError(insertError.message);
      setUploadingType(null);
      return;
    }

    setDocuments((prev) => [row as VolunteerDocumentRow, ...prev]);
    setFeedback("Document uploaded.");
    setUploadingType(null);
  };

  const deleteDocument = async (doc: VolunteerDocumentRow) => {
    if (mode !== "volunteer") return;

    setError(null);
    setFeedback(null);
    setDeletingId(doc.id);

    const { error: storageError } = await supabase.storage
      .from("volunteer-documents")
      .remove([doc.file_path]);

    if (storageError) {
      setError(storageError.message);
      setDeletingId(null);
      return;
    }

    const { error: deleteError } = await supabase
      .from("volunteer_documents")
      .delete()
      .eq("id", doc.id);

    if (deleteError) {
      setError(deleteError.message);
      setDeletingId(null);
      return;
    }

    setDocuments((prev) => prev.filter((item) => item.id !== doc.id));
    setFeedback("Document deleted.");
    setDeletingId(null);
  };

  const handleFileChange =
    (docType: VolunteerDocumentType) =>
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = "";
      if (!file) return;
      await uploadDocument(docType, file);
    };

  const renderDocumentList = (docType: VolunteerDocumentType) => {
    const items = documentsByType[docType];
    const hasDocuments = items.length > 0;
    const uploadDisabled = !userId || uploadingType !== null;
    return (
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p
              className={`inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] ${
                hasDocuments ? "text-emerald-200" : "text-white/50"
              }`}
            >
              {hasDocuments && (
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              <span>{DOCUMENT_TYPE_LABEL[docType]}</span>
            </p>
            <p className="mt-1 text-xs text-white/60">
              {DOCUMENT_TYPE_DESCRIPTION[docType]}
            </p>
          </div>
          {mode === "volunteer" && (
            <label
              className={`inline-flex shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/5 p-2 text-white/80 transition ${
                uploadDisabled
                  ? "cursor-not-allowed opacity-50"
                  : "cursor-pointer hover:border-white/40"
              }`}
              title={`Upload ${DOCUMENT_TYPE_LABEL[docType]}`}
              aria-label={`Upload ${DOCUMENT_TYPE_LABEL[docType]}`}
              aria-disabled={uploadDisabled}
            >
              <input
                type="file"
                accept={FILE_INPUT_ACCEPT}
                onChange={handleFileChange(docType)}
                disabled={uploadDisabled}
                className="hidden"
              />
              {uploadingType === docType ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Upload className="h-4 w-4" aria-hidden="true" />
              )}
            </label>
          )}
        </div>

        {items.length === 0 ? (
          <p className="rounded-xl border border-white/10 bg-[#120626]/40 px-4 py-3 text-xs text-white/60">
            No document uploaded yet.
          </p>
        ) : (
          <div className="space-y-2">
            {items.map((doc) => (
              <div
                key={doc.id}
                className="flex flex-col gap-3 rounded-xl border border-white/10 bg-[#120626]/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-emerald-200">
                    {doc.file_name}
                  </p>
                  <p className="mt-1 text-xs text-white/50">
                    {new Date(doc.uploaded_at).toLocaleString("en-CA")} ·{" "}
                    {formatBytes(doc.size_bytes)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openDocument(doc)}
                    className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/80 transition hover:border-white/40"
                  >
                    <Eye className="h-4 w-4" aria-hidden="true" />
                    View
                  </button>
                  {mode === "volunteer" && (
                    <button
                      type="button"
                      onClick={() => deleteDocument(doc)}
                      disabled={deletingId === doc.id}
                      className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/80 transition hover:border-rose-400/60 hover:text-rose-200 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                      {deletingId === doc.id ? "Deleting" : "Delete"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const className = props.className ?? "";
  const containerClasses =
    mode === "manager"
      ? "rounded-xl border border-white/10 bg-white/5 p-4"
      : "rounded-2xl border border-white/10 bg-white/5 p-5";

  return (
    <section
      className={`${containerClasses} ${className}`}
      aria-label="Volunteer documents"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <FileText className="h-4 w-4 text-[#4fa5ff]" aria-hidden="true" />
            Documents
          </div>
        </div>
        {loading && (
          <div className="inline-flex items-center gap-2 text-xs text-white/60">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Loading
          </div>
        )}
      </div>

      {feedback && (
        <p className="mt-3 text-xs font-semibold text-emerald-200">
          {feedback}
        </p>
      )}
      {error && (
        <p className="mt-3 text-xs font-semibold text-rose-200">{error}</p>
      )}

      {mode === "manager" ? (
        <div className="mt-4">
          {documents.length === 0 ? (
            <p className="text-xs text-white/60">No documents uploaded yet.</p>
          ) : (
            <div className="divide-y divide-white/10">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between gap-3 py-2"
                >
                  <div className="min-w-0 flex items-center gap-2">
                    <CheckCircle2
                      className="h-4 w-4 shrink-0 text-emerald-300"
                      aria-hidden="true"
                    />
                    <p
                      className="truncate text-sm text-white/80"
                      title={`${DOCUMENT_TYPE_LABEL[doc.doc_type]}: ${doc.file_name}`}
                    >
                      {DOCUMENT_TYPE_LABEL[doc.doc_type]}: {doc.file_name}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => openDocument(doc)}
                    className="rounded-full border border-white/15 p-2 text-white/70 transition hover:border-white/30 hover:text-white"
                    aria-label={`View ${doc.file_name}`}
                  >
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="mt-5 space-y-5">
          {renderDocumentList("vulnerability_check")}
          {renderDocumentList("id")}
          {renderDocumentList("other")}
        </div>
      )}
    </section>
  );
}
