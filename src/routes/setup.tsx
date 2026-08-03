import { createFileRoute, useNavigate, Link, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { checkNeedsSetup, setupSuperAdmin } from "@/lib/public.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/setup")({
  head: () => ({ meta: [{ title: "Setup Superadmin" }] }),
  beforeLoad: async () => {
    // Only accessible if no users exist in the database
    const result = await checkNeedsSetup();
    if (!result.needsSetup) {
      throw redirect({ to: "/login" });
    }
  },
  component: SetupPage,
});

function SetupPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Password dan konfirmasi password tidak cocok.");
      return;
    }

    setLoading(true);

    try {
      const result = await setupSuperAdmin({ data: { username, password } });

      if (result.success) {
        // Auto-login after creating the account
        const email = result.email;
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) {
          setError("Akun berhasil dibuat, tetapi login otomatis gagal. Silakan login manual.");
          navigate({ to: "/login" });
          return;
        }
        navigate({ to: "/admin" });
      }
    } catch (err: any) {
      setError(err?.message ?? "Terjadi kesalahan tidak terduga.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm border border-border bg-card p-8 space-y-5">
        <div>
          <Link to="/" className="text-xs uppercase tracking-widest text-primary">← Beranda</Link>
          <div className="flex items-center gap-2 mt-2">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-xs uppercase tracking-widest text-amber-600 font-medium">Pertama Kali Setup</span>
          </div>
          <h1 className="font-display text-2xl uppercase mt-1">Buat Akun Superadmin</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Belum ada akun admin. Buat akun superadmin pertama Anda.
          </p>
        </div>

        {error && (
          <div className="text-sm text-destructive border border-destructive/30 bg-destructive/10 px-3 py-2 rounded">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="setup-username">Username</Label>
          <Input
            id="setup-username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Contoh: reza"
            minLength={3}
            required
          />
          <p className="text-xs text-muted-foreground">Hanya huruf, angka, dan underscore (_).</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="setup-password">Password</Label>
          <Input
            id="setup-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimal 8 karakter"
            minLength={8}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="setup-confirm-password">Konfirmasi Password</Label>
          <Input
            id="setup-confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Ulangi password"
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Membuat akun..." : "Buat Akun & Masuk"}
        </Button>


      </form>
    </div>
  );
}
