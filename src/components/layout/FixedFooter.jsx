import { cn } from "@/lib/utils";

export default function FixedFooter({ children }) {
  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40",
        "bg-background/95 backdrop-blur",
        "border-t border-border",
        "pb-[env(safe-area-inset-bottom)]"
      )}
    >
      <div className="mx-auto max-w-md px-4 py-3">{children}</div>
    </div>
  );
}
