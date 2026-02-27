"use client";

import { FormEvent, useEffect, useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import AuthCard from "@/components/auth/AuthCard";

export default function ResetPasswordPage() {
  const supabase = useSupabaseClient();
  const params = useParams<{ token?: string | string[] }>();
  const token =
    typeof params?.token === "string"
      ? params.token
      : Array.isArray(params?.token)
      ? params.token[0] ?? ""
      : "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleRecovery = async () => {
      if (typeof window === "undefined") return;

      if (window.location.hash.includes("access_token")) {
        const hashParams = new URLSearchParams(window.location.hash.slice(1));
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error) setError(error.message);
        }
      } else if (token && token !== "confirm") {
        const { error } = await supabase.auth.exchangeCodeForSession(token);
        if (error) setError(error.message);
      }
    };

    handleRecovery();
  }, [token, supabase]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
    } else {
      setSuccess("Mot de passe mis à jour.");
      setPassword("");
      setConfirmPassword("");
    }

    setLoading(false);
  };

  return (
    <AuthCard
      eyebrow="Compte"
      title="Nouveau mot de passe"
      description="Choisis un mot de passe fort pour sécuriser ton compte."
      footer={
        <div className="text-center">
          <Link href="/auth/login" className="text-[#ff9c4b] hover:underline">
            Retour à la connexion
          </Link>
        </div>
      }
    >
      {error && (
        <div className="mb-4 rounded-lg border border-rose-400/40 bg-rose-500/10 px-4 py-2 text-sm text-rose-100">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-lg border border-emerald-300/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-100">
          {success}
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
            Mot de passe
          </label>
          <input
            type="password"
            className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-[#ff9c4b] focus:outline-none"
            placeholder="••••••••"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            autoComplete="new-password"
            minLength={8}
          />
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
            Confirmer
          </label>
          <input
            type="password"
            className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-[#ff9c4b] focus:outline-none"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
            autoComplete="new-password"
            minLength={8}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center rounded-lg bg-[#271c70] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#ff9c4b] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Mise à jour…" : "Mettre à jour"}
        </button>
      </form>
    </AuthCard>
  );
}
