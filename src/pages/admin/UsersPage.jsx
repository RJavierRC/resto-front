import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getUsers, createUser, updateUser, deleteUser } from "../../api/api";

const ROLES = ["ADMIN", "WAITER"];

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (e) {
      toast.error(`Error al cargar usuarios: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const emptyUser = () => ({
    username: "",
    password: "",
    role: "WAITER"
  });

  const save = async () => {
    // Validaciones
    if (!form.username.trim()) {
      toast.error("El nombre es requerido");
      return;
    }
    
    if (!form.id && !form.password.trim()) {
      toast.error("La contraseña es requerida para usuarios nuevos");
      return;
    }

    setSaving(true);
    try {
      if (form.id) {
        await updateUser(form.id, form);
        toast.success("Usuario actualizado exitosamente");
      } else {
        await createUser(form);
        toast.success("Usuario creado exitosamente");
      }
      setForm(null);
      load();
    } catch (e) {
      toast.error(`Error al guardar: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!confirm("¿Estás seguro de eliminar este usuario?")) return;
    try {
      await deleteUser(id);
      toast.success("Usuario eliminado exitosamente");
      load();
    } catch (e) {
      toast.error(`Error al eliminar: ${e.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Usuarios</h1>
          <p className="text-gray-600 mt-1">Gestiona usuarios del sistema</p>
        </div>
        <button
          onClick={() => setForm(emptyUser())}
          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
        >
          <span className="text-lg">+</span>
          Nuevo Usuario
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span className="ml-3 text-gray-600">Cargando...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Nombre</th>
                  
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Rol</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user, index) => (
                  <tr key={user.id} className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                    <td className="px-6 py-4 text-sm text-gray-800">{user.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-800 font-medium">{user.username}</td>
                   
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === 'ADMIN' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center space-x-2">
                      <button
                        onClick={() => setForm(user)}
                        className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-xs font-medium hover:bg-blue-200 transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => remove(user.id)}
                        className="bg-red-100 text-red-700 px-3 py-1 rounded-lg text-xs font-medium hover:bg-red-200 transition-colors"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
                {!users.length && !loading && (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-gray-500">
                      <div className="space-y-3">
                        <div className="w-16 h-16 mx-auto bg-gray-200 rounded-full flex items-center justify-center text-2xl">
                          👥
                        </div>
                        <p>No hay usuarios registrados</p>
                        <button
                          onClick={() => setForm(emptyUser())}
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Crear el primero
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {form !== null && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl animate-fade-in">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-xl">
              <h2 className="text-xl font-bold">
                {form.id ? "Editar" : "Nuevo"} Usuario
              </h2>
              <p className="text-blue-100 text-sm mt-1">
                {form.id ? "Modifica los campos necesarios" : "Completa la información requerida"}
              </p>
            </div>

            <div className="p-6 space-y-4">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre *
                </label>
                <input
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, username: e.target.value })}
                  placeholder="Ingresa el nombre..."
                />
              </div>

              

              {/* Contraseña */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña {form.id ? "(dejar vacío para no cambiar)" : "*"}
                </label>
                <input
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  type="password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="Ingresa la contraseña..."
                />
              </div>

              {/* Rol */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rol *
                </label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value })}
                >
                  {ROLES.map(role => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setForm(null)}
                disabled={saving}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 transition-all duration-200 flex items-center justify-center"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  "Guardar"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}