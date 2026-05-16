import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  type LucideIcon,
  Palette,
  Plus,
  ScanLine,
  Settings,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AddMenu } from "@/components/layout/add-menu";

interface NavItem {
  to: string;
  icon: LucideIcon;
  label: string;
  match: (pathname: string) => boolean;
}

const LEFT: NavItem[] = [
  {
    to: "/",
    icon: Palette,
    label: "塗料",
    match: (p) => p === "/" || p.startsWith("/item") || p === "/add",
  },
  {
    to: "/tools",
    icon: Wrench,
    label: "工具",
    match: (p) => p.startsWith("/tools"),
  },
];

const RIGHT: NavItem[] = [
  {
    to: "/scan",
    icon: ScanLine,
    label: "スキャン",
    match: (p) => p === "/scan",
  },
  {
    to: "/settings",
    icon: Settings,
    label: "設定",
    match: (p) => p === "/settings",
  },
];

export function BottomNav() {
  const { pathname } = useLocation();
  const [addOpen, setAddOpen] = useState(false);

  return (
    <>
      <nav
        aria-label="メインナビゲーション"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/95 backdrop-blur-md safe-bottom"
      >
        <div className="relative mx-auto grid max-w-md grid-cols-5 items-end">
          {LEFT.map((item) => (
            <NavCell key={item.to} item={item} active={item.match(pathname)} />
          ))}

          <div className="flex justify-center">
            <button
              type="button"
              aria-label="追加する"
              onClick={() => setAddOpen(true)}
              className={cn(
                "-translate-y-5 grid h-14 w-14 place-items-center rounded-full",
                "bg-primary text-primary-foreground shadow-lg shadow-primary/30",
                "ring-4 ring-background transition active:scale-95",
                addOpen && "rotate-45",
              )}
            >
              <Plus className="h-7 w-7" strokeWidth={2.5} />
            </button>
          </div>

          {RIGHT.map((item) => (
            <NavCell key={item.to} item={item} active={item.match(pathname)} />
          ))}
        </div>
      </nav>

      <AddMenu open={addOpen} onOpenChange={setAddOpen} />
    </>
  );
}

function NavCell({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      end={item.to === "/"}
      className={() =>
        cn(
          "relative flex flex-col items-center justify-end gap-0.5 py-2.5 text-[11px] transition-colors active:scale-95",
          active ? "text-primary" : "text-muted-foreground hover:text-foreground",
        )
      }
    >
      {active && (
        <span
          aria-hidden
          className="absolute top-0 h-0.5 w-8 rounded-full bg-primary"
        />
      )}
      <Icon className="h-5 w-5" aria-hidden />
      <span className="font-medium">{item.label}</span>
    </NavLink>
  );
}
