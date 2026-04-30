import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "@/stores/auth-context";
import { AppShell } from "@/components/layout/app-shell";
import { Toaster } from "@/components/ui/toaster";
import { usePaintsStore } from "@/stores/paints-store";

import { LoginPage } from "@/pages/login";
import { AuthCallbackPage } from "@/pages/auth-callback";
import { ListPage } from "@/pages/list";
import { AddPage } from "@/pages/add";
import { ScanPage } from "@/pages/scan";
import { DetailPage } from "@/pages/detail";
import { EditPage } from "@/pages/edit";
import { SettingsPage } from "@/pages/settings";
import { NotFoundPage } from "@/pages/not-found";

function ProtectedShell() {
  const { user, initialized } = useAuth();
  const initialize = usePaintsStore((s) => s.initialize);

  useEffect(() => {
    if (initialized && user) void initialize();
  }, [initialized, user, initialize]);

  if (!initialized) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <AppShell />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route element={<ProtectedShell />}>
            <Route path="/" element={<ListPage />} />
            <Route path="/add" element={<AddPage />} />
            <Route path="/scan" element={<ScanPage />} />
            <Route path="/item/:id" element={<DetailPage />} />
            <Route path="/item/:id/edit" element={<EditPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </AuthProvider>
  );
}
