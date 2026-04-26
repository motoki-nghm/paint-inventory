import { Outlet } from "react-router-dom";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";

export default function AppShell() {
  return (
    <div className="min-h-dvh">
      <Header />
      <main className="py-4 pb-24">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
