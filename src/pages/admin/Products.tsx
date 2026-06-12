import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PencilSquareIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import { getAllProducts, deleteProduct } from '../../firebase/products';
import type { Product } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = () => {
    getAllProducts()
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar "${name}"? Esta acción no se puede deshacer.`)) return;
    setDeleting(id);
    try {
      await deleteProduct(id);
      load();
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-gray-900">Productos</h1>
          <p className="text-gray-500 text-sm">{products.length} productos registrados</p>
        </div>
        <Link to="/admin/products/create" className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-4 h-4" /> Nuevo Producto
        </Link>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Producto</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Código</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Categoría</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-600">Precio</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-600">Stock</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-600">Estado</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.images?.[0] || 'https://placehold.co/40x40/FDE8E8/E76F51?text=?'}
                          alt={p.name}
                          className="w-10 h-10 object-cover rounded-lg flex-shrink-0"
                        />
                        <span className="font-medium text-gray-900 line-clamp-1">{p.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-gray-500 text-xs">{p.code}</td>
                    <td className="py-3 px-4 text-gray-500">{p.category}</td>
                    <td className="py-3 px-4 text-right font-medium text-primary-600">{formatCurrency(p.publicPrice)}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`font-bold ${p.stock === 0 ? 'text-red-500' : p.stock <= 5 ? 'text-yellow-600' : 'text-green-600'}`}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`badge ${p.active ? 'badge-success' : 'badge-error'}`}>
                        {p.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          to={`/admin/products/${p.id}/edit`}
                          className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <PencilSquareIcon className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          disabled={deleting === p.id}
                          className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {products.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-3">📦</p>
              <p>No hay productos aún</p>
              <Link to="/admin/products/create" className="btn-primary inline-block mt-4 text-sm">
                Crear primer producto
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
