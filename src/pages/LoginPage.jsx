import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Mail } from "lucide-react";
import { useAuth } from "@/lib/AuthProvider";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const { user, initialized } = useAuth();
  const [stage, setStage] = useState("email"); // "email" | "verify"
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState("");
  const [error, setError] = useState("");

  if (initialized && user) {
    return <Navigate to="/" replace />;
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
            <div className="text-xs text-muted-foreground">メールアドレスでログイン</div>
          </div>

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
