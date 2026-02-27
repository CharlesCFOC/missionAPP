"use client";

import Link from "next/link";
import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import AuthCard from "@/components/auth/AuthCard";

const DEMO_AUTH_KEY = "cfoc-demo-auth";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const session = useSession();
  const supabase = useSupabaseClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
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
    setLoading(true);

    const normalizedEmail = email.trim();
    const { error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (typeof window !== "undefined") {
      window.localStorage.removeItem(DEMO_AUTH_KEY);
    }

    router.replace(nextPath ?? "/settings?tab=profile");
    setLoading(false);
  };

  return (
    <AuthCard
      eyebrow="Account"
      title="Sign in"
      description="Sign in with your email and password."
      footer={
        <div className="flex flex-col gap-2 text-center">
          <p>
            Don&apos;t have an account?{" "}
            <Link href="/auth/register" className="text-[#ff9c4b] hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      }
    >
      {error && (
        <div className="mb-4 rounded-lg border border-rose-400/40 bg-rose-500/10 px-4 py-2 text-sm text-rose-100">
          {error}
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
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
            Password
          </label>
          <input
            type="password"
            className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-[#ff9c4b] focus:outline-none"
            placeholder="••••••••"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            autoComplete="current-password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center rounded-lg bg-[#271c70] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#ff9c4b] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </AuthCard>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  );
}
