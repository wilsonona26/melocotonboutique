import { useEffect, useState } from 'react';
import { getAllOrders } from '../../firebase/orders';
import type { Order } from '../../types';
import OrdersTable from '../../components/admin/OrdersTable';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getAllOrders()
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-gray-900">Pedidos</h1>
        <p className="text-gray-500 text-sm">{orders.length} pedidos en total</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner />
        ) : orders.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">📋</p>
            <p>No hay pedidos aún</p>
          </div>
        ) : (
          <OrdersTable orders={orders} onRefresh={load} />
        )}
      </div>
    </div>
  );
}
