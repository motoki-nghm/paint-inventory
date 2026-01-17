import { Link, useLocation } from "react-router-dom";
import Container from "./Container.jsx";
import { Button } from "@/components/ui/button";
import { Settings, Sun, Moon, Home, Plus, ScanLine } from "lucide-react";
import { useEffect, useState } from "react";
import { useSupabaseAuth } from "@/lib/auth.js";
import { supabase } from "@/lib/supabase.js";
import { usePaints } from "@/lib/PaintsProvider.jsx";

function getInitialTheme() {
  const stored = localStorage.getItem("theme");
  if (stored === "dark" || stored === "light") return stored;
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export default function Header() {
  const loc = useLocation();
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const auth = useSupabaseAuth();
  const { paints } = usePaints();

  async function syncNow() {
    if (!auth.user) return;

    try {
      const payload = paints.map((p) => ({
        ...p,
        user_id: auth.user.id,
      }));

      const { error } = await supabase.from("paints").upsert(payload, { onConflict: "id" });

      if (error) throw error;

      alert("クラウドに同期しました");
    } catch (e) {
      console.error(e);
      alert("同期に失敗しました");
    }
  }

  const statusText = auth.loading ? "確認中" : auth.loggedIn ? "ログイン中" : "未ログイン";
  const statusSub = auth.loading ? "接続確認…" : auth.loggedIn ? "クラウド同期可" : "ローカルのみ";

  const statusClass = auth.loading
    ? "border-amber-400/40 bg-amber-400/10 text-amber-300"
    : auth.loggedIn
    ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
    : "border-rose-400/40 bg-rose-400/10 text-rose-300";

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur">
      <Container className="py-3 px-2">
        {/* 上段 */}
        <div className="flex items-start justify-between gap-2">
          <Link to="/" className="flex items-center gap-2 min-w-0">
            <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
              <span className="text-sm font-bold">P</span>
            </div>
            <div className="leading-tight min-w-0">
              <div className="text-sm font-semibold truncate">Paint Inventory</div>
              <div className="text-xs text-muted-foreground truncate">{statusSub}</div>
            </div>
          </Link>

          {/* 右上：全部ここに集約 */}
          <div className="flex items-center gap-2 shrink-0">
            {/* 同期ボタン（ログイン中のみ） */}
            {auth.loggedIn ? (
              <Button size="sm" variant="secondary" onClick={syncNow} className="text-xs h-8">
                同期
              </Button>
            ) : null}

            {/* ログイン状態バッジ（Settingsへ） */}
            <Link to="/settings" className="block">
              <div className={`rounded-full px-2 py-1 text-xs border ${statusClass}`} title={auth.user?.email || ""}>
                {statusText}
              </div>
            </Link>

            {/* テーマ切り替え */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
              className="h-8 w-8 px-0"
              title="テーマ切り替え"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            {/* 設定 */}
            <Link to="/settings">
              <Button variant="ghost" size="icon" className="h-8 w-8 px-0" title="設定">
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* 下段ナビ */}
        <div className="mt-3 grid grid-cols-3 gap-2">
          <Link to="/">
            <Button variant={loc.pathname === "/" ? "default" : "secondary"} className="w-full justify-center gap-2">
              <Home className="h-4 w-4" />
              一覧
            </Button>
          </Link>
          <Link to="/add">
            <Button variant={loc.pathname === "/add" ? "default" : "secondary"} className="w-full justify-center gap-2">
              <Plus className="h-4 w-4" />
              追加
            </Button>
          </Link>
          <Link to="/scan">
            <Button
              variant={loc.pathname === "/scan" ? "default" : "secondary"}
              className="w-full justify-center gap-2"
            >
              <ScanLine className="h-4 w-4" />
              スキャン
            </Button>
          </Link>
        </div>
      </Container>
    </header>
  );
}
