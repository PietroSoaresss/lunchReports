import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import { useAuth } from "./contexts/AuthContext";
import AdminUsersPage from "./pages/AdminUsersPage";
import EmployeesListPage from "./pages/EmployeesListPage";
import EmployeesPage from "./pages/EmployeesPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ReportsPage from "./pages/ReportsPage";

function RequireAuth({ children, allowedRoles = ["admin", "user"] }) {
  const { user, role, loadingAuth } = useAuth();

  if (loadingAuth) {
    return <p className="px-4 py-8 text-center text-slate-600">Carregando autenticação...</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function AnimatedRoutes() {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <div key={location.pathname} className="page-enter">
      <Routes location={location}>
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />

        <Route
          path="/"
          element={
            <RequireAuth allowedRoles={["admin", "user"]}>
              <HomePage />
            </RequireAuth>
          }
        />
        <Route
          path="/relatorios"
          element={
            <RequireAuth allowedRoles={["admin", "user"]}>
              <ReportsPage />
            </RequireAuth>
          }
        />

        <Route
          path="/funcionarios"
          element={
            <RequireAuth allowedRoles={["admin"]}>
              <EmployeesPage />
            </RequireAuth>
          }
        />
        <Route
          path="/funcionarios/lista"
          element={
            <RequireAuth allowedRoles={["admin"]}>
              <EmployeesListPage />
            </RequireAuth>
          }
        />
        <Route
          path="/usuarios"
          element={
            <RequireAuth allowedRoles={["admin"]}>
              <AdminUsersPage />
            </RequireAuth>
          }
        />

        <Route path="*" element={<Navigate to={user ? "/" : "/login"} replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-100">
        <Navbar />
        <main className="mx-auto max-w-5xl px-4 py-6">
          <AnimatedRoutes />
        </main>
      </div>
    </BrowserRouter>
  );
}
