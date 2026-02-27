"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useSession } from "@supabase/auth-helpers-react";
import { Loader2 } from "lucide-react";

type AuthGuardProps = {
  children: ReactNode;
};

const DEMO_AUTH_KEY = "cfoc-demo-auth";

const readDemoAuthFlag = () => {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(DEMO_AUTH_KEY) === "1";
};

export default function AuthGuard({ children }: AuthGuardProps) {
  const session = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [demoAuthed, setDemoAuthed] = useState(() => readDemoAuthFlag());

  const nextPath = useMemo(() => {
    const query = searchParams?.toString() ?? "";
    return query ? `${pathname}?${query}` : pathname;
  }, [pathname, searchParams]);

  useEffect(() => {
    setDemoAuthed(readDemoAuthFlag());
  }, [pathname]);

  useEffect(() => {
    if (session === undefined) return;
    if (!session && !demoAuthed) {
      const nextParam = encodeURIComponent(nextPath);
      router.replace(`/auth/login?next=${nextParam}`);
    }
  }, [demoAuthed, nextPath, router, session]);

  if (session === undefined) {
    return (
      <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-4">
        <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Loading…
        </div>
      </div>
    );
  }

  if (!session && !demoAuthed) {
    return (
      <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-4">
        <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Redirecting…
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
