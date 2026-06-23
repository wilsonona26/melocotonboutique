import { Link } from 'react-router-dom';
import { MinusIcon, PlusIcon, TrashIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/formatters';

export default function Cart() {
  const { items, updateQuantity, removeFromCart, totalPrice, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <ShoppingBagIcon className="w-24 h-24 text-gray-200 mx-auto mb-4" />
          <h2 className="font-display font-bold text-2xl text-gray-700 mb-2">Tu carrito está vacío</h2>
          <p className="text-gray-400 mb-6">¡Agrega productos para comenzar!</p>
          <Link to="/catalog" className="btn-primary">Ir al Catálogo</Link>
        </div>
      </div>
    );
  }

  const shipping = totalPrice >= 50 ? 0 : 5;
  const total = totalPrice + shipping;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="section-title mb-8">Mi Carrito</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="bg-white rounded-2xl shadow-sm p-4 flex gap-4">
                <img
                  src={product.images?.[0] || 'https://placehold.co/80x80/FDE8E8/E76F51?text=?'}
                  alt={product.name}
                  className="w-24 h-24 object-cover rounded-xl flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400 mb-0.5">{product.category} · {product.code}</p>
                  <h3 className="font-medium text-gray-900 line-clamp-2">{product.name}</h3>
                  <p className="font-bold text-primary-600 mt-1">{formatCurrency(product.publicPrice)}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="p-1.5 hover:bg-gray-50 transition-colors"
                      >
                        <MinusIcon className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-sm font-medium">{quantity}</span>
                      <button
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        disabled={quantity >= product.stock}
                        className="p-1.5 hover:bg-gray-50 transition-colors disabled:opacity-40"
                      >
                        <PlusIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="font-bold text-gray-700">{formatCurrency(product.publicPrice * quantity)}</span>
                  </div>
                </div>
                <button
                  onClick={() => removeFromCart(product.id)}
                  className="self-start p-1.5 text-gray-300 hover:text-red-400 transition-colors"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            ))}
            <button onClick={clearCart} className="text-sm text-red-400 hover:text-red-600 transition-colors">
              Vaciar carrito
            </button>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
              <h2 className="font-display font-bold text-lg mb-4">Resumen</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Envío</span>
                  <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>
                    {shipping === 0 ? 'Gratis' : formatCurrency(shipping)}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-gray-400">Envío gratis en compras mayores a $50</p>
                )}
                <hr className="border-gray-100 my-2" />
                <div className="flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span className="text-primary-600">{formatCurrency(total)}</span>
                </div>
              </div>
              <Link to="/checkout" className="btn-primary w-full text-center block mt-6">
                Proceder al Pago
              </Link>
              <Link to="/catalog" className="btn-ghost w-full text-center block mt-2 text-sm">
                Seguir Comprando
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
