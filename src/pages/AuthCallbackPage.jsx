import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Container from "@/components/layout/Container";
import { Card, CardContent } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const nav = useNavigate();
  const [msg, setMsg] = useState("ログイン処理中…");

  useEffect(() => {
    (async () => {
      try {
        if (!supabase) {
          setMsg("Supabase が未設定です（環境変数を確認してください）");
          return;
        }

        const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
        if (error) throw error;

        setMsg("ログイン完了！設定画面へ移動します…");
        setTimeout(() => nav("/settings", { replace: true }), 300);
      } catch (e) {
        console.error(e);
        setMsg("ログインに失敗しました。もう一度お試しください。");
      }
    })();
  }, [nav]);

  return (
    <Container className="py-3">
      <Card>
        <CardContent className="p-4 space-y-2">
          <div className="text-lg font-semibold">認証</div>
          <Alert>{msg}</Alert>
        </CardContent>
      </Card>
    </Container>
  );
}
