import { Link, useLocation } from "react-router-dom";
import { Boxes, Palette, Wrench } from "lucide-react";
import { Container } from "@/components/layout/container";
import { useAuth } from "@/stores/auth-context";
import { cn } from "@/lib/utils";

type Scope = "paint" | "tool" | "other";

function detectScope(pathname: string): Scope {
  if (pathname.startsWith("/tools")) return "tool";
  if (pathname === "/" || pathname.startsWith("/item") || pathname === "/add" || pathname === "/scan")
    return "paint";
  return "other";
}

export function Header() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const scope = detectScope(pathname);

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <Container className="flex h-14 items-center gap-3">
        <Link to="/" className="flex min-w-0 items-center gap-2.5">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/15 ring-1 ring-primary/30">
            <Boxes className="h-4 w-4 text-primary" aria-hidden />
          </span>
          <span className="truncate text-sm font-semibold tracking-tight">
            Paint Inventory
          </span>
        </Link>

        {scope !== "other" && (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium",
              scope === "paint"
                ? "border-primary/30 bg-primary/10 text-primary"
                : "border-amber-500/30 bg-amber-500/10 text-amber-500",
            )}
          >
            {scope === "paint" ? (
              <Palette className="h-3 w-3" aria-hidden />
            ) : (
              <Wrench className="h-3 w-3" aria-hidden />
            )}
            {scope === "paint" ? "塗料" : "工具"}
          </span>
        )}

        {user ? (
          <span
            className="ml-auto max-w-[140px] truncate text-xs text-muted-foreground"
            title={user.email ?? ""}
          >
            {user.email}
          </span>
        ) : null}
      </Container>
    </header>
  );
}
