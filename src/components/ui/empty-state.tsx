import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-dashed border-border bg-card/40 p-8 text-center",
        className,
      )}
    >
      {Icon ? (
        <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-muted">
          <Icon className="h-6 w-6 text-muted-foreground" aria-hidden />
        </div>
      ) : null}
      <div className="text-sm font-semibold">{title}</div>
      {description ? (
        <div className="mt-1 text-xs text-muted-foreground">{description}</div>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
