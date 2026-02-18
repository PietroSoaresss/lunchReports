import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import EmployeesPage from "./pages/EmployeesPage";
import EmployeesListPage from "./pages/EmployeesListPage";
import ReportsPage from "./pages/ReportsPage";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <div key={location.pathname} className="page-enter">
      <Routes location={location}>
        <Route path="/" element={<HomePage />} />
        <Route path="/funcionarios" element={<EmployeesPage />} />
        <Route path="/funcionarios/lista" element={<EmployeesListPage />} />
        <Route path="/relatorios" element={<ReportsPage />} />
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
