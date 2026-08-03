import { createFileRoute, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

function AuthenticatedLayout() {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check session on mount
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        navigate({ to: "/login", replace: true });
      } else {
        setIsChecking(false);
      }
    });

    // Listen to auth changes (e.g., logout in another tab)
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        navigate({ to: "/login", replace: true });
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-muted-foreground">
        Memverifikasi sesi...
      </div>
    );
  }

  return <Outlet />;
}

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async () => {
    // Skip auth check during SSR — localStorage is unavailable server-side,
    // which would always trigger a false redirect even when the user is logged in.
    // All actual data endpoints are protected by requireSupabaseAuth middleware.
    if (typeof window === "undefined") return;

    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      throw redirect({ to: "/login" });
    }
  },
  component: AuthenticatedLayout,
});