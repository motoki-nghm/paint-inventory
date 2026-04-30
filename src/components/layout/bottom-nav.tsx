import { NavLink } from "react-router-dom";
import { Home, Plus, ScanLine, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { to: "/", icon: Home, label: "一覧", end: true },
  { to: "/add", icon: Plus, label: "追加" },
  { to: "/scan", icon: ScanLine, label: "スキャン" },
  { to: "/settings", icon: Settings, label: "設定" },
] as const;

export function BottomNav() {
  return (
    <nav
      aria-label="メインナビゲーション"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/95 backdrop-blur-md safe-bottom"
    >
      <ul className="mx-auto grid max-w-md grid-cols-4">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={"end" in item ? item.end : undefined}
                className={({ isActive }) =>
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
