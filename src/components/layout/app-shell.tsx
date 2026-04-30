import { Outlet } from "react-router-dom";
import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";

export function AppShell() {
  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <main className="flex-1 py-4 pb-32">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
