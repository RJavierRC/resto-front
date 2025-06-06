import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getTables, openTable, closeOrder } from "../api/api";
import TableCard from "../components/TableCard";
import ProductSearchModal from "../components/ProductSearchModal";
import CloseOrderModal from "../components/CloseOrderModal"; // NUEVO
import OrderSummaryModal from "../components/OrderSummaryModal"; // NUEVO
import Spinner from "../components/Spinner";

export default function WaiterTablesPage() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [orderModal, setOrderModal] = useState(null);
  const [closeModal, setCloseModal] = useState(null); // NUEVO
  const [summaryModal, setSummaryModal] = useState(null); // NUEVO

  // En la función load(), verifica la respuesta:
const load = async () => {
  setLoading(true);
  try { 
    const data = await getTables();
    setTables(data.map(table => ({
      id: table.id,
      number: table.number,
      status: table.status?.toUpperCase() || "CLOSED", // Normaliza
      orderId: table.order?.id || table.orderId,
      order: table.order || null
    }))); 
  } catch (e) { 
    toast.error(e.message); 
  } finally { 
    setLoading(false); 
  }
};

  useEffect(() => { load(); }, []);

  const handleOpen = async (tableId) => {
    try {
      // Verifica el estado actual de la mesa
      const updatedTables = await getTables();
      const table = tables.find(t => t.id === tableId);
      if (table?.status !== "FREE") {
        toast.warning("La mesa no está disponible para abrir");
        return;
      }
  
      const res = await openTable(tableId);
      
      // Actualización optimizada del estado
      setTables(prevTables => prevTables.map(table => 
        table.id === tableId 
          ? { 
              ...table, 
              status: "OCCUPIED", 
              orderId: res.orderId,
              order: res.order // Asegúrate que el backend devuelve esto
            } 
          : table
      ));
      
      setOrderModal(res.orderId);
      toast.success("Mesa abierta correctamente");
    } catch (e) {
      console.error("Detalles completos del error:", e);
      toast.error(`Error al abrir mesa: ${e.message}`);
    }

    console.log("Mesa a abrir:", tables.find(t => t.id === tableId));
    console.log("Respuesta API:", res);
  };

  const handleCloseSuccess = (tableId) => {
    setTables(tables.map(t => 
      t.id === tableId 
        ? { ...t, status: "FREE", orderId: null, order: null } 
        : t
    ));
    setCloseModal(null);
    toast.success("Orden cerrada y mesa liberada");
  };

  const handleForceClose = async (tableId) => {
    if (!confirm("¿Estás seguro de marcar esta mesa como libre?")) return;
    
    try {
      // Opción 1: Solo frontend (comentado)
      setTables(tables.map(t => 
        t.id === tableId ? { ...t, status: "FREE" } : t
      ));
      
      // Opción 2: Con backend (descomentar)
      // await freeTable(tableId);
      
      toast.success("✅ Mesa liberada");
    } catch (error) {
      toast.error(`❌ Error: ${error.message}`);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Mesas</h1>
          <p className="text-gray-600 mt-1">Gestiona las mesas del restaurante</p>
        </div>
        <button 
          onClick={load} 
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          🔄 Refrescar
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Spinner />
          <span className="ml-3 text-gray-600">Cargando mesas...</span>
        </div>
      ) : (
        <div className="grid gap-4" style={{gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))"}}>
          {tables.map(t => (
        <TableCard
          key={t.id}
          table={t}
          onOpen={handleOpen}
          onAddItem={(oid) => setOrderModal(oid)}
          onClose={(oid, tid) => {
            if (oid) {
              setCloseModal({ orderId: oid, tableId: tid });
            } else {
              handleForceClose(tid);
            }
          }}
          onViewOrder={(oid) => setSummaryModal(oid)}
        />
      ))}
        </div>
      )}

      {/* Modales */}
      {orderModal && (
        <ProductSearchModal
          orderId={orderModal}
          onClose={() => { setOrderModal(null); load(); }}
        />
      )}

      {closeModal && (
        <CloseOrderModal
          orderId={closeModal.orderId}
          onClose={() => setCloseModal(null)}
          onSuccess={() => handleCloseSuccess(closeModal.tableId)}
        />
      )}

      {summaryModal && (
        <OrderSummaryModal
          orderId={summaryModal}
          onClose={() => setSummaryModal(null)}
        />
      )}
    </>
  );
}