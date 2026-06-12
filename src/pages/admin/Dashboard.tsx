import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getOrderStats } from '../../firebase/orders';
import { getAllProducts } from '../../firebase/products';
import SalesChart from '../../components/admin/SalesChart';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function Dashboard() {
  const [stats, setStats] = useState({ totalOrders: 0, totalRevenue: 0, pendingOrders: 0, monthlyRevenue: 0 });
  const [productCount, setProductCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getOrderStats(), getAllProducts()])
      .then(([s, products]) => {
        setStats(s);
        setProductCount(products.length);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm">Resumen general de Melocoton Boutique</p>
      </div>

      <SalesChart stats={stats} />

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <h3 className="font-semibold text-gray-700 mb-1">Productos</h3>
          <p className="text-3xl font-bold text-primary-600 mb-3">{productCount}</p>
          <Link to="/admin/products/create" className="btn-primary text-sm inline-block">+ Nuevo Producto</Link>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <h3 className="font-semibold text-gray-700 mb-1">Pedidos Pendientes</h3>
          <p className="text-3xl font-bold text-yellow-600 mb-3">{stats.pendingOrders}</p>
          <Link to="/admin/orders" className="btn-outline text-sm inline-block">Ver Pedidos</Link>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <h3 className="font-semibold text-gray-700 mb-1">Inventario</h3>
          <p className="text-sm text-gray-400 mb-3">Gestiona el stock de productos</p>
          <Link to="/admin/inventory" className="btn-outline text-sm inline-block">Gestionar Stock</Link>
        </div>
      </div>
    </div>
  );
}
