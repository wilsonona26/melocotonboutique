import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getOrderStats, getAllOrders } from '../../firebase/orders';
import { getAllProducts, getLowStockProducts } from '../../firebase/products';
import SalesChart from '../../components/admin/SalesChart';
import { DashboardSkeleton } from '../../components/common/LoadingSkeleton';
import type { Product, Order } from '../../types';
import { CurrencyDollarIcon, ShoppingBagIcon, UsersIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function Dashboard() {
  const [stats, setStats] = useState({ totalOrders: 0, totalRevenue: 0, totalCustomers: 0, pendingOrders: 0, monthlyRevenue: 0, weeklyRevenue: 0 });
  const [productCount, setProductCount] = useState(0);
  const [lowStock, setLowStock] = useState<Product[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getOrderStats(), getAllProducts(), getLowStockProducts(), getAllOrders()])
      .then(([s, products, low, orders]) => {
        setStats(s);
        setProductCount(products.length);
        setLowStock(low);
        setRecentOrders(orders.slice(0, 5));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;

  const statCards = [
    { label: 'Ventas Totales', value: `$${stats.totalRevenue.toFixed(2)}`, icon: CurrencyDollarIcon, color: 'text-green-600 bg-green-50' },
    { label: 'Pedidos Totales', value: stats.totalOrders, icon: ShoppingBagIcon, color: 'text-blue-600 bg-blue-50' },
    { label: 'Clientes', value: stats.totalCustomers, icon: UsersIcon, color: 'text-purple-600 bg-purple-50' },
    { label: 'Ingresos del Mes', value: `$${stats.monthlyRevenue.toFixed(2)}`, icon: CurrencyDollarIcon, color: 'text-primary-600 bg-primary-50' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm">Resumen general de Melocoton Boutique</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-lg ${card.color}`}>
                <card.icon className="w-5 h-5" />
              </div>
              <h3 className="font-medium text-gray-500 text-sm">{card.label}</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <h3 className="font-semibold text-gray-700 mb-4">Estadísticas de Ingresos</h3>
          <SalesChart stats={stats} />
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <h3 className="font-semibold text-gray-700 mb-4">Resumen Semanal</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Ingresos esta semana</span>
              <span className="font-bold text-green-600">${stats.weeklyRevenue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Pedidos pendientes</span>
              <span className="font-bold text-yellow-600">{stats.pendingOrders}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Total productos</span>
              <span className="font-bold text-blue-600">{productCount}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Productos bajo stock</span>
              <span className="font-bold text-red-600">{lowStock.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {lowStock.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-red-100">
          <div className="flex items-center gap-2 mb-4">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
            <h3 className="font-semibold text-red-700">Alertas de Stock Bajo</h3>
          </div>
          <div className="space-y-2">
            {lowStock.slice(0, 10).map(p => (
              <div key={p.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {p.images[0] && <img src={p.images[0]} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />}
                  <div>
                    <p className="font-medium text-sm text-gray-900">{p.name}</p>
                    <p className="text-xs text-gray-500">SKU: {p.sku || p.code}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-red-600">{p.stock} unidades</p>
                  <Link to={`/admin/products/${p.id}/edit`} className="text-xs text-primary-600 hover:underline">Editar</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Orders */}
      {recentOrders.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-700">Pedidos Recientes</h3>
            <Link to="/admin/orders" className="text-sm text-primary-600 hover:underline">Ver todos</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-2 font-medium">Cliente</th>
                  <th className="pb-2 font-medium">Total</th>
                  <th className="pb-2 font-medium">Estado</th>
                  <th className="pb-2 font-medium">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(o => (
                  <tr key={o.id} className="border-b border-gray-50">
                    <td className="py-2">{o.customerInfo.firstName} {o.customerInfo.lastName}</td>
                    <td className="py-2 font-medium">${o.total.toFixed(2)}</td>
                    <td className="py-2">
                      <span className={`badge ${o.status === 'delivered' ? 'badge-success' : o.status === 'pending' ? 'badge-warning' : o.status === 'cancelled' ? 'badge-error' : 'badge-info'}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="py-2 text-gray-500">{o.createdAt instanceof Date ? o.createdAt.toLocaleDateString() : new Date(o.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link to="/admin/products/create" className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:border-primary-300 transition-colors group">
          <h3 className="font-semibold text-gray-700 mb-1 group-hover:text-primary-600">+ Nuevo Producto</h3>
          <p className="text-sm text-gray-400">Agregar al catálogo</p>
        </Link>
        <Link to="/admin/orders" className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:border-primary-300 transition-colors group">
          <h3 className="font-semibold text-gray-700 mb-1 group-hover:text-primary-600">Gestionar Pedidos</h3>
          <p className="text-sm text-gray-400">{stats.pendingOrders} pendientes</p>
        </Link>
        <Link to="/admin/marketing" className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:border-primary-300 transition-colors group">
          <h3 className="font-semibold text-gray-700 mb-1 group-hover:text-primary-600">Marketing</h3>
          <p className="text-sm text-gray-400">Banners y cupones</p>
        </Link>
      </div>
    </div>
  );
}
