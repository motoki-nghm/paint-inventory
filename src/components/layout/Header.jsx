import { Link } from "react-router-dom";
import Container from "./Container.jsx";
import { useAuth } from "@/lib/AuthProvider";

export default function Header() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur">
      <Container className="px-4 py-3 flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2 min-w-0 flex-1">
          <div className="h-8 w-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-primary">P</span>
          </div>
          <span className="text-sm font-semibold truncate">Paint Inventory</span>
        </Link>

        {user && (
          <span className="text-xs text-muted-foreground truncate max-w-[120px]" title={user.email}>
            {user.email}
          </span>
        )}
      </Container>
    </header>
  );
}
