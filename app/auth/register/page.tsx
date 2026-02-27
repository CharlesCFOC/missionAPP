"use client";

import Link from "next/link";
import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import AuthCard from "@/components/auth/AuthCard";

function RegisterPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const session = useSession();
  const supabase = useSupabaseClient();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const nextPath = useMemo(() => {
    const raw = searchParams.get("next") ?? "";
    return raw.startsWith("/") ? raw : null;
  }, [searchParams]);

  useEffect(() => {
    if (!session) return;
    router.replace(nextPath ?? "/settings?tab=profile");
  }, [nextPath, router, session]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);

    const normalizedName = fullName.trim();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: normalizedName ? { full_name: normalizedName } : {} },
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess("Vérifie ton email pour confirmer ton compte.");
      setFullName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    }

    setLoading(false);
  };

  return (
    <AuthCard
      eyebrow="Compte"
      title="Créer un compte"
      description="Crée ton accès et complète ton profil ensuite."
      footer={
        <div className="text-center">
          Déjà un compte ?{" "}
          <Link href="/auth/login" className="text-[#ff9c4b] hover:underline">
            Se connecter
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
            Nom complet (optionnel)
          </label>
          <input
            type="text"
            className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-[#ff9c4b] focus:outline-none"
            placeholder="Jane Doe"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            autoComplete="name"
          />
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
            Email
          </label>
          <input
            type="email"
            className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-[#ff9c4b] focus:outline-none"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoComplete="email"
          />
        </div>

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
          <p className="mt-2 text-xs text-white/50">Minimum 8 caractères.</p>
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
          {loading ? "Création…" : "Créer mon compte"}
        </button>
      </form>
    </AuthCard>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterPageContent />
    </Suspense>
  );
}
