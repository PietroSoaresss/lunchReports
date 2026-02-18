import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import { useAuth } from "./contexts/AuthContext";
import HomePage from "./pages/HomePage";
import EmployeesPage from "./pages/EmployeesPage";
import EmployeesListPage from "./pages/EmployeesListPage";
import LoginPage from "./pages/LoginPage";
import ReportsPage from "./pages/ReportsPage";

function RequireAuth({ children }) {
  const { user, loadingAuth } = useAuth();

  if (loadingAuth) {
    return <p className="px-4 py-8 text-center text-slate-600">Carregando autenticacao...</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
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
            <RequireAuth>
              <HomePage />
            </RequireAuth>
          }
        />
        <Route
          path="/funcionarios"
          element={
            <RequireAuth>
              <EmployeesPage />
            </RequireAuth>
          }
        />
        <Route
          path="/funcionarios/lista"
          element={
            <RequireAuth>
              <EmployeesListPage />
            </RequireAuth>
          }
        />
        <Route
          path="/relatorios"
          element={
            <RequireAuth>
              <ReportsPage />
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
