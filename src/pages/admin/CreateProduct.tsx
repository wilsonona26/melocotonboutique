import { useNavigate } from 'react-router-dom';
import { createProduct } from '../../firebase/products';
import ProductForm from '../../components/admin/ProductForm';
import type { Product } from '../../types';
import { useState } from 'react';

export default function CreateProduct() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    setLoading(true);
    try {
      await createProduct(data);
      navigate('/admin/products');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-gray-900">Crear Producto</h1>
        <p className="text-gray-500 text-sm">Agrega un nuevo producto al catálogo</p>
      </div>
      <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8">
        <ProductForm onSubmit={handleSubmit} loading={loading} />
      </div>
    </div>
  );
}
