import { cn } from "@/lib/utils";

export default function Container({ className, children }) {
  return <div className={cn("mx-auto w-full max-w-[360px] px-5", className)}>{children}</div>;
}
