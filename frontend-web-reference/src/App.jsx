import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import BootstrapSuperAdmin from "./pages/BootstrapSuperAdmin";
import Dashboard from "./pages/Dashboard";
import Masters from "./pages/Masters";
import ComplaintsRaise from "./pages/ComplaintsRaise";
import ComplaintsList from "./pages/ComplaintsList";
import Reports from "./pages/Reports";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />

        <Route path="/login" element={<Login />} />
        <Route path="/bootstrap" element={<BootstrapSuperAdmin />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/masters"
          element={
            <ProtectedRoute roles={["Superadmin"]}>
              <Masters />
            </ProtectedRoute>
          }
        />

        <Route
          path="/complaints/raise"
          element={
            <ProtectedRoute roles={["User", "Superadmin"]}>
              <ComplaintsRaise />
            </ProtectedRoute>
          }
        />

        <Route
          path="/complaints"
          element={
            <ProtectedRoute>
              <ComplaintsList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <ProtectedRoute roles={["Superadmin"]}>
              <Reports />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<div style={{ padding: 20 }}>404</div>} />
      </Routes>
    </BrowserRouter>
  );
}
