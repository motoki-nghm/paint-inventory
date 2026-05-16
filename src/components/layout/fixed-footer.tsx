import * as React from "react";
import { cn } from "@/lib/utils";

interface FixedFooterProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Sticky action bar pinned above the bottom nav.
 * Adds env(safe-area-inset-bottom) so iOS home bar doesn't overlap.
 */
export function FixedFooter({ children, className }: FixedFooterProps) {
  return (
    <div
      className={cn(
        // BottomNav (h≈56px) + 中央 FAB (translate-y-5) を考慮して 84px のマージンを確保
        "fixed inset-x-0 bottom-[84px] z-30 border-t border-border/70 bg-background/95 backdrop-blur-md",
        "safe-bottom",
        className,
      )}
    >
      <div className="mx-auto max-w-md px-4 py-3">{children}</div>
    </div>
  );
}
