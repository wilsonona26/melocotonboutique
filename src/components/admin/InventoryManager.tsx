import { useState } from 'react';
import type { Product } from '../../types';
import { updateStock } from '../../firebase/products';
import { addInventoryMovement } from '../../firebase/inventory';
import { formatCurrency } from '../../utils/formatters';
import { useToast } from '../common/Toast';
import { useAuth } from '../../context/AuthContext';

interface Props {
  products: Product[];
  onRefresh: () => void;
}

export default function InventoryManager({ products, onRefresh }: Props) {
  const [editing, setEditing] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const handleSave = async (product: Product) => {
    const newQty = editing[product.id];
    if (newQty === undefined || newQty < 0) return;
    setSaving(product.id);
    try {
      await updateStock(product.id, newQty);
      // Log inventory movement
      const diff = newQty - product.stock;
      await addInventoryMovement({
        productId: product.id,
        productName: product.name,
        type: diff > 0 ? 'in' : diff < 0 ? 'out' : 'adjustment',
        quantity: Math.abs(diff),
        previousStock: product.stock,
        newStock: newQty,
        reason: 'Ajuste manual de inventario',
        createdBy: currentUser?.email || 'admin',
      });
      showToast(`Stock actualizado: ${product.name}`);
      onRefresh();
      setEditing(prev => { const n = { ...prev }; delete n[product.id]; return n; });
    } catch {
      showToast('Error al actualizar stock', 'error');
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 font-semibold text-gray-600">Código</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-600">Producto</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-600">Categoría</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-600">Precio</th>
            <th className="text-center py-3 px-4 font-semibold text-gray-600">Stock</th>
            <th className="text-center py-3 px-4 font-semibold text-gray-600">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {products.map(product => {
            const isEditing = editing[product.id] !== undefined;
            const stockVal = isEditing ? editing[product.id] : product.stock;
            return (
              <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4 font-mono text-gray-500">{product.code}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={product.images?.[0] || 'https://placehold.co/40x40/FDE8E8/E76F51?text=?'}
                      alt={product.name}
                      className="w-10 h-10 object-cover rounded-lg flex-shrink-0"
                    />
                    <span className="font-medium text-gray-900 line-clamp-1">{product.name}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-gray-500">{product.category}</td>
                <td className="py-3 px-4 font-medium text-primary-600">{formatCurrency(product.publicPrice)}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-center">
                    {isEditing ? (
                      <input
                        type="number"
                        min="0"
                        value={stockVal}
                        onChange={e => setEditing(prev => ({ ...prev, [product.id]: parseInt(e.target.value) || 0 }))}
                        className="w-20 border border-primary-300 rounded-lg px-2 py-1 text-center focus:outline-none focus:ring-2 focus:ring-primary-300"
                      />
                    ) : (
                      <span className={`font-bold text-base ${
                        product.stock === 0 ? 'text-red-500' :
                        product.stock <= 5 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {product.stock}
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-center gap-2">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => handleSave(product)}
                          disabled={saving === product.id}
                          className="text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {saving === product.id ? '...' : 'Guardar'}
                        </button>
                        <button
                          onClick={() => setEditing(prev => { const n = { ...prev }; delete n[product.id]; return n; })}
                          className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded-lg transition-colors"
                        >
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setEditing(prev => ({ ...prev, [product.id]: product.stock }))}
                        className="text-xs bg-primary-100 hover:bg-primary-200 text-primary-700 px-3 py-1 rounded-lg transition-colors"
                      >
                        Editar Stock
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
