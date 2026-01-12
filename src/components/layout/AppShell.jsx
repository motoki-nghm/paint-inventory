import { Outlet } from "react-router-dom";
import Header from "@/components/layout/Header";

export default function AppShell() {
  return (
    <div className="min-h-dvh">
      <Header />
      <main className="py-4">
        <Outlet />
      </main>
    </div>
  );
}
