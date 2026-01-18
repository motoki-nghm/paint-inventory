import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Container from "@/components/layout/Container";
import { Card, CardContent } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const nav = useNavigate();
  const [status, setStatus] = useState("checking"); // checking | ok | error
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!supabase) {
      setStatus("error");
      setMsg("Supabase が未設定です（環境変数を確認してください）。");
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const url = new URL(window.location.href);

        // 1) まず「既にログイン済み」なら交換不要（ここが重要）
        const { data: sessionData } = await supabase.auth.getSession();
        const existingUser = sessionData?.session?.user;
        if (existingUser) {
          if (!cancelled) {
            setStatus("ok");
            setMsg(`ログイン中：${existingUser.email ?? existingUser.id}`);
            nav("/settings", { replace: true });
          }
          return;
        }

        // 2) Supabase/Google側のエラーがURLに付いてる場合
        const err = url.searchParams.get("error");
        const errDesc = url.searchParams.get("error_description");
        if (err || errDesc) {
          if (!cancelled) {
            setStatus("error");
            setMsg(decodeURIComponent(errDesc || err || "ログインに失敗しました。"));
          }
          return;
        }

        // 3) PKCEの code がある時だけ exchange（ないなら叩かない）
        const code = url.searchParams.get("code");
        if (!code) {
          if (!cancelled) {
            setStatus("error");
            setMsg("認証コードが見つかりませんでした。もう一度ログインをやり直してください。");
          }
          return;
        }

        const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.href);
        if (error) throw error;

        // URLの code を消してスッキリ（任意）
        try {
          window.history.replaceState({}, "", "/auth/callback");
        } catch {}

        if (!cancelled) {
          setStatus("ok");
          setMsg(`ログインしました：${data?.session?.user?.email ?? "OK"}`);
          nav("/settings", { replace: true });
        }
      } catch (e) {
        console.error(e);

        // 4) ここでも「実はセッションある」パターンを救済
        try {
          const { data: sessionData2 } = await supabase.auth.getSession();
          if (sessionData2?.session?.user) {
            if (!cancelled) {
              setStatus("ok");
              setMsg(`ログイン中：${sessionData2.session.user.email ?? sessionData2.session.user.id}`);
              nav("/settings", { replace: true });
            }
            return;
          }
        } catch {}

        if (!cancelled) {
          setStatus("error");
          setMsg(e?.message || "ログインに失敗しました。");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [nav]);

  return (
    <Container className="py-4 space-y-3">
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="text-lg font-semibold">認証</div>

          {status === "checking" ? (
            <Alert>ログイン処理中です…</Alert>
          ) : status === "ok" ? (
            <Alert>{msg || "ログインしました。設定へ移動します…"}</Alert>
          ) : (
            <Alert variant="danger">{msg || "ログインに失敗しました。"}</Alert>
          )}

          <div className="flex gap-2">
            <Button variant="secondary" className="w-full" onClick={() => nav("/settings", { replace: true })}>
              設定へ
            </Button>
            <Button className="w-full" onClick={() => nav("/", { replace: true })}>
              一覧へ
            </Button>
          </div>
        </CardContent>
      </Card>
    </Container>
  );
}
