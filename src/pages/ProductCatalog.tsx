import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import { getProducts, searchProducts } from '../firebase/products';
import type { Product } from '../types';
import ProductCard from '../components/customer/ProductCard';
import SearchBar from '../components/customer/SearchBar';
import CategoryFilter from '../components/customer/CategoryFilter';
import LoadingSpinner from '../components/common/LoadingSpinner';

type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'name';

export default function ProductCatalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortOption>('newest');

  const category = searchParams.get('category') || '';
  const query = searchParams.get('q') || '';

  const load = useCallback(async () => {
    setLoading(true);
    try {
      let data: Product[];
      if (query) {
        data = await searchProducts(query);
        if (category) data = data.filter(p => p.category === category);
      } else {
        data = await getProducts(category || undefined);
      }
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [category, query]);

  useEffect(() => { load(); }, [load]);

  const sorted = [...products].sort((a, b) => {
    if (sort === 'price_asc') return a.publicPrice - b.publicPrice;
    if (sort === 'price_desc') return b.publicPrice - a.publicPrice;
    if (sort === 'name') return a.name.localeCompare(b.name);
    return 0;
  });

  const handleCategoryChange = (cat: string) => {
    const params = new URLSearchParams(searchParams);
    if (cat) params.set('category', cat); else params.delete('category');
    setSearchParams(params);
  };

  const handleSearch = (q: string) => {
    const params = new URLSearchParams(searchParams);
    if (q) params.set('q', q); else params.delete('q');
    setSearchParams(params);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="section-title mb-2">Catálogo</h1>
          <p className="text-gray-500">
            {query ? `Resultados para "${query}"` : 'Todos nuestros productos'}
            {products.length > 0 && ` · ${products.length} productos`}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-6 space-y-4">
          <SearchBar
            placeholder="Buscar en el catálogo..."
            className="max-w-md"
            onSearch={handleSearch}
          />
          <div className="flex flex-wrap items-center gap-4 justify-between">
            <CategoryFilter selected={category} onChange={handleCategoryChange} />
            <div className="flex items-center gap-2">
              <AdjustmentsHorizontalIcon className="w-4 h-4 text-gray-400" />
              <select
                value={sort}
                onChange={e => setSort(e.target.value as SortOption)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-300 bg-white"
              >
                <option value="newest">Más recientes</option>
                <option value="price_asc">Precio: menor a mayor</option>
                <option value="price_desc">Precio: mayor a menor</option>
                <option value="name">Nombre A-Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products */}
        {loading ? (
          <LoadingSpinner />
        ) : sorted.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-6xl mb-4">🔍</p>
            <h3 className="font-display font-semibold text-xl text-gray-700 mb-2">No encontramos productos</h3>
            <p className="text-gray-400">Intenta con otros términos o categorías</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {sorted.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
