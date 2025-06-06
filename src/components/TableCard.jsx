export default function TableCard({ table, onOpen, onAddItem, onClose, onViewOrder }) {
  const status = (table.status || "CLOSED").toUpperCase();
  const orderId = table.order?.id ?? table.orderId;
  
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

  return (
    <div 
      className={`${config.color} rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1`}
      key={`table-${table.id}-${status}`} // Forza re-render al cambiar estado
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Mesa {table.number}</h2>
        <span className="text-2xl">{config.icon}</span>
      </div>
      
      <p className="text-white/90 mb-4 font-medium">{config.text}</p>

      <div className="space-y-2">
  {status === "FREE" ? (
    <button 
      onClick={() => {
        console.log("Intentando abrir mesa:", table); // Debug
        onOpen(table.id);
      }}
      className="w-full bg-white/20 hover:bg-white/30 text-white py-2 rounded-lg transition-colors font-medium backdrop-blur-sm"
    >
      Abrir Mesa
    </button>
  ) : (
          <>
            <button 
              onClick={() => onAddItem(orderId)}
              className="w-full bg-white/20 hover:bg-white/30 text-white py-2 rounded-lg transition-colors font-medium backdrop-blur-sm"
            >
              + Agregar Producto
            </button>
            
            {onViewOrder && (
              <button 
                onClick={() => onViewOrder(orderId)}
                className="w-full bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg transition-colors font-medium backdrop-blur-sm"
              >
                👁️ Ver Orden
              </button>
            )}
            
            <button 
              onClick={() => onClose(orderId, table.id)} // ¡Ahora pasa ambos IDs!
              className="w-full bg-white hover:bg-white/90 text-red-600 py-2 rounded-lg transition-colors font-medium"
            >
              Cerrar Orden
            </button>
          </>
        )}
      </div>
    </div>
  );
}