import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Option {
  value: string;
  label: React.ReactNode;
}

interface SelectProps {
  value: string;
  onValueChange: (v: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  "aria-label"?: string;
}

/**
 * Native <select> wrapped for consistent styling.
 * Avoids the complexity of a custom popover for a mobile-first inventory app.
 */
export function Select({
  value,
  onValueChange,
  options,
  placeholder,
  className,
  disabled,
  ...rest
}: SelectProps) {
  return (
    <div className={cn("relative", className)}>
      <select
        aria-label={rest["aria-label"]}
        disabled={disabled}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        className={cn(
          "h-11 w-full appearance-none rounded-lg border border-border bg-surface pl-3 pr-9 text-sm text-foreground",
          "outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30",
          "disabled:opacity-60",
        )}
      >
        {placeholder && !value ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {/* native select can only render strings */}
            {String(o.label)}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
      />
    </div>
  );
}
