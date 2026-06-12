import { useEffect, useState, useCallback } from 'react';
import { getAllCoupons, createCoupon, deleteCoupon, updateCoupon } from '../../firebase/coupons';
import { getAllBanners, createBanner, deleteBanner, updateBanner } from '../../firebase/banners';
import type { Coupon, PromoBanner } from '../../types';
import { useToast } from '../../components/common/Toast';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import { PlusIcon, TrashIcon, TagIcon, PhotoIcon } from '@heroicons/react/24/outline';

export default function Marketing() {
  const [tab, setTab] = useState<'coupons' | 'banners'>('coupons');
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [banners, setBanners] = useState<PromoBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [showBannerForm, setShowBannerForm] = useState(false);
  const { showToast } = useToast();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [c, b] = await Promise.all([getAllCoupons(), getAllBanners()]);
      setCoupons(c);
      setBanners(b);
    } catch {
      showToast('Error al cargar datos', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleCreateCoupon(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    try {
      await createCoupon({
        code: form.get('code') as string,
        discountType: form.get('discountType') as 'percentage' | 'fixed',
        discountValue: Number(form.get('discountValue')),
        minOrderAmount: Number(form.get('minOrderAmount') || 0),
        maxUses: Number(form.get('maxUses') || 0),
        active: true,
        expiresAt: new Date(form.get('expiresAt') as string),
      });
      showToast('Cupón creado exitosamente');
      setShowCouponForm(false);
      loadData();
    } catch {
      showToast('Error al crear cupón', 'error');
    }
  }

  async function handleCreateBanner(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    try {
      await createBanner({
        title: form.get('title') as string,
        subtitle: form.get('subtitle') as string,
        imageUrl: form.get('imageUrl') as string,
        linkUrl: form.get('linkUrl') as string || '/catalog',
        active: true,
        order: banners.length,
      });
      showToast('Banner creado exitosamente');
      setShowBannerForm(false);
      loadData();
    } catch {
      showToast('Error al crear banner', 'error');
    }
  }

  async function handleDeleteCoupon(id: string) {
    if (!confirm('¿Eliminar este cupón?')) return;
    await deleteCoupon(id);
    showToast('Cupón eliminado');
    loadData();
  }

  async function handleDeleteBanner(id: string) {
    if (!confirm('¿Eliminar este banner?')) return;
    await deleteBanner(id);
    showToast('Banner eliminado');
    loadData();
  }

  async function toggleCouponActive(coupon: Coupon) {
    await updateCoupon(coupon.id, { active: !coupon.active });
    showToast(coupon.active ? 'Cupón desactivado' : 'Cupón activado');
    loadData();
  }

  async function toggleBannerActive(banner: PromoBanner) {
    await updateBanner(banner.id, { active: !banner.active });
    showToast(banner.active ? 'Banner desactivado' : 'Banner activado');
    loadData();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-gray-900">Marketing</h1>
        <p className="text-gray-500 text-sm">Gestiona cupones y banners promocionales</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setTab('coupons')}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${tab === 'coupons' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <TagIcon className="w-4 h-4" /> Cupones
        </button>
        <button
          onClick={() => setTab('banners')}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${tab === 'banners' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <PhotoIcon className="w-4 h-4" /> Banners
        </button>
      </div>

      {loading ? <TableSkeleton /> : tab === 'coupons' ? (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setShowCouponForm(!showCouponForm)} className="btn-primary text-sm inline-flex items-center gap-2">
              <PlusIcon className="w-4 h-4" /> Nuevo Cupón
            </button>
          </div>

          {showCouponForm && (
            <form onSubmit={handleCreateCoupon} className="bg-white rounded-2xl p-6 border border-gray-200 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input name="code" placeholder="Código (ej: DESCUENTO20)" required className="input-field uppercase" />
                <select name="discountType" className="input-field" required>
                  <option value="percentage">Porcentaje (%)</option>
                  <option value="fixed">Monto Fijo ($)</option>
                </select>
                <input name="discountValue" type="number" placeholder="Valor del descuento" required className="input-field" />
                <input name="minOrderAmount" type="number" placeholder="Monto mínimo de compra" className="input-field" />
                <input name="maxUses" type="number" placeholder="Máximo de usos (0 = ilimitado)" className="input-field" />
                <input name="expiresAt" type="date" required className="input-field" />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="btn-primary text-sm">Crear Cupón</button>
                <button type="button" onClick={() => setShowCouponForm(false)} className="btn-ghost text-sm">Cancelar</button>
              </div>
            </form>
          )}

          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3 font-medium text-gray-600">Código</th>
                  <th className="text-left p-3 font-medium text-gray-600">Descuento</th>
                  <th className="text-left p-3 font-medium text-gray-600">Usos</th>
                  <th className="text-left p-3 font-medium text-gray-600">Expira</th>
                  <th className="text-left p-3 font-medium text-gray-600">Estado</th>
                  <th className="text-right p-3 font-medium text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map(c => (
                  <tr key={c.id} className="border-t border-gray-50">
                    <td className="p-3 font-mono font-bold">{c.code}</td>
                    <td className="p-3">{c.discountType === 'percentage' ? `${c.discountValue}%` : `$${c.discountValue}`}</td>
                    <td className="p-3">{c.currentUses}/{c.maxUses || '∞'}</td>
                    <td className="p-3">{c.expiresAt instanceof Date ? c.expiresAt.toLocaleDateString() : new Date(c.expiresAt).toLocaleDateString()}</td>
                    <td className="p-3">
                      <button onClick={() => toggleCouponActive(c)} className={`badge ${c.active ? 'badge-success' : 'badge-error'} cursor-pointer`}>
                        {c.active ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>
                    <td className="p-3 text-right">
                      <button onClick={() => handleDeleteCoupon(c.id)} className="text-red-500 hover:text-red-700">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {coupons.length === 0 && (
                  <tr><td colSpan={6} className="p-8 text-center text-gray-400">No hay cupones creados</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setShowBannerForm(!showBannerForm)} className="btn-primary text-sm inline-flex items-center gap-2">
              <PlusIcon className="w-4 h-4" /> Nuevo Banner
            </button>
          </div>

          {showBannerForm && (
            <form onSubmit={handleCreateBanner} className="bg-white rounded-2xl p-6 border border-gray-200 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input name="title" placeholder="Título del banner" required className="input-field" />
                <input name="subtitle" placeholder="Subtítulo (opcional)" className="input-field" />
                <input name="imageUrl" placeholder="URL de la imagen" required className="input-field" />
                <input name="linkUrl" placeholder="Link destino (ej: /catalog)" className="input-field" />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="btn-primary text-sm">Crear Banner</button>
                <button type="button" onClick={() => setShowBannerForm(false)} className="btn-ghost text-sm">Cancelar</button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {banners.map(b => (
              <div key={b.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="h-40 bg-gray-100 relative">
                  {b.imageUrl && <img src={b.imageUrl} alt={b.title} className="w-full h-full object-cover" />}
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <div className="text-center text-white">
                      <p className="font-bold text-lg">{b.title}</p>
                      {b.subtitle && <p className="text-sm text-white/80">{b.subtitle}</p>}
                    </div>
                  </div>
                </div>
                <div className="p-3 flex items-center justify-between">
                  <button onClick={() => toggleBannerActive(b)} className={`badge ${b.active ? 'badge-success' : 'badge-error'} cursor-pointer`}>
                    {b.active ? 'Activo' : 'Inactivo'}
                  </button>
                  <button onClick={() => handleDeleteBanner(b.id)} className="text-red-500 hover:text-red-700">
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {banners.length === 0 && (
              <div className="col-span-2 text-center py-8 text-gray-400">No hay banners creados</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
