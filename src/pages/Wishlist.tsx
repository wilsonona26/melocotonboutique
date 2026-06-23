import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserWishlist, removeFromWishlist } from '../firebase/wishlist';
import { getProductById } from '../firebase/products';
import type { Product, WishlistItem } from '../types';
import { HeartIcon, TrashIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import { useCart } from '../context/CartContext';
import { useToast } from '../components/common/Toast';
import { ProductGridSkeleton } from '../components/common/LoadingSkeleton';

export default function Wishlist() {
  const { currentUser: user } = useAuth();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const [items, setItems] = useState<(WishlistItem & { product?: Product })[]>([]);
  const [loading, setLoading] = useState(true);

  const loadWishlist = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const wishlistItems = await getUserWishlist(user.uid);
      const withProducts = await Promise.all(
        wishlistItems.map(async (item) => {
          const product = await getProductById(item.productId);
          return { ...item, product: product ?? undefined };
        })
      );
      setItems(withProducts.filter(i => i.product));
    } catch {
      showToast('Error al cargar favoritos', 'error');
    } finally {
      setLoading(false);
    }
  }, [user, showToast]);

  useEffect(() => {
    if (!user) return;
    loadWishlist();
  }, [user, loadWishlist]);

  async function handleRemove(productId: string) {
    if (!user) return;
    await removeFromWishlist(user.uid, productId);
    setItems(prev => prev.filter(i => i.productId !== productId));
    showToast('Eliminado de favoritos');
  }

  function handleAddToCart(product: Product) {
    addToCart(product);
    showToast('Agregado al carrito 🛒');
  }

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="font-display font-bold text-2xl text-gray-900 mb-6">Mis Favoritos</h1>
      <ProductGridSkeleton count={4} />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <HeartIcon className="w-6 h-6 text-red-500" />
        <h1 className="font-display font-bold text-2xl text-gray-900">Mis Favoritos</h1>
        <span className="badge badge-primary">{items.length}</span>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <HeartIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">No tienes productos en favoritos</p>
          <Link to="/catalog" className="btn-primary inline-block">Explorar Catálogo</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map(item => item.product && (
            <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group">
              <Link to={`/product/${item.product.id}`} className="block">
                <div className="relative h-56 bg-gray-100">
                  {item.product.images[0] ? (
                    <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">🛍️</div>
                  )}
                </div>
              </Link>
              <div className="p-4">
                <Link to={`/product/${item.product.id}`}>
                  <h3 className="font-semibold text-gray-900 line-clamp-1 hover:text-primary-600">{item.product.name}</h3>
                </Link>
                <p className="text-primary-600 font-bold mt-1">${item.product.publicPrice.toFixed(2)}</p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleAddToCart(item.product!)}
                    className="flex-1 btn-primary text-xs py-2 flex items-center justify-center gap-1"
                  >
                    <ShoppingCartIcon className="w-4 h-4" /> Agregar
                  </button>
                  <button
                    onClick={() => handleRemove(item.productId)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
