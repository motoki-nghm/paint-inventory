import { Link } from "react-router-dom";
import { Boxes } from "lucide-react";
import { Container } from "@/components/layout/container";
import { useAuth } from "@/stores/auth-context";

export function Header() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <Container className="flex h-14 items-center gap-3">
        <Link to="/" className="flex min-w-0 flex-1 items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/15 ring-1 ring-primary/30">
            <Boxes className="h-4 w-4 text-primary" aria-hidden />
          </span>
          <span className="truncate text-sm font-semibold tracking-tight">
            Paint Inventory
          </span>
        </Link>

        {user ? (
          <span
            className="max-w-[140px] truncate text-xs text-muted-foreground"
            title={user.email ?? ""}
          >
            {user.email}
          </span>
        ) : null}
      </Container>
    </header>
  );
}
