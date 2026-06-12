import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserAddresses, addAddress, deleteAddress, setDefaultAddress } from '../firebase/addresses';
import type { SavedAddress } from '../types';
import { useToast } from '../components/common/Toast';
import { MapPinIcon, PlusIcon, TrashIcon, StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

export default function Addresses() {
  const { currentUser: user } = useAuth();
  const { showToast } = useToast();
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (user) loadAddresses();
  }, [user]);

  async function loadAddresses() {
    if (!user) return;
    setLoading(true);
    try {
      const addrs = await getUserAddresses(user.uid);
      setAddresses(addrs);
    } catch {
      showToast('Error al cargar direcciones', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;
    const form = new FormData(e.currentTarget);
    try {
      await addAddress({
        userId: user.uid,
        label: form.get('label') as string,
        address: form.get('address') as string,
        city: form.get('city') as string,
        state: form.get('state') as string,
        zipCode: form.get('zipCode') as string,
        country: form.get('country') as string || 'Ecuador',
        isDefault: addresses.length === 0,
      });
      showToast('Dirección guardada');
      setShowForm(false);
      loadAddresses();
    } catch {
      showToast('Error al guardar dirección', 'error');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar esta dirección?')) return;
    await deleteAddress(id);
    showToast('Dirección eliminada');
    loadAddresses();
  }

  async function handleSetDefault(id: string) {
    if (!user) return;
    await setDefaultAddress(user.uid, id);
    showToast('Dirección predeterminada actualizada');
    loadAddresses();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <MapPinIcon className="w-6 h-6 text-primary-500" />
          <h1 className="font-display font-bold text-2xl text-gray-900">Mis Direcciones</h1>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm inline-flex items-center gap-2">
          <PlusIcon className="w-4 h-4" /> Nueva Dirección
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-2xl p-6 border border-gray-200 space-y-4 mb-6">
          <h3 className="font-semibold text-gray-700">Nueva Dirección</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input name="label" placeholder="Etiqueta (ej: Casa, Oficina)" required className="input-field" />
            <input name="country" placeholder="País" defaultValue="Ecuador" className="input-field" />
            <input name="address" placeholder="Dirección completa" required className="input-field sm:col-span-2" />
            <input name="city" placeholder="Ciudad" required className="input-field" />
            <input name="state" placeholder="Provincia/Estado" required className="input-field" />
            <input name="zipCode" placeholder="Código Postal" required className="input-field" />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary text-sm">Guardar</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-ghost text-sm">Cancelar</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-200 rounded-2xl" />)}
        </div>
      ) : addresses.length === 0 ? (
        <div className="text-center py-16">
          <MapPinIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No tienes direcciones guardadas</p>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map(addr => (
            <div key={addr.id} className={`bg-white rounded-2xl p-5 border ${addr.isDefault ? 'border-primary-300 ring-1 ring-primary-100' : 'border-gray-100'} flex items-start justify-between`}>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900">{addr.label}</span>
                  {addr.isDefault && <span className="badge badge-primary text-xs">Predeterminada</span>}
                </div>
                <p className="text-sm text-gray-600">{addr.address}</p>
                <p className="text-sm text-gray-500">{addr.city}, {addr.state} {addr.zipCode}</p>
                <p className="text-sm text-gray-400">{addr.country}</p>
              </div>
              <div className="flex items-center gap-2">
                {!addr.isDefault && (
                  <button onClick={() => handleSetDefault(addr.id)} className="p-2 text-gray-400 hover:text-yellow-500 transition-colors" title="Hacer predeterminada">
                    <StarIcon className="w-5 h-5" />
                  </button>
                )}
                {addr.isDefault && <StarSolidIcon className="w-5 h-5 text-yellow-500" />}
                <button onClick={() => handleDelete(addr.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors" title="Eliminar">
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
