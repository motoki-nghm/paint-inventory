import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppShell from "@/components/layout/AppShell";
import ListPage from "@/pages/ListPage";
import AddPage from "@/pages/AddPage";
import ScanPage from "@/pages/ScanPage";
import DetailPage from "@/pages/DetailPage";
import EditPage from "@/pages/EditPage";
import SettingsPage from "@/pages/SettingsPage";
import LoginPage from "@/pages/LoginPage";
import { PaintsProvider } from "@/lib/PaintsProvider";
import { AuthProvider, useAuth } from "@/lib/AuthProvider";

function ProtectedLayout() {
  const { user, initialized } = useAuth();
  if (!initialized) return null;
  if (!user) return <Navigate to="/login" replace />;
  return (
    <PaintsProvider>
      <AppShell />
    </PaintsProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedLayout />}>
            <Route path="/" element={<ListPage />} />
            <Route path="/add" element={<AddPage />} />
            <Route path="/scan" element={<ScanPage />} />
            <Route path="/item/:id" element={<DetailPage />} />
            <Route path="/item/:id/edit" element={<EditPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
