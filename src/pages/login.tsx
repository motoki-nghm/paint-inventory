import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Boxes, Mail } from "lucide-react";
import { useAuth } from "@/stores/auth-context";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

export function LoginPage() {
  const { user, initialized } = useAuth();
  const [stage, setStage] = useState<"email" | "verify">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [info, setInfo] = useState("");
  const [error, setError] = useState("");

  if (initialized && user) return <Navigate to="/" replace />;

  async function signInWithGoogle() {
    setError("");
    setGoogleLoading(true);
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (err) {
      setError(err.message);
      setGoogleLoading(false);
    }
  }

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: true },
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    setInfo("認証コードを送信しました。メールをご確認ください。");
    setStage("verify");
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    if (code.length !== 6) {
      setError("6桁の認証コードを入力してください");
      return;
    }
    setLoading(true);
    setError("");
    const { error: err } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: code,
      type: "email",
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    // AuthProvider will switch route to /
  }

  return (
    <div className="grid min-h-dvh place-items-center bg-background p-6">
      <div className="w-full max-w-sm">
        <div className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-xl">
          <div className="space-y-2 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-primary/15 ring-1 ring-primary/30">
              <Boxes className="h-6 w-6 text-primary" aria-hidden />
            </div>
            <div className="text-xl font-bold tracking-tight">Paint Inventory</div>
            <div className="text-xs text-muted-foreground">塗料・資材を手元で管理</div>
          </div>

          {stage === "email" ? (
            <>
              <Button
                type="button"
                variant="secondary"
                size="lg"
                className="w-full"
                onClick={signInWithGoogle}
                disabled={googleLoading || loading}
              >
                <GoogleIcon />
                {googleLoading ? "リダイレクト中…" : "Google で続ける"}
              </Button>
              <div className="flex items-center gap-3 text-[11px] uppercase tracking-wider text-muted-foreground">
                <div className="h-px flex-1 bg-border" />
                <span>または</span>
                <div className="h-px flex-1 bg-border" />
              </div>
            </>
          ) : null}

          {info ? <Alert variant="success">{info}</Alert> : null}
          {error ? <Alert variant="danger">{error}</Alert> : null}

          {stage === "email" ? (
            <form onSubmit={sendOtp} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">メールアドレス</Label>
                <div className="relative">
                  <Mail
                    aria-hidden
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    enterKeyHint="send"
                    inputMode="email"
                    required
                    placeholder="you@example.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? "送信中…" : "認証コードを送信"}
              </Button>
              <p className="text-center text-[11px] text-muted-foreground">
                初回ログインで自動的にアカウントが作成されます。
              </p>
            </form>
          ) : (
            <form onSubmit={verifyOtp} className="space-y-4">
              <p className="text-sm text-muted-foreground">
                <strong className="font-medium text-foreground">{email}</strong> に送信した
                6 桁コードを入力してください。
              </p>
              <Input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                className="text-center font-mono text-2xl tracking-[0.5em]"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="------"
              />
              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? "確認中…" : "ログイン"}
              </Button>
              <button
                type="button"
                onClick={() => {
                  setStage("email");
                  setCode("");
                  setError("");
                  setInfo("");
                }}
                className="mx-auto block text-[11px] text-muted-foreground underline"
              >
                メールアドレスを入れ直す
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
