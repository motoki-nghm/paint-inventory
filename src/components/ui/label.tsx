import * as React from "react";
import { cn } from "@/lib/utils";

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export function Label({ className, required, children, ...props }: LabelProps) {
  return (
    <label
      className={cn("flex items-center gap-1 text-sm font-medium text-foreground", className)}
      {...props}
    >
      {children}
      {required ? <span className="text-destructive" aria-hidden>*</span> : null}
    </label>
  );
}
