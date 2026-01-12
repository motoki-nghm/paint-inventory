import React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef(function Input({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        "h-10 w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-3 text-sm outline-none",
        "focus:ring-2 focus:ring-[rgb(var(--fg))]/20",
        className
      )}
      {...props}
    />
  );
});
