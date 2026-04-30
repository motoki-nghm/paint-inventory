import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container } from "@/components/layout/container";
import { Card, CardContent } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

type Status = "checking" | "ok" | "error";

export function AuthCallbackPage() {
  const nav = useNavigate();
  const [status, setStatus] = useState<Status>("checking");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const url = new URL(window.location.href);

        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session?.user) {
          if (cancelled) return;
          setStatus("ok");
          setMsg(`ログイン中：${sessionData.session.user.email ?? sessionData.session.user.id}`);
          nav("/", { replace: true });
          return;
        }

        const err = url.searchParams.get("error");
        const errDesc = url.searchParams.get("error_description");
        if (err || errDesc) {
          if (cancelled) return;
          setStatus("error");
          setMsg(decodeURIComponent(errDesc || err || "ログインに失敗しました"));
          return;
        }

        const code = url.searchParams.get("code");
        if (!code) {
          if (cancelled) return;
          setStatus("error");
          setMsg("認証コードが見つかりませんでした。もう一度ログインをやり直してください。");
          return;
        }

        const { data, error } = await supabase.auth.exchangeCodeForSession(
          window.location.href,
        );
        if (error) throw error;

        try {
          window.history.replaceState({}, "", "/auth/callback");
        } catch {
          // ignore
        }

        if (cancelled) return;
        setStatus("ok");
        setMsg(`ログインしました：${data?.session?.user?.email ?? "OK"}`);
        nav("/", { replace: true });
      } catch (e) {
        try {
          const { data } = await supabase.auth.getSession();
          if (data?.session?.user) {
            if (cancelled) return;
            setStatus("ok");
            setMsg(`ログイン中：${data.session.user.email ?? data.session.user.id}`);
            nav("/", { replace: true });
            return;
          }
        } catch {
          // ignore
        }
        if (cancelled) return;
        setStatus("error");
        setMsg(e instanceof Error ? e.message : "ログインに失敗しました");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [nav]);

  return (
    <Container className="space-y-3 py-8">
      <Card>
        <CardContent className="space-y-3 p-4">
          <div className="text-base font-semibold">認証処理中</div>
          {status === "checking" ? (
            <Alert>ログインを確認しています…</Alert>
          ) : status === "ok" ? (
            <Alert variant="success">{msg}</Alert>
          ) : (
            <Alert variant="danger">{msg}</Alert>
          )}
          <div className="flex gap-2">
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => nav("/login", { replace: true })}
            >
              ログインへ
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
