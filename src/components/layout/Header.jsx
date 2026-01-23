import { Link, useLocation } from "react-router-dom";
import Container from "./Container.jsx";
import { Button } from "@/components/ui/button";
import { Settings, Sun, Moon, Home, Plus, ScanLine, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSupabaseAuth } from "@/lib/auth.js";
import { supabase } from "@/lib/supabase.js";
import { usePaints } from "@/lib/PaintsProvider.jsx";

function getInitialTheme() {
  const stored = localStorage.getItem("theme");
  if (stored === "dark" || stored === "light") return stored;
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function formatCount(n) {
  if (!Number.isFinite(n)) return "0";
  if (n > 999) return "999+";
  return String(n);
}

export default function Header() {
  const loc = useLocation();
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const auth = useSupabaseAuth();
  const { unsyncedCount, syncing, autoSync, setAutoSync, syncNow } = usePaints();

  const loginStatus = useMemo(() => {
    if (!auth.enabled) return { text: "未設定", cls: "border border-border bg-muted text-foreground" };
    if (auth.loading) return { text: "確認中", cls: "border border-amber-400/30 bg-amber-400/10 text-amber-200" };
    if (auth.loggedIn)
      return { text: "ログイン中", cls: "border border-emerald-400/30 bg-emerald-400/10 text-emerald-200" };
    return { text: "未ログイン", cls: "border border-rose-400/30 bg-rose-400/10 text-rose-200" };
  }, [auth.enabled, auth.loading, auth.loggedIn]);

  async function onClickSync() {
    if (!auth.loggedIn || !auth.user) return;
    try {
      await syncNow({ supabase, user: auth.user });
      alert("同期しました");
    } catch (e) {
      console.error(e);
      alert(`同期に失敗しました: ${e?.message ?? JSON.stringify(e)}`);
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur">
      <Container className="px-3 py-2">
        {/* ===== 1段目：ロゴ / 右アイコン ===== */}
        <div className="flex items-start gap-1">
          {/* 左：ロゴ */}
          <Link to="/" className="flex items-center gap-2 min-w-0">
            <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
              <span className="text-sm font-bold">P</span>
            </div>
            <div className="min-w-0 leading-tight">
              <div className="text-sm font-semibold truncate">Paint Inventory</div>
              <div className="text-xs text-muted-foreground truncate">
                {auth.loggedIn ? "クラウド同期" : "ローカル管理"}
              </div>
            </div>
          </Link>

          {/* 右：ログインバッジ / テーマ / 設定 */}
          <div className="ml-auto flex items-center gap-1 shrink-0 pl-1">
            <Link to="/settings" className="block">
              <div
                className={["max-w-[92px] truncate", "px-2 py-1 rounded-full text-xs", loginStatus.cls].join(" ")}
                title={auth.user?.email || loginStatus.text}
              >
                {loginStatus.text}
              </div>
            </Link>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
              className="h-8 w-8 px-1"
              title="テーマ切替"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            <Link to="/settings">
              <Button variant="ghost" size="icon" className="h-8 w-8 px-1" title="設定">
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* ===== 2段目：同期系（見やすく・折り返しOK） ===== */}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <div
            className="px-2 py-1 rounded-full text-xs border border-border bg-muted text-foreground"
            title="未同期件数"
          >
            未同期 {formatCount(unsyncedCount)}
          </div>

          <button
            type="button"
            onClick={() => setAutoSync(!autoSync)}
            className={[
              "px-2 py-1 rounded-full text-xs border",
              autoSync ? "border-border bg-secondary text-foreground" : "border-border bg-muted text-foreground",
            ].join(" ")}
            title="自動同期"
          >
            自動 {autoSync ? "ON" : "OFF"}
          </button>

          <Button
            size="sm"
            variant="secondary"
            onClick={onClickSync}
            disabled={!auth.loggedIn || syncing}
            className="h-8"
            title={!auth.loggedIn ? "ログインすると同期できます" : "同期"}
          >
            <RefreshCw className={["h-4 w-4 mr-2", syncing ? "animate-spin" : ""].join(" ")} />
            {syncing ? "同期中" : "同期"}
          </Button>

          {/* 右寄せしたい場合はこれを残す： */}
          {/* <div className="flex-1" /> */}
        </div>

        {/* ===== 下段ナビ ===== */}
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
