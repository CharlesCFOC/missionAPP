"use client";

import Link from "next/link";
import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import AuthCard from "@/components/auth/AuthCard";

function ForgotPasswordPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const session = useSession();
  const supabase = useSupabaseClient();

  const [email, setEmail] = useState("");
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

    setLoading(true);

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin ?? "";

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/auth/reset/confirm`,
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess("Lien envoyé. Vérifie tes emails.");
      setEmail("");
    }

    setLoading(false);
  };

  return (
    <AuthCard
      eyebrow="Compte"
      title="Mot de passe oublié"
      description="Entre ton email et on t’envoie un lien de réinitialisation."
      footer={
        <div className="flex flex-col gap-2 text-center">
          <Link href="/auth/login" className="text-[#ff9c4b] hover:underline">
            Retour à la connexion
          </Link>
          <Link href="/auth/register" className="text-[#ff9c4b] hover:underline">
            Créer un compte
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

        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center rounded-lg bg-[#271c70] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#ff9c4b] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Envoi…" : "Envoyer le lien"}
        </button>
      </form>
    </AuthCard>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ForgotPasswordPageContent />
    </Suspense>
  );
}
