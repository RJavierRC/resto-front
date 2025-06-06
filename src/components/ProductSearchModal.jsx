import { useState, useEffect } from "react";
import { searchProducts, addItem } from "../api/api";
import { toast } from "react-toastify";

/**
 * Modal lateral para buscar productos y agregarlos a una orden
 *
 * Props
 * ───────────────────────────────────────────
 * @param {number}  orderId   – ID de la orden a la que se añadirán ítems
 * @param {() => void} onClose – callback para cerrar el modal
 * @param {() => void} onItemAdded – callback opcional cuando se agrega un ítem
 */
export default function ProductSearchModal({ orderId, onClose, onItemAdded }) {
  // estado interno
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [qtyMap, setQtyMap] = useState({}); // {productId: qty}

  /* ---------------- búsqueda con debounce ---------------- */
  useEffect(() => {
    const handler = setTimeout(async () => {
      if (query.trim().length < 2) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const data = await searchProducts(query.trim());
        setResults(data);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    }, 300); // 300 ms debounce

    return () => clearTimeout(handler);
  }, [query]);

  /* ---------------- helpers ---------------- */
  const changeQty = (id, delta) =>
    setQtyMap((prev) => {
      const next = { ...prev, [id]: Math.max(1, (prev[id] ?? 1) + delta) };
      return next;
    });

  const handleAdd = async (productId) => {
    const qty = qtyMap[productId] ?? 1;
    try {
      await addItem(orderId, productId, qty);
      toast.success("Producto agregado");
      
      // Limpia el estado
      setQuery("");
      setResults([]);
      setQtyMap({});
      
      // Ejecuta callbacks
      onClose();
      if (onItemAdded) onItemAdded();
    } catch (err) {
      toast.error(err.message);
    }
  };

  /* ---------------- render ---------------- */
  return (
    <div className="fixed inset-0 z-30 bg-black/40 flex">
      {/* panel derecho */}
      <aside className="ml-auto w-96 bg-white h-full shadow-xl flex flex-col animate-slide-in">
        <header className="p-5 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">Añadir productos</h2>
          <button 
            onClick={onClose} 
            className="text-primary text-sm hover:underline"
            aria-label="Cerrar modal"
          >
            Cerrar
          </button>
        </header>

        {/* buscador */}
        <div className="p-5">
          <input
            type="text"
            placeholder="Buscar (mín. 2 letras)…"
            className="w-full border rounded p-2"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            aria-label="Buscar productos"
          />
        </div>

        {/* resultados */}
        <div className="flex-1 overflow-y-auto divide-y">
          {loading && (
            <p className="p-5 text-sm text-gray-500">Buscando…</p>
          )}

          {!loading && results.length === 0 && query.length >= 2 && (
            <p className="p-5 text-sm text-gray-500">Sin coincidencias</p>
          )}

          {results.map((p) => (
            <div key={p.id} className="p-4 flex items-center gap-3 hover:bg-gray-50">
              <div className="flex-1">
                <p className="font-medium">{p.name}</p>
                <p className="text-xs text-gray-500">${p.price.toFixed(2)}</p>
              </div>

              {/* selector de cantidad */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => changeQty(p.id, -1)}
                  className="w-6 h-6 border rounded text-sm disabled:opacity-30"
                  disabled={(qtyMap[p.id] ?? 1) <= 1}
                  aria-label="Reducir cantidad"
                >
                  -
                </button>
                <span className="w-6 text-center text-sm">
                  {qtyMap[p.id] ?? 1}
                </span>
                <button
                  onClick={() => changeQty(p.id, 1)}
                  className="w-6 h-6 border rounded text-sm"
                  aria-label="Aumentar cantidad"
                >
                  +
                </button>
              </div>

              {/* botón agregar */}
              <button
                onClick={() => handleAdd(p.id)}
                className="ml-2 bg-primary text-white px-3 py-1 rounded text-sm"
                aria-label={`Añadir ${p.name} a la orden`}
              >
                Añadir
              </button>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}