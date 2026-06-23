import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBagIcon } from '@heroicons/react/24/outline';
import type { Product } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { useCart } from '../../context/CartContext';
import WishlistButton from './WishlistButton';

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (product.stock === 0) return;
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const mainImage = product.images?.[0] || 'https://placehold.co/400x400/1A1A1A/FF008C?text=Sin+imagen';

  return (
    <Link to={`/product/${product.id}`} className="group block">
      <div className="card overflow-hidden">
        {/* Image */}
        <div className="relative overflow-hidden aspect-square bg-gray-100">
          <img
            src={mainImage}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-semibold text-sm bg-gray-800 px-3 py-1 rounded-full">Agotado</span>
            </div>
          )}
          {product.stock > 0 && product.stock <= 5 && (
            <span className="absolute top-2 left-2 badge badge-warning text-xs">Últimas {product.stock}</span>
          )}
          {product.featured && (
            <span className="absolute top-2 left-2 badge badge-primary text-xs">⭐ Destacado</span>
          )}
          <WishlistButton productId={product.id} className="absolute top-2 right-2 shadow-sm" />
          <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${
                added
                  ? 'bg-green-500 text-white'
                  : 'bg-primary-500 hover:bg-primary-600 text-white disabled:bg-gray-400'
              }`}
            >
              <ShoppingBagIcon className="w-4 h-4" />
              {added ? '¡Agregado!' : 'Agregar al carrito'}
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <p className="text-xs text-gray-400 mb-1">{product.category} · {product.sku || product.code}</p>
          <h3 className="font-medium text-gray-900 group-hover:text-primary-500 transition-colors line-clamp-2 text-sm leading-snug mb-2">
            {product.name}
          </h3>
          <div className="flex items-center justify-between">
            <span className="font-bold text-primary-500 text-lg">{formatCurrency(product.publicPrice)}</span>
            <span className={`text-xs font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
              {product.stock > 0 ? `${product.stock} disponibles` : 'Agotado'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
