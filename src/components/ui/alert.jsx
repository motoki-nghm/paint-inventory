import { cn } from "@/lib/utils";

export function Alert({ className, variant, ...props }) {
  const styles =
    variant === "danger"
      ? "border-destructive/40 bg-destructive/10 text-foreground"
      : "border-border bg-muted text-foreground";

  return <div className={cn("rounded-lg border p-3 text-sm", styles, className)} {...props} />;
}
