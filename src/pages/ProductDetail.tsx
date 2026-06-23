import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeftIcon, ChevronRightIcon, ShoppingBagIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/outline';
import { getProductById } from '../firebase/products';
import type { Product } from '../types';
import { formatCurrency } from '../utils/formatters';
import { useCart } from '../context/CartContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageIdx, setImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!id) return;
    getProductById(id)
      .then(setProduct)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner fullScreen />;
  if (!product) return (
    <div className="min-h-screen flex items-center justify-center flex-col gap-4">
      <p className="text-6xl">😕</p>
      <p className="text-gray-500">Producto no encontrado</p>
      <button onClick={() => navigate('/catalog')} className="btn-primary">Volver al catálogo</button>
    </div>
  );

  const images = product.images?.length > 0
    ? product.images
    : ['https://placehold.co/600x600/FDE8E8/E76F51?text=Sin+imagen'];

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-gray-500 hover:text-primary-600 transition-colors mb-6 text-sm"
        >
          <ChevronLeftIcon className="w-4 h-4" /> Volver
        </button>

        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Gallery */}
            <div className="relative bg-secondary-50">
              <div className="aspect-square relative overflow-hidden">
                <img
                  src={images[imageIdx]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setImageIdx(i => (i - 1 + images.length) % images.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow hover:bg-white transition-colors"
                    >
                      <ChevronLeftIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setImageIdx(i => (i + 1) % images.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow hover:bg-white transition-colors"
                    >
                      <ChevronRightIcon className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 p-4 overflow-x-auto">
                  {images.map((img, i) => (
                    <button
                      key={img}
                      onClick={() => setImageIdx(i)}
                      className={`w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                        i === imageIdx ? 'border-primary-500' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-8 lg:p-12 flex flex-col justify-center">
              <div className="mb-2">
                <span className="badge badge-primary">{product.category}</span>
                <span className="text-gray-400 text-sm ml-2">{product.code}</span>
              </div>
              <h1 className="font-display font-bold text-3xl text-gray-900 mb-3">{product.name}</h1>
              <p className="text-4xl font-bold text-primary-600 mb-4">{formatCurrency(product.publicPrice)}</p>

              <div className={`inline-flex items-center gap-2 text-sm font-medium mb-6 ${
                product.stock > 0 ? 'text-green-600' : 'text-red-500'
              }`}>
                <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                {product.stock > 0
                  ? product.stock <= 5 ? `¡Solo quedan ${product.stock}!` : `${product.stock} en stock`
                  : 'Agotado'}
              </div>

              <p className="text-gray-600 leading-relaxed mb-8">{product.description}</p>

              {product.stock > 0 && (
                <>
                  <div className="flex items-center gap-4 mb-6">
                    <span className="text-sm font-medium text-gray-700">Cantidad:</span>
                    <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                        className="p-3 hover:bg-gray-50 transition-colors"
                      >
                        <MinusIcon className="w-4 h-4" />
                      </button>
                      <span className="px-4 font-medium text-gray-900 min-w-[40px] text-center">{quantity}</span>
                      <button
                        onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                        className="p-3 hover:bg-gray-50 transition-colors"
                        disabled={quantity >= product.stock}
                      >
                        <PlusIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    className={`btn-primary w-full text-base py-3.5 justify-center flex items-center gap-2 ${
                      added ? '!bg-green-500 !hover:bg-green-500' : ''
                    }`}
                  >
                    <ShoppingBagIcon className="w-5 h-5" />
                    {added ? '¡Agregado al carrito!' : 'Agregar al Carrito'}
                  </button>
                </>
              )}

              <div className="mt-6 pt-6 border-t border-gray-100 flex gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">🚚 Envío a todo Ecuador</div>
                <div className="flex items-center gap-2">💳 Pago seguro</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
