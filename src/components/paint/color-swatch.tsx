import { cn } from "@/lib/utils";
import { colorSwatch, colorLabel } from "@/lib/color";

interface ColorSwatchProps {
  value: string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function ColorSwatch({
  value,
  size = "sm",
  showLabel = false,
  className,
}: ColorSwatchProps) {
  const sw = colorSwatch(value);
  const dimension =
    size === "lg" ? "h-6 w-6" : size === "md" ? "h-5 w-5" : "h-4 w-4";
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span
        aria-hidden
        className={cn("rounded-full border border-border/70 shadow-inner", dimension)}
        style={{ background: sw }}
      />
      {showLabel ? (
        <span className="text-xs text-muted-foreground">{colorLabel(value)}</span>
      ) : null}
    </span>
  );
}
