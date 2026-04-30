import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(function Input({ className, type = "text", ...props }, ref) {
  return (
    <input
      ref={ref}
      type={type}
      className={cn(
        "h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm text-foreground",
        "placeholder:text-muted-foreground/70 caret-primary",
        "outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30",
        "disabled:opacity-60",
        className,
      )}
      {...props}
    />
  );
});
