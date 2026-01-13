import * as React from "react";
import { cn } from "@/lib/utils";

const variants = {
  default: "bg-primary text-primary-foreground hover:opacity-90",
  secondary: "bg-secondary text-secondary-foreground hover:opacity-90 border border-border",
  ghost: "bg-transparent hover:bg-muted",
  danger: "bg-destructive text-destructive-foreground hover:opacity-90",
};

export function Button({ className, variant = "default", ...props }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg px-3 h-10 text-sm font-medium transition",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
        "disabled:opacity-50 disabled:pointer-events-none",
        variants[variant] || variants.default,
        className
      )}
      {...props}
    />
  );
}
