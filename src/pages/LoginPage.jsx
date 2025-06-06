import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const [form, setForm] = useState({ username: "", password: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    login(form);
  };

  return (
    <div className="flex items-center justify-center h-[calc(100vh-56px)]">
      <form onSubmit={handleSubmit} className="bg-white shadow-lg p-8 rounded w-80">
        <h1 className="text-2xl font-semibold mb-6 text-center">Iniciar sesión</h1>
        <input
          className="w-full border p-2 mb-4 rounded"
          placeholder="Usuario"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        />
        <input
          className="w-full border p-2 mb-4 rounded"
          type="password"
          placeholder="Contraseña"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button className="w-full bg-primary text-white py-2 rounded">Entrar</button>
      </form>
    </div>
  );
}
