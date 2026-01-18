import { useMemo, useState } from "react";
import Container from "@/components/layout/Container";
import { usePaints } from "@/lib/PaintsProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { safeJsonParse } from "@/lib/utils";
import { clearAll } from "@/lib/storage";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/lib/supabase";
import { useSupabaseAuth } from "@/lib/auth";

export default function SettingsPage() {
  const { paints, replaceAll } = usePaints();
  const [msg, setMsg] = useState("");
  const [email, setEmail] = useState("");

  const auth = useSupabaseAuth();
  const user = auth.user;
  const supabaseEnabled = auth.enabled;

  const exportJson = useMemo(() => JSON.stringify({ paints }, null, 2), [paints]);

  return (
    <Container className="space-y-3">
      {msg ? <Alert>{msg}</Alert> : null}

      {/* ✅ Supabaseログイン（最小） */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="text-lg font-semibold">ログイン（任意）</div>
          <div className="text-sm text-muted-foreground">
            ログインすると、端末が変わってもデータを保持できます（Supabase）。
          </div>

          {!supabaseEnabled ? (
            <Alert variant="danger">
              Supabase が未設定です。
              <br />
              <code>VITE_SUPABASE_URL</code> / <code>VITE_SUPABASE_ANON_KEY</code> を設定してください。
            </Alert>
          ) : auth.loading ? (
            <div className="text-sm text-muted-foreground">ログイン状態を確認中…</div>
          ) : user ? (
            <div className="space-y-3">
              <div className="text-sm">
                ログイン中：
                <span className="ml-1 font-semibold">{user.email}</span>
              </div>

              <Button
                variant="secondary"
                className="w-full"
                onClick={async () => {
                  try {
                    await supabase.auth.signOut();
                    setMsg("ログアウトしました。");
                  } catch (e) {
                    console.error(e);
                    setMsg("ログアウトに失敗しました。");
                  }
                }}
              >
                ログアウト
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Googleログイン */}
              <Button
                className="w-full"
                onClick={async () => {
                  try {
                    setMsg("");
                    const redirectBase = import.meta.env.VITE_SITE_URL || window.location.origin;

                    const { error } = await supabase.auth.signInWithOAuth({
                      provider: "google",
                      options: {
                        redirectTo: `${redirectBase}/auth/callback`,
                      },
                    });

                    if (error) throw error;
                  } catch (e) {
                    console.error(e);
                    setMsg("Googleログインに失敗しました。設定を確認してください。");
                  }
                }}
              >
                Googleでログイン
              </Button>

              <div className="text-xs text-muted-foreground text-center">または</div>

              {/* メール（OTP / Magic Link） */}
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                inputMode="email"
                autoComplete="email"
              />

              <Button
                variant="secondary"
                className="w-full"
                onClick={async () => {
                  try {
                    setMsg("");
                    if (!email.trim()) {
                      setMsg("メールアドレスを入力してください。");
                      return;
                    }

                    const redirectBase = import.meta.env.VITE_SITE_URL || window.location.origin;

                    const { error } = await supabase.auth.signInWithOtp({
                      email: email.trim(),
                      options: {
                        emailRedirectTo: `${redirectBase}/auth/callback`,
                      },
                    });

                    if (error) throw error;
                    setMsg("ログインリンクを送信しました。メールをご確認ください。");
                  } catch (e) {
                    console.error(e);
                    setMsg("ログインリンクの送信に失敗しました。");
                  }
                }}
              >
                メールでログイン
              </Button>

              <div className="text-xs text-muted-foreground">
                ※ 迷惑メールに入ることがあります。リンクを開くとこのアプリに戻りログインが完了します。
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-2">
          <div className="text-lg font-semibold">設定</div>
          <div className="text-sm text-muted-foreground">JSON インポート/エクスポート、全消去</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="font-semibold">エクスポート（JSON）</div>
          <div className="text-sm text-muted-foreground">以下をコピーして保存できます。</div>
          <textarea
            className="w-full h-44 rounded-lg border border-border bg-[rgb(var(--bg))] p-3 text-xs"
            readOnly
            value={exportJson}
          />
          <Button
            onClick={async () => {
              await navigator.clipboard.writeText(exportJson);
              setMsg("クリップボードにコピーしました。");
            }}
          >
            コピー
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="font-semibold">インポート（JSON）</div>
          <div className="text-sm text-muted-foreground">{`{ "paints": [...] }`} 形式のJSONを貼り付けてください。</div>
          <ImportBox
            onImport={(text) => {
              const parsed = safeJsonParse(text);
              if (!parsed.ok) {
                setMsg(`JSONが不正です: ${parsed.error}`);
                return;
              }
              if (!Array.isArray(parsed.value?.paints)) {
                setMsg("JSON形式が不正です: paints が配列ではありません。");
                return;
              }
              replaceAll(parsed.value.paints);
              setMsg(`インポートしました（${parsed.value.paints.length}件）`);
            }}
          />
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="font-semibold text-[rgb(var(--danger))]">危険：データ全消去</div>
          <div className="text-sm text-muted-foreground">IndexedDB 内の保存データを削除します。</div>
          <Button
            variant="danger"
            onClick={async () => {
              const ok = confirm("全データを削除しますか？（元に戻せません）");
              if (!ok) return;
              await clearAll();
              replaceAll([]);
              setMsg("全データを削除しました。");
            }}
          >
            全消去
          </Button>
        </CardContent>
      </Card>
    </Container>
  );
}

function ImportBox({ onImport }) {
  const [text, setText] = useState("");
  return (
    <div className="space-y-2">
      <textarea
        className="w-full h-44 rounded-lg border border-border bg-[rgb(var(--bg))] p-3 text-xs"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder='{"paints":[...]}'
      />
      <Button onClick={() => onImport(text)}>インポート</Button>
    </div>
  );
}
