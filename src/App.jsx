import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import NavBar from "./components/NavBar";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import WaiterTablesPage from "./pages/WaiterTablesPage";
import UsersPage from "./pages/admin/UsersPage";
import ProductsPage from "./pages/admin/ProductsPage";
import TablesPage from "./pages/admin/TablesPage";
import { useAuth } from "./context/AuthContext";

export default function App() {
  const { tokenChecked, user } = useAuth();

  if (!tokenChecked) return null; 

  // Calcula la ruta de inicio según el rol del usuario
  const homePath = user?.role === "WAITER" ? "/mesas" : "/admin/usuarios";

  return (
    <>
      <NavBar />
      <div className="p-4">
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/* WAITERS */}
          <Route
            path="/mesas"
            element={<ProtectedRoute roles={["WAITER"]} component={<WaiterTablesPage />} />}
          />

          {/* ADMIN */}
          <Route
            path="/admin/usuarios"
            element={<ProtectedRoute roles={["ADMIN"]} component={<UsersPage />} />}
          />
          <Route
            path="/admin/productos"
            element={<ProtectedRoute roles={["ADMIN"]} component={<ProductsPage />} />}
          />
          <Route
            path="/admin/mesas"
            element={<ProtectedRoute roles={["ADMIN"]} component={<TablesPage />} />}
          />

          {/* Fallback genérico */}
          <Route path="*" element={<Navigate to={user ? homePath : "/login"} />} />
        </Routes>
      </div>

      <ToastContainer position="bottom-right" theme="colored" />
    </>
  );
}