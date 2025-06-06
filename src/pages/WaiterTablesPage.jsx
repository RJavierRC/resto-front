import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getTables, openTable, closeOrder } from "../api/api";
import TableCard from "../components/TableCard";
import ProductSearchModal from "../components/ProductSearchModal";
import CloseOrderModal from "../components/CloseOrderModal";
import OrderSummaryModal from "../components/OrderSummaryModal";
import Spinner from "../components/Spinner";

export default function WaiterTablesPage() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [orderModal, setOrderModal] = useState(null);
  const [closeModal, setCloseModal] = useState(null);
  const [summaryModal, setSummaryModal] = useState(null);

  const load = async () => {
    setLoading(true);
    try { 
      const data = await getTables();
      console.log("🔍 Datos recibidos del backend:", data);
      
      // Normalizar la estructura de datos para consistencia
      setTables(data.map(table => {
        // Extraer orderId de múltiples posibles ubicaciones
        let orderId = null;
        let order = null;
        
        if (table.order?.id) {
          orderId = table.order.id;
          order = table.order;
        } else if (table.orderId) {
          orderId = table.orderId;
          order = { id: table.orderId };
        }
        
        const normalizedTable = {
          id: table.id,
          number: table.number,
          status: (table.status || "CLOSED").toUpperCase(),
          orderId: orderId,
          order: order
        };
        
        console.log(`🔍 Mesa ${table.number} normalizada:`, normalizedTable);
        return normalizedTable;
      })); 
    } catch (e) { 
      console.error("❌ Error al cargar mesas:", e);
      toast.error(`Error al cargar mesas: ${e.message}`); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { load(); }, []);

  const handleOpen = async (tableId) => {
    try {
      const table = tables.find(t => t.id === tableId);
      if (!table) {
        toast.error("Mesa no encontrada");
        return;
      }
      
      if (table.status !== "FREE") {
        toast.warning("La mesa no está disponible para abrir");
        return;
      }
  
      console.log(`🔄 Abriendo mesa ${table.number} (ID: ${tableId})`);
      const res = await openTable(tableId);
      console.log("🔍 Respuesta completa al abrir mesa:", res);
      
      // Extraer orderId de la respuesta con múltiples fallbacks
      let newOrderId = null;
      let newOrder = null;
      
      if (res.order?.id) {
        newOrderId = res.order.id;
        newOrder = res.order;
      } else if (res.orderId) {
        newOrderId = res.orderId;
        newOrder = { id: res.orderId };
      } else if (res.id) {
        // Si la respuesta es directamente la orden
        newOrderId = res.id;
        newOrder = res;
      } else if (typeof res === 'number') {
        // Si la respuesta es solo el ID numérico
        newOrderId = res;
        newOrder = { id: res };
      }
      
      console.log("🔍 OrderId extraído:", newOrderId);
      console.log("🔍 Order object:", newOrder);
      
      if (!newOrderId) {
        console.error("❌ No se pudo obtener orderId de la respuesta:", res);
        toast.error("Error: No se pudo obtener el ID de la orden");
        await load(); // Recargar para obtener el estado actualizado del servidor
        return;
      }
      
      // Actualizar el estado local inmediatamente
      setTables(prevTables => {
        const updatedTables = prevTables.map(table => 
          table.id === tableId 
            ? { 
                ...table, 
                status: "OCCUPIED", 
                orderId: newOrderId,
                order: newOrder
              } 
            : table
        );
        console.log("🔍 Estado de mesas actualizado:", updatedTables);
        return updatedTables;
      });
      
      // Abrir modal para agregar productos
      setOrderModal(newOrderId);
      toast.success(`Mesa ${table.number} abierta correctamente`);
      
    } catch (e) {
      console.error("❌ Error completo al abrir mesa:", e);
      toast.error(`Error al abrir mesa: ${e.message}`);
      // Recargar estado en caso de error para sincronizar con el servidor
      await load();
    }
  };

  const handleCloseSuccess = (tableId) => {
    console.log(`✅ Cerrando mesa exitosamente - ID: ${tableId}`);
    setTables(prevTables => prevTables.map(t => 
      t.id === tableId 
        ? { ...t, status: "FREE", orderId: null, order: null } 
        : t
    ));
    setCloseModal(null);
    toast.success("Orden cerrada y mesa liberada");
  };

  const handleForceClose = async (tableId) => {
    const table = tables.find(t => t.id === tableId);
    if (!confirm(`¿Estás seguro de marcar la Mesa ${table?.number} como libre?`)) return;
    
    try {
      console.log(`🔄 Liberando mesa forzosamente - ID: ${tableId}`);
      setTables(prevTables => prevTables.map(t => 
        t.id === tableId ? { ...t, status: "FREE", orderId: null, order: null } : t
      ));
      
      toast.success("✅ Mesa liberada");
    } catch (error) {
      console.error("❌ Error al liberar mesa:", error);
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
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          🔄 {loading ? "Cargando..." : "Refrescar"}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Spinner />
          <span className="ml-3 text-gray-600">Cargando mesas...</span>
        </div>
      ) : tables.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-xl">No hay mesas disponibles</p>
          <button 
            onClick={load}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Recargar
          </button>
        </div>
      ) : (
        <div className="grid gap-4" style={{gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))"}}>
          {tables.map(t => (
            <TableCard
              key={`table-${t.id}-${t.status}-${t.orderId || 'no-order'}`}
              table={t}
              onOpen={handleOpen}
              onAddItem={(oid) => {
                console.log("🔵 Abriendo modal para agregar item - OrderID:", oid);
                setOrderModal(oid);
              }}
              onClose={(oid, tid) => {
                console.log("🔴 Intentando cerrar - OrderID:", oid, "TableID:", tid);
                if (oid) {
                  setCloseModal({ orderId: oid, tableId: tid });
                } else {
                  handleForceClose(tid);
                }
              }}
              onViewOrder={(oid) => {
                console.log("👁️ Abriendo resumen de orden - OrderID:", oid);
                setSummaryModal(oid);
              }}
            />
          ))}
        </div>
      )}

      {/* Modales */}
      {orderModal && (
  <ProductSearchModal
    orderId={orderModal}
    onClose={() => { 
      console.log("✅ Cerrando modal de productos");
      setOrderModal(null); 
    }}
    onItemAdded={async () => {
      console.log("🔄 Producto agregado, actualizando mesas...");
      await load(); // Recargar todas las mesas para mostrar el producto agregado
    }}
  />
)}

      {closeModal && (
        <CloseOrderModal
          orderId={closeModal.orderId}
          onClose={() => {
            console.log("✅ Cerrando modal de cierre");
            setCloseModal(null);
          }}
          onSuccess={() => {
            console.log("✅ Orden cerrada exitosamente");
            handleCloseSuccess(closeModal.tableId);
          }}
        />
      )}

      {summaryModal && (
        <OrderSummaryModal
          orderId={summaryModal}
          onClose={() => {
            console.log("✅ Cerrando modal de resumen");
            setSummaryModal(null);
          }}
        />
      )}
    </>
  );
}