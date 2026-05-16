import { NavLink, useLocation } from "react-router-dom";
import { Home, Plus, ScanLine, Settings, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { to: "/", icon: Home, label: "塗料", end: true, match: (p: string) => p === "/" || p.startsWith("/item") },
  { to: "/tools", icon: Wrench, label: "工具", match: (p: string) => p.startsWith("/tools") },
  { to: "/add", icon: Plus, label: "追加", match: (p: string) => p === "/add" },
  { to: "/scan", icon: ScanLine, label: "スキャン", match: (p: string) => p === "/scan" },
  { to: "/settings", icon: Settings, label: "設定", match: (p: string) => p === "/settings" },
] as const;

export function BottomNav() {
  const { pathname } = useLocation();
  const inToolsScope = pathname.startsWith("/tools");
  return (
    <nav
      aria-label="メインナビゲーション"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/95 backdrop-blur-md safe-bottom"
    >
      <ul className="mx-auto grid max-w-md grid-cols-5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          // 「追加」だけは現在のスコープに合わせて遷移先を切り替える
          const to = item.to === "/add" && inToolsScope ? "/tools/add" : item.to;
          const isActive = item.to === "/add"
            ? pathname === "/add" || pathname === "/tools/add"
            : item.match(pathname);
          return (
            <li key={item.to}>
              <NavLink
                to={to}
                end={"end" in item ? item.end : undefined}
                className={() =>
                  cn(
                    "flex flex-col items-center justify-center gap-0.5 py-2.5 text-[11px] transition-colors active:scale-95",
                    isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
                  )
                }
              >
                <Icon className="h-5 w-5" aria-hidden />
                <span>{item.label}</span>
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
