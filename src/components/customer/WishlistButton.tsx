import { useState, useEffect } from 'react';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../../context/AuthContext';
import { addToWishlist, removeFromWishlist, isInWishlist } from '../../firebase/wishlist';
import { useToast } from '../common/Toast';

interface WishlistButtonProps {
  productId: string;
  className?: string;
}

export default function WishlistButton({ productId, className = '' }: WishlistButtonProps) {
  const { currentUser: user } = useAuth();
  const { showToast } = useToast();
  const [inWishlist, setInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      isInWishlist(user.uid, productId).then(setInWishlist).catch(console.error);
    }
  }, [user, productId]);

  const toggle = async () => {
    if (!user) {
      showToast('Inicia sesión para agregar a favoritos', 'warning');
      return;
    }
    setLoading(true);
    try {
      if (inWishlist) {
        await removeFromWishlist(user.uid, productId);
        setInWishlist(false);
        showToast('Eliminado de favoritos');
      } else {
        await addToWishlist(user.uid, productId);
        setInWishlist(true);
        showToast('Agregado a favoritos ❤️');
      }
    } catch {
      showToast('Error al actualizar favoritos', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(); }}
      disabled={loading}
      className={`p-2 rounded-full transition-all duration-200 ${inWishlist ? 'text-red-500 bg-red-50' : 'text-gray-400 bg-white/80 hover:text-red-400 hover:bg-red-50'} ${className}`}
      title={inWishlist ? 'Quitar de favoritos' : 'Agregar a favoritos'}
    >
      {inWishlist ? <HeartSolidIcon className="w-5 h-5" /> : <HeartIcon className="w-5 h-5" />}
    </button>
  );
}
