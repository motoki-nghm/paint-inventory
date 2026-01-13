import { cn } from "@/lib/utils";

export function Badge({ className, variant = "secondary", ...props }) {
  const base = "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium border";
  const styles =
    variant === "secondary"
      ? "bg-muted text-foreground border-border"
      : "bg-primary text-primary-foreground border-transparent";

  return <span className={cn(base, styles, className)} {...props} />;
}
