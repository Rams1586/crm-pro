import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import LeadDetail from "./pages/LeadDetail";

function AppLayout() {
  const [leadCount, setLeadCount] = useState(null);
  return (
    <div className="shell">
      <Sidebar leadCount={leadCount} />
      <div className="main">
        <header className="header">
          <h1>CRM<span>Pro</span></h1>
          <div className="hdr-right">
            <span style={{ fontSize:".8rem", color:"var(--muted)" }}>Lead Management System</span>
          </div>
        </header>
        <Routes>
          <Route path="/"           element={<Dashboard />} />
          <Route path="/leads"      element={<Leads onCountChange={setLeadCount} />} />
          <Route path="/leads/:id"  element={<LeadDetail />} />
          <Route path="*"           element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/*" element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            } />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
