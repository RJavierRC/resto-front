export default function TableCard({ table, onOpen, onAddItem, onClose, onViewOrder }) {
  const status = (table.status || "CLOSED").toUpperCase();
  const orderId = table.orderId; // Usar directamente orderId normalizado
  
  // 🔍 DEBUG: Logs detallados para diagnóstico
  console.log("🔍 TableCard Debug:", {
    tableId: table.id,
    tableNumber: table.number,
    status: status,
    orderId: orderId,
    hasOrderId: !!orderId,
    orderIdType: typeof orderId,
    rawTable: table
  });
  
  const statusConfig = {
    FREE: { 
      color: "bg-gradient-to-br from-green-500 to-green-600", 
      text: "Libre",
      icon: "✅"
    },
    BUSY: { 
      color: "bg-gradient-to-br from-red-500 to-red-600", 
      text: "Ocupada",
      icon: "🍽️"
    },
    OCCUPIED: { 
      color: "bg-gradient-to-br from-red-500 to-red-600", 
      text: "Ocupada",
      icon: "🍽️"
    },
    CLOSED: { 
      color: "bg-gradient-to-br from-gray-400 to-gray-500", 
      text: "Cerrada",
      icon: "🔒"
    },
  };

  const config = statusConfig[status] || statusConfig.CLOSED;
  
  // Determinar si la mesa está ocupada y tiene una orden válida
  const isOccupied = (status === "OCCUPIED" || status === "BUSY");
  const hasValidOrder = orderId !== null && orderId !== undefined;
  const canPerformOrderActions = isOccupied && hasValidOrder;

  console.log("🔍 Estado de la mesa:", {
    isOccupied,
    hasValidOrder,
    canPerformOrderActions,
    orderId
  });

  return (
    <div 
      className={`${config.color} rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1`}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Mesa {table.number}</h2>
        <span className="text-2xl">{config.icon}</span>
      </div>
      
      <div className="mb-4">
        <p className="text-white/90 font-medium">{config.text}</p>
        {isOccupied && (
          <p className="text-white/70 text-sm mt-1">
            {hasValidOrder ? `Orden: #${orderId}` : "⚠️ Sin orden válida"}
          </p>
        )}
      </div>

      <div className="space-y-2">
        {status === "FREE" ? (
          <button 
            onClick={() => {
              console.log("🟢 Intentando abrir mesa:", table.number);
              onOpen(table.id);
            }}
            className="w-full bg-white/20 hover:bg-white/30 text-white py-2 rounded-lg transition-colors font-medium backdrop-blur-sm"
          >
            Abrir Mesa
          </button>
        ) : (
          <>
            {/* Botón Agregar Producto */}
            <button 
              onClick={() => {
                console.log("🔵 Agregar Producto - Mesa:", table.number, "OrderID:", orderId);
                if (!canPerformOrderActions) {
                  console.error("❌ No se puede agregar producto - No hay orden válida");
                  alert(`Error: No hay una orden válida para la Mesa ${table.number}`);
                  return;
                }
                onAddItem(orderId);
              }}
              disabled={!canPerformOrderActions}
              className={`w-full py-2 rounded-lg transition-colors font-medium backdrop-blur-sm ${
                canPerformOrderActions 
                  ? "bg-white/20 hover:bg-white/30 text-white cursor-pointer" 
                  : "bg-white/10 text-white/50 cursor-not-allowed"
              }`}
              title={!canPerformOrderActions ? "No hay orden válida" : "Agregar producto a la orden"}
            >
              + Agregar Producto
            </button>
            
            {/* Botón Ver Orden */}
            {onViewOrder && (
              <button 
                onClick={() => {
                  console.log("👁️ Ver Orden - Mesa:", table.number, "OrderID:", orderId);
                  if (!canPerformOrderActions) {
                    console.error("❌ No se puede ver orden - No hay orden válida");
                    alert(`Error: No hay una orden válida para la Mesa ${table.number}`);
                    return;
                  }
                  onViewOrder(orderId);
                }}
                disabled={!canPerformOrderActions}
                className={`w-full py-2 rounded-lg transition-colors font-medium backdrop-blur-sm ${
                  canPerformOrderActions 
                    ? "bg-white/10 hover:bg-white/20 text-white cursor-pointer" 
                    : "bg-white/5 text-white/50 cursor-not-allowed"
                }`}
                title={!canPerformOrderActions ? "No hay orden válida" : "Ver detalles de la orden"}
              >
                👁️ Ver Orden
              </button>
            )}
            
            {/* Botón Cerrar Orden */}
            <button 
              onClick={() => {
                console.log("🔴 Cerrar Orden - Mesa:", table.number, "OrderID:", orderId);
                if (!canPerformOrderActions) {
                  console.warn("⚠️ No hay orden válida - Permitiendo cierre forzoso");
                  if (confirm(`¿Cerrar forzosamente la Mesa ${table.number}? (No hay orden válida)`)) {
                    onClose(null, table.id); // Cierre forzoso sin orderId
                  }
                  return;
                }
                onClose(orderId, table.id);
              }}
              className="w-full bg-white hover:bg-white/90 text-red-600 py-2 rounded-lg transition-colors font-medium"
              title={canPerformOrderActions ? "Cerrar orden y liberar mesa" : "Cerrar mesa (forzoso)"}
            >
              {canPerformOrderActions ? "Cerrar Orden" : "Liberar Mesa"}
            </button>
          </>
        )}
      </div>
      
      {/* Indicador de estado para debugging */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-2 text-xs text-white/50 border-t border-white/20 pt-2">
          Debug: ID={table.id} | Status={status} | OrderID={orderId || 'null'}
        </div>
      )}
    </div>
  );
}