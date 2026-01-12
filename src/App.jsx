import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppShell from "@/components/layout/AppShell";
import ListPage from "@/pages/ListPage";
import AddPage from "@/pages/AddPage";
import ScanPage from "@/pages/ScanPage";
import DetailPage from "@/pages/DetailPage";
import EditPage from "@/pages/EditPage";
import SettingsPage from "@/pages/SettingsPage";
import { PaintsProvider } from "@/lib/PaintsProvider";

export default function App() {
  return (
    <PaintsProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<ListPage />} />
            <Route path="/add" element={<AddPage />} />
            <Route path="/scan" element={<ScanPage />} />
            <Route path="/item/:id" element={<DetailPage />} />
            <Route path="/item/:id/edit" element={<EditPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </PaintsProvider>
  );
}
