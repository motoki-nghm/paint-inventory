import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Mail } from "lucide-react";
import { useAuth } from "@/lib/AuthProvider";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function GoogleIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

export default function LoginPage() {
  const { user, initialized } = useAuth();
  const [stage, setStage] = useState("email"); // "email" | "verify"
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [info, setInfo] = useState("");
  const [error, setError] = useState("");

  if (initialized && user) {
    return <Navigate to="/" replace />;
  }

  async function signInWithGoogle() {
    setGoogleLoading(true);
    setError("");
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (err) {
      setError(err.message);
      setGoogleLoading(false);
    }
    // 成功時はGoogleのページにリダイレクトされるため、ここには戻らない
  }

  async function sendOtp(e) {
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

  async function verifyOtp(e) {
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
    // AuthProvider updates user state → Navigate fires automatically
  }

  return (
    <div className="min-h-screen grid place-items-center p-6 bg-background">
      <div className="w-full max-w-sm">
        <div className="bg-card rounded-2xl p-6 space-y-6 border border-border">
          <div className="text-center space-y-1">
            <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center mx-auto mb-3">
              <span className="text-xl font-bold text-primary">P</span>
            </div>
            <div className="text-xl font-bold text-foreground">Paint Inventory</div>
            <div className="text-xs text-muted-foreground">ログイン</div>
          </div>

          {stage === "email" && (
            <>
              <Button
                type="button"
                variant="outline"
                className="w-full gap-2"
                onClick={signInWithGoogle}
                disabled={googleLoading || loading}
              >
                <GoogleIcon />
                {googleLoading ? "リダイレクト中…" : "Googleでログイン"}
              </Button>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">または</span>
                <div className="flex-1 h-px bg-border" />
              </div>
            </>
          )}

          {info && (
            <div className="text-sm text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-lg p-3">
              {info}
            </div>
          )}
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              {error}
            </div>
          )}

          {stage === "email" ? (
            <form onSubmit={sendOtp} className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground block mb-1">メールアドレス</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="you@example.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "送信中…" : "認証コードを送信"}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                初回ログインで自動的にアカウントが作成されます。
              </p>
            </form>
          ) : (
            <form onSubmit={verifyOtp} className="space-y-4">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{email}</span>{" "}
                に送信した6桁コードを入力してください。
              </p>
              <Input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                className="text-center text-2xl tracking-[0.5em] font-mono"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="------"
              />
              <Button type="submit" className="w-full" disabled={loading}>
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
                className="text-xs text-muted-foreground underline block mx-auto"
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
