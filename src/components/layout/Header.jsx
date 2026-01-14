import { Link, useLocation } from "react-router-dom";
import Container from "./Container.jsx";
import { Button } from "@/components/ui/button";
import { Settings, Sun, Moon, Home, Plus, ScanLine } from "lucide-react";
import { useEffect, useState } from "react";

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

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur">
      <Container className="py-3 px-2">
        <div className="flex items-center justify-between gap-2">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
              <span className="text-sm font-bold">P</span>
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold">Paint Inventory</div>
              <div className="text-xs text-muted-foreground">ローカル管理</div>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}>
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            <Link to="/settings">
              <Button variant="ghost" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

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
