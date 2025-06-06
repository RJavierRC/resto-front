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

  const load = async () => {
    setLoading(true);
    try { 
      setTables(await getTables()); 
    } catch (e) { 
      toast.error(e.message); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { load(); }, []);

  const handleOpen = async (tableId) => {
    try {
      const res = await openTable(tableId);
      toast.success("Mesa abierta");
      setOrderModal(res.orderId);
    } catch (e) { 
      toast.error(e.message); 
    }
  };

  const handleCloseSuccess = () => {
    setCloseModal(null);
    load();
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
              onClose={(oid) => setCloseModal(oid)} // MODIFICADO
              onViewOrder={(oid) => setSummaryModal(oid)} // NUEVO
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
          orderId={closeModal}
          onClose={() => setCloseModal(null)}
          onSuccess={handleCloseSuccess}
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