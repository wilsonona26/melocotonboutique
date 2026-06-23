import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { getProducts, getFeaturedProducts } from '../firebase/products';
import type { Product } from '../types';
import ProductCard from '../components/customer/ProductCard';
import PromoBannerSlider from '../components/customer/PromoBannerSlider';
import { ProductGridSkeleton } from '../components/common/LoadingSkeleton';

const CATEGORIES = [
  { name: 'Ropa', icon: '👗', desc: 'Vestidos, blusas, faldas y más' },
  { name: 'Accesorios', icon: '🧣', desc: 'Sombreros, bufandas y cinturones' },
  { name: 'Calzado', icon: '👠', desc: 'Zapatos, sandalias y botas' },
  { name: 'Bolsos', icon: '👜', desc: 'Carteras, clutches y mochilas' },
  { name: 'Joyería', icon: '💍', desc: 'Collares, aretes y pulseras' },
];

export default function Home() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFeaturedProducts()
      .then(products => {
        if (products.length > 0) {
          setFeatured(products.slice(0, 8));
        } else {
          // Fallback to recent products if no featured ones
          return getProducts().then(p => setFeatured(p.slice(0, 8)));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen">
      {/* Promotional Banners */}
      <PromoBannerSlider />

      {/* Hero */}
      <section className="gradient-hero py-20 px-4">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 text-center lg:text-left animate-fade-in">
            <span className="badge bg-primary-500/20 text-primary-400 text-sm mb-4 inline-flex">✨ Nueva Colección 2025</span>
            <h1 className="font-display font-bold text-5xl sm:text-6xl text-white leading-tight mb-4">
              Tu moda,<br />
              <span className="text-gradient">tu estilo</span>
            </h1>
            <p className="text-gray-300 text-lg leading-relaxed mb-8 max-w-lg">
              Descubre las últimas tendencias en moda femenina. Ropa, accesorios y joyería seleccionados especialmente para ti.
            </p>
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              <Link to="/catalog" className="btn-primary text-base px-8 py-3 inline-flex items-center gap-2">
                Ver Catálogo <ArrowRightIcon className="w-5 h-5" />
              </Link>
              <a
                href="https://wa.me/593984341786"
                target="_blank"
                rel="noopener noreferrer"
                className="border-2 border-white/30 text-white hover:bg-white/10 font-semibold text-base px-8 py-3 rounded-lg inline-flex items-center gap-2 transition-all"
              >
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                Contáctanos
              </a>
            </div>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="relative">
              <div className="w-72 h-72 lg:w-96 lg:h-96 rounded-full bg-primary-500/10 border border-primary-500/30 flex items-center justify-center">
                <img src="/favicon.svg" alt="Melocoton" className="w-48 h-48 lg:w-64 lg:h-64" />
              </div>
              <div className="absolute -top-4 -right-4 bg-gray-900 border border-gray-700 rounded-2xl shadow-lg p-4 animate-fade-in">
                <p className="text-xs text-gray-400">Nuevos productos</p>
                <p className="font-bold text-primary-500 text-lg">Cada semana ✨</p>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-gray-900 border border-gray-700 rounded-2xl shadow-lg p-4 animate-fade-in">
                <p className="text-xs text-gray-400">Envíos a todo</p>
                <p className="font-bold text-primary-500 text-lg">Ecuador 🇪🇨</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="section-title">Categorías</h2>
            <p className="section-subtitle">Explora nuestra colección completa</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {CATEGORIES.map(cat => (
              <Link
                key={cat.name}
                to={`/catalog?category=${cat.name}`}
                className="group flex flex-col items-center gap-3 p-6 bg-gray-50 hover:bg-primary-50 rounded-2xl transition-all duration-200 hover:-translate-y-1 border border-gray-100 hover:border-primary-200"
              >
                <span className="text-4xl group-hover:scale-110 transition-transform duration-200">{cat.icon}</span>
                <div className="text-center">
                  <p className="font-semibold text-gray-900 text-sm">{cat.name}</p>
                  <p className="text-gray-400 text-xs mt-0.5 line-clamp-1">{cat.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="section-title">Productos Destacados</h2>
              <p className="section-subtitle">Lo más nuevo y popular</p>
            </div>
            <Link to="/catalog" className="btn-outline text-sm hidden sm:inline-flex items-center gap-2">
              Ver todo <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <ProductGridSkeleton />
          ) : featured.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-5xl mb-4">🛍️</p>
              <p>Próximamente nuevos productos</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {featured.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}

          <div className="text-center mt-8 sm:hidden">
            <Link to="/catalog" className="btn-outline inline-flex items-center gap-2">
              Ver todo el catálogo <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Instagram Banner */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="gradient-primary rounded-3xl p-12 text-white">
            <span className="text-5xl mb-4 block">📸</span>
            <h2 className="font-display font-bold text-3xl mb-3">Síguenos en Instagram</h2>
            <p className="text-white/80 text-lg mb-6">
              Descubre los últimos looks y tendencias en nuestro Instagram
            </p>
            <a
              href="https://www.instagram.com/melocoton_boutique22/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-gray-900 font-bold px-8 py-3 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              @melocoton_boutique22
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
