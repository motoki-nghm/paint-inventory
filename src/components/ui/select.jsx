import React, { createContext, useContext } from "react";
import { cn } from "@/lib/utils";

const Ctx = createContext(null);

export function Select({ value, onValueChange, children }) {
  return <Ctx.Provider value={{ value, onValueChange }}>{children}</Ctx.Provider>;
}

export function SelectTrigger({ className, children }) {
  return (
    <div
      className={cn(
        "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm",
        "flex items-center justify-between",
        className
      )}
    >
      {children}
    </div>
  );
}

export function SelectValue({ placeholder }) {
  const ctx = useContext(Ctx);
  return (
    <span className={cn("truncate", !ctx?.value ? "text-muted-foreground" : "")}>
      {ctx?.value ? ctx.value : placeholder}
    </span>
  );
}

/**
 * MVP: Contentの中にItemを置くが、実体はnative select。
 * SelectContentは「枠」扱いで、内部のItemを収集して <select> を作る。
 */
export function SelectContent({ className, children }) {
  const ctx = useContext(Ctx);
  const items = [];

  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    if (child.type && child.type.displayName === "SelectItem") {
      items.push({ value: child.props.value, label: child.props.children });
    }
  });

  return (
    <select
      className={cn(
        "mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none",
        className
      )}
      value={ctx?.value ?? ""}
      onChange={(e) => ctx?.onValueChange?.(e.target.value)}
    >
      {items.map((it) => (
        <option key={String(it.value)} value={it.value}>
          {it.label}
        </option>
      ))}
    </select>
  );
}

export function SelectItem() {
  return null;
}
SelectItem.displayName = "SelectItem";
