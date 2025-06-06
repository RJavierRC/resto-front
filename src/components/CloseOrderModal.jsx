import { useState } from "react";
import { closeOrder } from "../api/api";
import { toast } from "react-toastify";

export default function CloseOrderModal({ orderId, onClose, onSuccess }) {
  const [tip, setTip] = useState(0);
  const [paymentType, setPaymentType] = useState("CASH");
  const [loading, setLoading] = useState(false);

  const handleClose = async () => {
    setLoading(true);
    try {
      // Asegurar que tip sea número (incluso si es string vacío)
      const numericTip = Number(tip) || 0;
      
      // Verificar orderId antes de enviar
      if (!orderId) {
        throw new Error("No se proporcionó ID de orden");
      }

      console.log("Enviando:", { 
        orderId, 
        tip: numericTip, 
        paymentType 
      });

      await closeOrder(
        orderId.toString(),  // Asegurar string
        numericTip,         // Número garantizado
        paymentType         // String ("CASH", "CARD", etc.)
      );
      
      toast.success("Orden cerrada exitosamente");
      onSuccess();
    } catch (err) {
      console.error("Error al cerrar orden:", err);
      toast.error(`Error al cerrar orden: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-fade-in">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Cerrar Orden</h2>
          <p className="text-sm text-gray-600 mt-1">Orden #{orderId}</p>
        </div>

        <div className="p-6 space-y-4">
          {/* Propina */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Propina (opcional)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={tip}
                onChange={(e) => setTip(parseFloat(e.target.value) || 0)}
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Método de pago */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Método de pago
            </label>
            <select
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="CASH">Efectivo</option>
              <option value="CARD">Tarjeta</option>
              <option value="TRANSFER">Transferencia</option>
            </select>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleClose}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              "Cerrar Orden"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}