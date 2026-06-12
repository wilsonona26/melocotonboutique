import { XMarkIcon, MinusIcon, PlusIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../utils/formatters';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CartSidebar({ open, onClose }: Props) {
  const { items, updateQuantity, removeFromCart, totalPrice, totalItems } = useCart();

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingBagIcon className="w-5 h-5 text-primary-500" />
            <h2 className="font-display font-bold text-lg">Carrito ({totalItems})</h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingBagIcon className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-400 font-medium">Tu carrito está vacío</p>
              <p className="text-gray-300 text-sm mt-1">¡Agrega algunos productos!</p>
              <Link
                to="/catalog"
                onClick={onClose}
                className="btn-primary inline-block mt-6 text-sm"
              >
                Ver Catálogo
              </Link>
            </div>
          ) : (
            items.map(({ product, quantity }) => (
              <div key={product.id} className="flex gap-3">
                <img
                  src={product.images?.[0] || 'https://placehold.co/80x80/FDE8E8/E76F51?text=?'}
                  alt={product.name}
                  className="w-20 h-20 object-cover rounded-xl flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug">{product.name}</h4>
                  <p className="text-xs text-gray-400 mt-0.5">{product.code}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1 border border-gray-200 rounded-lg">
                      <button
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="p-1 hover:bg-gray-50 transition-colors"
                      >
                        <MinusIcon className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-sm font-medium px-2">{quantity}</span>
                      <button
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        disabled={quantity >= product.stock}
                        className="p-1 hover:bg-gray-50 transition-colors disabled:opacity-40"
                      >
                        <PlusIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="font-bold text-primary-600 text-sm">
                      {formatCurrency(product.publicPrice * quantity)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => removeFromCart(product.id)}
                  className="self-start p-1 text-gray-300 hover:text-red-400 transition-colors mt-0.5"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 px-6 py-4 space-y-3">
            <div className="flex items-center justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-primary-600">{formatCurrency(totalPrice)}</span>
            </div>
            <Link
              to="/checkout"
              onClick={onClose}
              className="btn-primary w-full text-center block"
            >
              Proceder al Pago
            </Link>
            <Link
              to="/cart"
              onClick={onClose}
              className="btn-outline w-full text-center block text-sm"
            >
              Ver Carrito Completo
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
