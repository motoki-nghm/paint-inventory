import { cn } from "@/lib/utils";

export default function Container({ className, children }) {
  return <div className={cn("mx-auto w-full max-w-md px-4", className)}>{children}</div>;
}
