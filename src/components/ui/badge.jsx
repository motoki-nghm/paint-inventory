import React from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, variant = "default", ...props }) {
  const v =
    variant === "secondary"
      ? "bg-[rgb(var(--muted))] text-[rgb(var(--fg))] border border-[rgb(var(--border))]"
      : "bg-[rgb(var(--primary))] text-[rgb(var(--primary-fg))]";
  return (
    <span
      className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold", v, className)}
      {...props}
    />
  );
}
