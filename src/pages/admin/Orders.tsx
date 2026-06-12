import { useEffect, useState } from 'react';
import { getAllOrders, exportOrdersToCSV } from '../../firebase/orders';
import type { Order } from '../../types';
import OrdersTable from '../../components/admin/OrdersTable';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import { useToast } from '../../components/common/Toast';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const { showToast } = useToast();

  const load = () => {
    setLoading(true);
    getAllOrders()
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  const handleExportCSV = () => {
    const csv = exportOrdersToCSV(filteredOrders);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pedidos_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('CSV exportado exitosamente');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-gray-900">Pedidos</h1>
          <p className="text-gray-500 text-sm">{filteredOrders.length} pedidos {filter !== 'all' ? `(${filter})` : 'en total'}</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input-field text-sm py-2 w-auto"
          >
            <option value="all">Todos</option>
            <option value="pending">Pendientes</option>
            <option value="processing">En Proceso</option>
            <option value="shipped">Enviados</option>
            <option value="delivered">Entregados</option>
            <option value="cancelled">Cancelados</option>
          </select>
          <button onClick={handleExportCSV} className="btn-outline text-sm inline-flex items-center gap-2 py-2">
            <ArrowDownTrayIcon className="w-4 h-4" /> Exportar CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6"><TableSkeleton /></div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">📋</p>
            <p>No hay pedidos {filter !== 'all' ? 'con ese estado' : 'aún'}</p>
          </div>
        ) : (
          <OrdersTable orders={filteredOrders} onRefresh={load} />
        )}
      </div>
    </div>
  );
}
