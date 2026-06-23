import { useEffect, useState } from 'react';
import { getAllProducts } from '../../firebase/products';
import { getInventoryHistory } from '../../firebase/inventory';
import type { Product, InventoryMovement } from '../../types';
import InventoryManager from '../../components/admin/InventoryManager';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';

export default function Inventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [history, setHistory] = useState<InventoryMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([getAllProducts(), getInventoryHistory()])
      .then(([prods, hist]) => {
        setProducts(prods);
        setHistory(hist);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const lowStock = products.filter(p => p.stock <= 5 && p.stock > 0);
  const outOfStock = products.filter(p => p.stock === 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-gray-900">Inventario</h1>
          <p className="text-gray-500 text-sm">Gestiona el stock de todos los productos</p>
        </div>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="btn-outline text-sm"
        >
          {showHistory ? 'Ver Stock' : 'Ver Historial'}
        </button>
      </div>

      {(lowStock.length > 0 || outOfStock.length > 0) && !showHistory && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {outOfStock.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
              <h3 className="font-semibold text-red-700 mb-1">⚠️ Agotados ({outOfStock.length})</h3>
              <ul className="text-sm text-red-600 space-y-1">
                {outOfStock.slice(0, 3).map(p => <li key={p.id}>· {p.name}</li>)}
                {outOfStock.length > 3 && <li className="text-red-400">y {outOfStock.length - 3} más...</li>}
              </ul>
            </div>
          )}
          {lowStock.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
              <h3 className="font-semibold text-yellow-700 mb-1">⚡ Stock Bajo ({lowStock.length})</h3>
              <ul className="text-sm text-yellow-600 space-y-1">
                {lowStock.slice(0, 3).map(p => <li key={p.id}>· {p.name} ({p.stock} und.)</li>)}
                {lowStock.length > 3 && <li className="text-yellow-400">y {lowStock.length - 3} más...</li>}
              </ul>
            </div>
          )}
        </div>
      )}

      {showHistory ? (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-700">Historial de Movimientos</h2>
            <p className="text-xs text-gray-400">Registro de todos los cambios de inventario</p>
          </div>
          {loading ? (
            <div className="p-4"><TableSkeleton /></div>
          ) : history.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-2">📋</p>
              <p>No hay movimientos registrados</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Fecha</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Producto</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600">Tipo</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600">Cantidad</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600">Stock Anterior</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600">Stock Nuevo</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Razón</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {history.map(m => (
                    <tr key={m.id} className="hover:bg-gray-50">
                      <td className="py-2 px-4 text-xs text-gray-500">
                        {m.createdAt instanceof Date ? m.createdAt.toLocaleString() : new Date(m.createdAt).toLocaleString()}
                      </td>
                      <td className="py-2 px-4 font-medium text-gray-900">{m.productName}</td>
                      <td className="py-2 px-4 text-center">
                        <span className={`badge ${m.type === 'in' ? 'badge-success' : m.type === 'out' ? 'badge-error' : 'badge-warning'}`}>
                          {m.type === 'in' ? 'Entrada' : m.type === 'out' ? 'Salida' : 'Ajuste'}
                        </span>
                      </td>
                      <td className="py-2 px-4 text-center font-medium">
                        <span className={m.type === 'in' ? 'text-green-600' : 'text-red-600'}>
                          {m.type === 'in' ? '+' : '-'}{m.quantity}
                        </span>
                      </td>
                      <td className="py-2 px-4 text-center text-gray-500">{m.previousStock}</td>
                      <td className="py-2 px-4 text-center font-medium">{m.newStock}</td>
                      <td className="py-2 px-4 text-xs text-gray-500">{m.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {loading ? <div className="p-4"><TableSkeleton /></div> : <InventoryManager products={products} onRefresh={load} />}
        </div>
      )}
    </div>
  );
}
