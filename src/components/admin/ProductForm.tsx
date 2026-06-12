import { useState, useCallback } from 'react';
import type { Product } from '../../types';
import { uploadProductImage, deleteProductImage } from '../../firebase/storage';
import ImageUploader from '../common/ImageUploader';

const CATEGORIES = ['Ropa', 'Accesorios', 'Calzado', 'Bolsos', 'Joyería'];

type ProductInput = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;

interface Props {
  initial?: Product;
  onSubmit: (data: ProductInput) => Promise<void>;
  loading?: boolean;
}

export default function ProductForm({ initial, onSubmit, loading = false }: Props) {
  const [form, setForm] = useState<ProductInput>({
    code: initial?.code ?? '',
    name: initial?.name ?? '',
    description: initial?.description ?? '',
    category: initial?.category ?? CATEGORIES[0],
    publicPrice: initial?.publicPrice ?? 0,
    wholesalePrice: initial?.wholesalePrice ?? 0,
    stock: initial?.stock ?? 0,
    images: initial?.images ?? [],
    active: initial?.active ?? true,
  });
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof ProductInput, string>>>({});

  const tempId = initial?.id ?? 'temp_' + Date.now();

  const set = (key: keyof ProductInput, value: unknown) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: undefined }));
  };

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!form.code.trim()) e.code = 'El código es requerido';
    if (!form.name.trim()) e.name = 'El nombre es requerido';
    if (!form.description.trim()) e.description = 'La descripción es requerida';
    if (form.publicPrice <= 0) e.publicPrice = 'El precio debe ser mayor a 0';
    if (form.stock < 0) e.stock = 'El stock no puede ser negativo';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleUpload = useCallback(async (file: File) => {
    setUploading(true);
    try {
      const url = await uploadProductImage(file, tempId);
      setForm(prev => ({ ...prev, images: [...prev.images, url] }));
    } finally {
      setUploading(false);
    }
  }, [tempId]);

  const handleRemoveImage = useCallback(async (url: string) => {
    setForm(prev => ({ ...prev, images: prev.images.filter(i => i !== url) }));
    await deleteProductImage(url);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(form);
  };

  const inputClass = (key: keyof ProductInput) =>
    `input-field ${errors[key] ? 'border-red-400 focus:ring-red-300' : ''}`;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Code */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Código *</label>
          <input
            type="text"
            value={form.code}
            onChange={e => set('code', e.target.value.toUpperCase())}
            className={inputClass('code')}
            placeholder="EJ: VEST-001"
          />
          {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code}</p>}
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
          <select
            value={form.category}
            onChange={e => set('category', e.target.value)}
            className="input-field"
          >
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Name */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
          <input
            type="text"
            value={form.name}
            onChange={e => set('name', e.target.value)}
            className={inputClass('name')}
            placeholder="Nombre del producto"
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
          <textarea
            value={form.description}
            onChange={e => set('description', e.target.value)}
            rows={4}
            className={`${inputClass('description')} resize-none`}
            placeholder="Describe el producto..."
          />
          {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
        </div>

        {/* Public Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Precio Público *</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.publicPrice}
              onChange={e => set('publicPrice', parseFloat(e.target.value) || 0)}
              className={`${inputClass('publicPrice')} pl-7`}
            />
          </div>
          {errors.publicPrice && <p className="text-red-500 text-xs mt-1">{errors.publicPrice}</p>}
        </div>

        {/* Wholesale Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Precio Mayorista</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.wholesalePrice}
              onChange={e => set('wholesalePrice', parseFloat(e.target.value) || 0)}
              className="input-field pl-7"
            />
          </div>
        </div>

        {/* Stock */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Stock *</label>
          <input
            type="number"
            min="0"
            value={form.stock}
            onChange={e => set('stock', parseInt(e.target.value) || 0)}
            className={inputClass('stock')}
          />
          {errors.stock && <p className="text-red-500 text-xs mt-1">{errors.stock}</p>}
        </div>

        {/* Active */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="active"
            checked={form.active}
            onChange={e => set('active', e.target.checked)}
            className="w-4 h-4 text-primary-500 rounded"
          />
          <label htmlFor="active" className="text-sm font-medium text-gray-700">Producto activo (visible en tienda)</label>
        </div>
      </div>

      {/* Images */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Imágenes del Producto</label>
        <ImageUploader
          images={form.images}
          onUpload={handleUpload}
          onRemove={handleRemoveImage}
          uploading={uploading}
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="submit" disabled={loading || uploading} className="btn-primary px-8">
          {loading ? 'Guardando...' : initial ? 'Actualizar Producto' : 'Crear Producto'}
        </button>
      </div>
    </form>
  );
}
