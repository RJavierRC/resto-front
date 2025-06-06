import { createContext, useContext, useState, useEffect } from "react";
import { login as apiLogin } from "../api/api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    return token ? { role } : null;
  });
  const [tokenChecked, setTokenChecked] = useState(false);

  useEffect(() => {
    // Simula verificación inicial (podrías llamar un /me si existiera)
    setTokenChecked(true);
  }, []);

  const login = async (credentials) => {
    try {
      const data = await apiLogin(credentials);
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      setUser({ role: data.role });
      // después de setUser({ role: data.role });
      const defaultPath = data.role === "WAITER"
     ? "/mesas"
     : "/admin/usuarios";
+ navigate(defaultPath);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, tokenChecked }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
