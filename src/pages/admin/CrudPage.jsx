import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function CrudPage({ resource }) {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await resource.api.list();
      setRows(data);
    } catch (e) {
      toast.error(`Error al cargar ${resource.name}: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const empty = () => {
    if (resource.schema) return structuredClone(resource.schema);
    const obj = {};
    if (rows[0]) {
      Object.keys(rows[0])
        .filter(k => k !== "id")
        .forEach(k => obj[k] = "");
    }
    return obj;
  };

  const save = async () => {
    setSaving(true);
    try {
      if (form.id) {
        await resource.api.update(form.id, form);
        toast.success(`${resource.name.slice(0, -1)} actualizado exitosamente`);
      } else {
        await resource.api.create(form);
        toast.success(`${resource.name.slice(0, -1)} creado exitosamente`);
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
    if (!confirm(`¿Estás seguro de eliminar este ${resource.name.slice(0, -1)}?`)) return;
    try {
      await resource.api.remove(id);
      toast.success(`${resource.name.slice(0, -1)} eliminado exitosamente`);
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
          <h1 className="text-3xl font-bold text-gray-800 capitalize">{resource.name}</h1>
          <p className="text-gray-600 mt-1">Gestiona {resource.name} del sistema</p>
        </div>
        <button
          onClick={() => setForm(empty())}
          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
        >
          <span className="text-lg">+</span>
          Nuevo {resource.name.slice(0, -1)}
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
                  {rows[0] && Object.keys(rows[0]).map(k => (
                    <th key={k} className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      {k}
                    </th>
                  ))}
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {rows.map((r, index) => (
                  <tr key={r.id} className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                    {Object.values(r).map((v, i) => (
                      <td key={i} className="px-6 py-4 text-sm text-gray-800">
                        <span className="truncate block max-w-xs">{String(v)}</span>
                      </td>
                    ))}
                    <td className="px-6 py-4 text-center space-x-2">
                      <button
                        onClick={() => setForm(r)}
                        className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-xs font-medium hover:bg-blue-200 transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => remove(r.id)}
                        className="bg-red-100 text-red-700 px-3 py-1 rounded-lg text-xs font-medium hover:bg-red-200 transition-colors"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
                {!rows.length && !loading && (
                  <tr>
                    <td colSpan={99} className="text-center py-12 text-gray-500">
                      <div className="space-y-3">
                        <div className="w-16 h-16 mx-auto bg-gray-200 rounded-full flex items-center justify-center text-2xl">
                          📋
                        </div>
                        <p>No hay {resource.name} registrados</p>
                        <button
                          onClick={() => setForm(empty())}
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
                {form.id ? "Editar" : "Nuevo"} {resource.name.slice(0, -1)}
              </h2>
              <p className="text-blue-100 text-sm mt-1">
                {form.id ? "Modifica los campos necesarios" : "Completa la información requerida"}
              </p>
            </div>

            <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
              {Object.keys(form).filter(k => k !== "id").map(k => (
  <div key={k}>
    <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
      {k.replace(/([A-Z])/g, ' $1').trim()}
    </label>
    <InputByType
      value={form[k]}
      onChange={val => setForm({ ...form, [k]: val })}
      fieldName={k}
      customInputs={resource.customInputs}
    />
  </div>
))}
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

function InputByType({ value, onChange, fieldName, customInputs = {} }) {
  const customInput = customInputs[fieldName];
  const baseClasses = "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors";

  // Input personalizado (select, password, etc.)
  if (customInput) {
    if (customInput.type === "select") {
      return (
        <select
          className={baseClasses}
          value={value}
          onChange={e => onChange(e.target.value)}
        >
          {customInput.options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }
    
    if (customInput.type === "password") {
      return (
        <input
          className={baseClasses}
          type="password"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="Ingresa contraseña..."
        />
      );
    }
  }

  // Inputs por defecto
  const isBool = typeof value === "boolean";
  const isNum = typeof value === "number";

  if (isBool) {
    return (
      <select
        className={baseClasses}
        value={String(value)}
        onChange={e => onChange(e.target.value === "true")}
      >
        <option value="true">Verdadero</option>
        <option value="false">Falso</option>
      </select>
    );
  }

  return (
    <input
      className={baseClasses}
      type={isNum ? "number" : "text"}
      step="any"
      value={value}
      onChange={e => onChange(isNum ? +e.target.value : e.target.value)}
      placeholder={`Ingresa ${typeof value === 'string' ? 'texto' : 'número'}...`}
    />
  );
}