"use client";

import { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";

type ActiveOrganizationMembership = {
  organizationId: string;
  role: string;
  status: string;
};

type UseActiveOrganizationResult = {
  userId: string | null;
  membership: ActiveOrganizationMembership | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

export default function useActiveOrganization(): UseActiveOrganizationResult {
  const supabase = useSupabaseClient();
  const session = useSession();
  const userId = session?.user?.id ?? null;

  const [membership, setMembership] = useState<ActiveOrganizationMembership | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!userId) {
      setMembership(null);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("organization_memberships")
      .select("organization_id, role, status, created_at")
      .eq("user_id", userId)
      .eq("status", "active")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error) {
      setMembership(null);
      setError(error.message);
      setLoading(false);
      return;
    }

    const row = (data ?? null) as Record<string, unknown> | null;
    if (!row || typeof row.organization_id !== "string") {
      setMembership(null);
      setLoading(false);
      return;
    }

    setMembership({
      organizationId: row.organization_id,
      role: typeof row.role === "string" ? row.role : "viewer",
      status: typeof row.status === "string" ? row.status : "active",
    });
    setLoading(false);
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return {
    userId,
    membership,
    loading,
    error,
    refresh: load,
  };
}
