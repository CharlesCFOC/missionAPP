"use client";

import { ChangeEvent, useMemo, useState } from "react";
import { motion } from "framer-motion";

type VerificationStatus = "pending" | "verified" | "rejected";

export default function AccountVerification() {
  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [citizenship, setCitizenship] = useState("");
  const [organizationNumber, setOrganizationNumber] = useState("");
  const [files, setFiles] = useState<string[]>([]);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>("pending");

  const statusStyle = useMemo(() => {
    if (verificationStatus === "verified") return "bg-green-400/20 text-green-100 border-green-400/40";
    if (verificationStatus === "rejected") return "bg-red-400/20 text-red-100 border-red-400/40";
    return "bg-amber-300/15 text-amber-100 border-amber-300/40";
  }, [verificationStatus]);

  const handleFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const nextFiles = Array.from(event.target.files || []).map((file) => file.name);
    setFiles((prev) => [...prev, ...nextFiles]);
  };

  return (
    <motion.div
      className="rounded-2xl border border-white/15 bg-white/10 p-6 shadow-lg"
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-white/60">Verification</p>
          <h3 className="text-xl font-semibold text-[#ff9c4b]">Account verification</h3>
          <p className="mt-1 text-sm text-white/70">Upload identity and organization documents to keep your account trusted.</p>
        </div>
        <div className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusStyle}`}>
          {verificationStatus === "pending" ? "Pending review" : verificationStatus === "verified" ? "Verified" : "Rejected"}
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm text-white/80">
          <span>Full legal name</span>
          <input
            type="text"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white placeholder-white/40 focus:border-[#ff9c4b] focus:outline-none"
            placeholder="First Last"
          />
        </label>
        <label className="space-y-2 text-sm text-white/80">
          <span>Birth date</span>
          <input
            type="date"
            value={birthDate}
            onChange={(event) => setBirthDate(event.target.value)}
            className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white placeholder-white/40 focus:border-[#ff9c4b] focus:outline-none"
          />
        </label>
        <label className="space-y-2 text-sm text-white/80">
          <span>Country of citizenship</span>
          <input
            type="text"
            value={citizenship}
            onChange={(event) => setCitizenship(event.target.value)}
            className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white placeholder-white/40 focus:border-[#ff9c4b] focus:outline-none"
            placeholder="France, Canada…"
          />
        </label>
        <label className="space-y-2 text-sm text-white/80">
          <span>Organization number (optional)</span>
          <input
            type="text"
            value={organizationNumber}
            onChange={(event) => setOrganizationNumber(event.target.value)}
            className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white placeholder-white/40 focus:border-[#ff9c4b] focus:outline-none"
            placeholder="Registry / EIN"
          />
        </label>
      </div>

      <div className="mt-5 space-y-3">
        <p className="text-sm text-white/80">Upload documents (Photo ID, Proof of address, Organization docs)</p>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-white/20 bg-white/5 px-4 py-3 text-sm text-white/80 hover:border-[#ff9c4b]">
          <input type="file" multiple className="hidden" onChange={handleFiles} />
          <span className="rounded-lg bg-[#ff9c4b] px-3 py-1 text-xs font-semibold text-[#080313]">Upload</span>
          <span>Drag & drop or browse files (PNG, JPG, PDF)</span>
        </label>
        {files.length > 0 && (
          <div className="space-y-2 rounded-xl border border-white/15 bg-white/5 p-4 text-sm text-white/80">
            {files.map((file, index) => (
              <div key={`${file}-${index}`} className="flex items-center justify-between">
                <span>{file}</span>
                <span className="text-xs text-white/60">Ready to submit</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-white/70">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="verification-status"
            value="pending"
            checked={verificationStatus === "pending"}
            onChange={() => setVerificationStatus("pending")}
            className="h-4 w-4 accent-[#ff9c4b]"
          />
          <span>Pending</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="verification-status"
            value="verified"
            checked={verificationStatus === "verified"}
            onChange={() => setVerificationStatus("verified")}
            className="h-4 w-4 accent-[#ff9c4b]"
          />
          <span>Verified</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="verification-status"
            value="rejected"
            checked={verificationStatus === "rejected"}
            onChange={() => setVerificationStatus("rejected")}
            className="h-4 w-4 accent-[#ff9c4b]"
          />
          <span>Rejected</span>
        </label>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs">Manual review ETA: 24h</span>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-xs text-white/50">Your documents are encrypted at rest. Only authorized reviewers can access them.</p>
        <button
          type="button"
          className="rounded-xl bg-[#ff9c4b] px-5 py-2 text-sm font-semibold text-[#080313] transition hover:bg-[#ffb877]"
        >
          Save
        </button>
      </div>
    </motion.div>
  );
}
