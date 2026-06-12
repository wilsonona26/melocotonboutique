import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../utils/formatters';

export default function Profile() {
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="section-title mb-8">Mi Perfil</h1>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="gradient-primary p-8 text-white text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold">
              {(userProfile?.displayName || currentUser?.email || 'U')[0].toUpperCase()}
            </div>
            <h2 className="font-display font-bold text-2xl">{userProfile?.displayName || 'Usuario'}</h2>
            <p className="text-white/80 text-sm mt-1">{currentUser?.email}</p>
            {userProfile?.role !== 'CUSTOMER' && (
              <span className="inline-block mt-2 bg-white/20 text-white text-xs px-3 py-1 rounded-full">
                {userProfile?.role}
              </span>
            )}
          </div>

          <div className="p-8 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Nombre</p>
                <p className="font-medium text-gray-900">{userProfile?.displayName || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Correo</p>
                <p className="font-medium text-gray-900">{currentUser?.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Tipo de cuenta</p>
                <p className="font-medium text-gray-900 capitalize">{userProfile?.role === 'CUSTOMER' ? 'Cliente' : userProfile?.role ?? 'Cliente'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Miembro desde</p>
                <p className="font-medium text-gray-900">
                  {userProfile?.createdAt ? formatDate(userProfile.createdAt) : '—'}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate('/orders')}
                className="btn-outline flex-1"
              >
                Ver Mis Pedidos
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-2.5 px-6 rounded-lg border-2 border-red-200 text-red-500 hover:bg-red-50 font-semibold transition-all"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
