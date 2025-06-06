import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { getOrder, deleteItem } from "../api/api";

export default function OrderSummaryModal({ orderId, onClose }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrderDetails();
  }, [orderId]);

  const loadOrderDetails = async () => {
    try {
      setLoading(true);
      const data = await getOrder(orderId);
      console.log("🔍 Orden cargada:", data);
      setOrder(data);
    } catch (err) {
      console.error('❌ Error loading order:', err);
      toast.error(`Error al cargar orden: ${err.message}`);
      // NO usar datos de ejemplo - mostrar error real
      setOrder({ id: orderId, items: [], total: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!confirm("¿Estás seguro de eliminar este producto?")) return;
    
    try {
      console.log(`🗑️ Eliminando item ${itemId} de orden ${orderId}`);
      const updatedOrder = await deleteItem(orderId, itemId);
      setOrder(updatedOrder);
      toast.success("Producto eliminado");
    } catch (err) {
      console.error('❌ Error deleting item:', err);
      toast.error(`Error al eliminar: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-xl p-8">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">Cargando orden...</p>
        </div>
      </div>
    );
  }

  const total = order?.total || 0;

  return (
    <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden animate-fade-in">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div>
            <h2 className="text-xl font-bold">Resumen de Orden</h2>
            <p className="text-blue-100">Orden #{orderId}</p>
          </div>
          <button 
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto max-h-96">
          {order?.items?.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {order.items.map((item) => (
                <div key={item.id} className="p-4 flex justify-between items-center hover:bg-gray-50 group">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800">{item.name}</h3>
                    <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-medium text-gray-800">${(item.price * item.quantity).toFixed(2)}</p>
                      <p className="text-xs text-gray-500">${item.price.toFixed(2)} c/u</p>
                    </div>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 text-white p-1 rounded text-sm"
                      title="Eliminar producto"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                🍽️
              </div>
              <p>No hay productos en esta orden</p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center text-lg font-bold text-gray-800">
            <span>Total:</span>
            <span className="text-blue-600">${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}