import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById, updateProduct } from '../../firebase/products';
import type { Product } from '../../types';
import ProductForm from '../../components/admin/ProductForm';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function EditProduct() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    getProductById(id)
      .then(setProduct)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!id) return;
    setSaving(true);
    try {
      await updateProduct(id, data);
      navigate('/admin/products');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!product) return <div className="text-center py-10 text-gray-500">Producto no encontrado</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-gray-900">Editar Producto</h1>
        <p className="text-gray-500 text-sm">Modifica los datos de: {product.name}</p>
      </div>
      <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8">
        <ProductForm initial={product} onSubmit={handleSubmit} loading={saving} />
      </div>
    </div>
  );
}
