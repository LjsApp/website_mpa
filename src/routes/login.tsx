import { createFileRoute, useNavigate, Link, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { checkNeedsSetup } from "@/lib/public.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Login Admin" }] }),
  beforeLoad: async () => {
    // If database is completely empty, force redirect to setup page
    const result = await checkNeedsSetup();
    if (result.needsSetup) {
      throw redirect({ to: "/setup" });
    }
  },
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Convert username to internal email format
    const email = username.includes("@") ? username : `${username}@indotek.local`;

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      setError("Username atau password salah.");
      return;
    }
    navigate({ to: "/admin" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm border border-border bg-card p-8 space-y-5">
        <div>
          <Link to="/" className="text-xs uppercase tracking-widest text-primary">← Beranda</Link>
          <h1 className="font-display text-2xl uppercase mt-2">Admin Login</h1>
          <p className="text-sm text-muted-foreground mt-1">Masuk ke panel admin</p>
        </div>

        {error && (
          <div className="text-sm text-destructive border border-destructive/30 bg-destructive/10 px-3 py-2">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="u">Username</Label>
          <Input
            id="u"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Masukkan username"
            autoComplete="username"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="p">Password</Label>
          <Input
            id="p"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Masukkan password"
            autoComplete="current-password"
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Memproses..." : "Login"}
        </Button>


      </form>
    </div>
  );
}