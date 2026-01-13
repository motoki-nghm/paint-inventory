import React from "react";
import { cn } from "@/lib/utils";

const variants = {
  default: "bg-[rgb(var(--primary))] text-[rgb(var(--primary-fg))] hover:opacity-90",
  secondary: "bg-[rgb(var(--muted))] text-[rgb(var(--fg))] hover:opacity-90 border border-[rgb(var(--border))]",
  ghost: "bg-transparent hover:bg-[rgb(var(--muted))]",
  danger: "bg-[rgb(var(--danger))] text-white hover:opacity-90",
};

const sizes = {
  default: "h-10 px-2 text-sm",
  icon: "h-10 w-10 p-0",
};

export const Button = React.forwardRef(function Button(
  { className, variant = "default", size = "default", type = "button", ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium transition active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none",
        variants[variant] || variants.default,
        sizes[size] || sizes.default,
        className
      )}
      {...props}
    />
  );
});
