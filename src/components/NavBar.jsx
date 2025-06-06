import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import classNames from "classnames";

export default function NavBar() {
  const { user, logout } = useAuth();
  const active = ({ isActive }) => classNames("px-3 py-2 rounded",
    isActive ? "bg-primary text-white" : "text-gray-700 hover:bg-gray-200");
  return (
    <nav className="flex items-center justify-between bg-white shadow px-6 h-14">
      <Link to="/" className="text-xl font-bold text-primary">Restaurant REHHAB</Link>
      {user && (
        <div className="flex gap-2 items-center">
          <NavLink to="/mesas" className={active}>Mesas</NavLink>
          {user.role === "ADMIN" && (
            <>
              <NavLink to="/admin/usuarios" className={active}>Usuarios</NavLink>
              <NavLink to="/admin/productos" className={active}>Productos</NavLink>
              <NavLink to="/admin/mesas" className={active}>Mesas (CRUD)</NavLink>
            </>
          )}
          <button onClick={logout} className="ml-4 text-sm text-primary hover:underline">Salir</button>
        </div>
      )}
    </nav>
  );
}
