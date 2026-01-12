import React from "react";
import { cn } from "@/lib/utils";

export function Alert({ className, variant = "default", children, ...props }) {
  const v =
    variant === "danger"
      ? "border-[rgb(var(--danger))]/50 bg-[rgb(var(--danger))]/10 text-[rgb(var(--fg))]"
      : "border-[rgb(var(--border))] bg-[rgb(var(--muted))] text-[rgb(var(--fg))]";
  return (
    <div className={cn("rounded-lg border px-3 py-2 text-sm", v, className)} {...props}>
      {children}
    </div>
  );
}
