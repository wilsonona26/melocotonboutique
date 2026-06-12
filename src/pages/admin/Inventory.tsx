import { useEffect, useState } from 'react';
import { getAllProducts } from '../../firebase/products';
import type { Product } from '../../types';
import InventoryManager from '../../components/admin/InventoryManager';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function Inventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getAllProducts()
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const lowStock = products.filter(p => p.stock <= 5 && p.stock > 0);
  const outOfStock = products.filter(p => p.stock === 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-gray-900">Inventario</h1>
        <p className="text-gray-500 text-sm">Gestiona el stock de todos los productos</p>
      </div>

      {(lowStock.length > 0 || outOfStock.length > 0) && (
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

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {loading ? <LoadingSpinner /> : <InventoryManager products={products} onRefresh={load} />}
      </div>
    </div>
  );
}
