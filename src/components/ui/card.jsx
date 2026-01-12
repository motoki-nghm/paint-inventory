import React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }) {
  return (
    <div
      className={cn("rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] shadow-sm", className)}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }) {
  return <div className={cn("p-4", className)} {...props} />;
}
