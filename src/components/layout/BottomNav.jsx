import { Link, useLocation } from "react-router-dom";
import { Home, Plus, ScanLine, Settings } from "lucide-react";

const NAV_ITEMS = [
  { to: "/", icon: Home, label: "一覧" },
  { to: "/add", icon: Plus, label: "追加" },
  { to: "/scan", icon: ScanLine, label: "スキャン" },
  { to: "/settings", icon: Settings, label: "設定" },
];

export default function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur safe-area-bottom">
      <div className="grid grid-cols-4">
        {NAV_ITEMS.map((item) => {
          const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
          const NavIcon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={[
                "flex flex-col items-center justify-center py-2 gap-0.5 text-xs transition-colors active:scale-95",
                active ? "text-primary" : "text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              <NavIcon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
