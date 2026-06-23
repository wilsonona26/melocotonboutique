import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserOrders } from '../firebase/orders';
import type { Order } from '../types';
import { formatCurrency, formatDate, formatOrderStatus, formatOrderStatusColor } from '../utils/formatters';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function OrderHistory() {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    getUserOrders(currentUser.uid)
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [currentUser]);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="section-title mb-8">Mis Pedidos</h1>

        {loading ? (
          <LoadingSpinner />
        ) : orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
            <p className="text-5xl mb-4">📦</p>
            <h3 className="font-display font-semibold text-xl text-gray-700 mb-2">No tienes pedidos aún</h3>
            <p className="text-gray-400 mb-6">¡Haz tu primera compra!</p>
            <Link to="/catalog" className="btn-primary">Explorar Catálogo</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100">
                  <div>
                    <p className="font-mono text-xs text-gray-400 mb-0.5"># {order.id.slice(0, 12)}...</p>
                    <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`badge ${formatOrderStatusColor(order.status)}`}>
                      {formatOrderStatus(order.status)}
                    </span>
                    <span className="font-bold text-primary-600 text-lg">{formatCurrency(order.total)}</span>
                  </div>
                </div>
                <div className="p-5">
                  <div className="space-y-3">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <img
                          src={item.image || 'https://placehold.co/48x48/FDE8E8/E76F51?text=?'}
                          alt={item.productName}
                          className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.productName}</p>
                          <p className="text-xs text-gray-400">Cant: {item.quantity} · {formatCurrency(item.price)}</p>
                        </div>
                        <span className="text-sm font-bold text-gray-700">{formatCurrency(item.subtotal)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-500">
                      <span>💳 ****{order.paymentInfo.lastFourDigits}</span>
                      <span className={order.paymentInfo.status === 'approved' ? 'text-green-600 font-medium' : 'text-red-500'}>
                        {order.paymentInfo.status === 'approved' ? '✓ Aprobado' : '✗ Rechazado'}
                      </span>
                    </div>
                    <span className="text-gray-500 text-xs">
                      Envío: {order.shipping === 0 ? 'Gratis' : formatCurrency(order.shipping)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
