import { useLocation, Link } from 'react-router-dom';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { formatCurrency } from '../utils/formatters';

export default function OrderConfirmation() {
  const location = useLocation();
  const state = location.state as { orderId: string; approved: boolean; total: number } | null;

  if (!state) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Página no disponible</p>
          <Link to="/" className="btn-primary">Ir al inicio</Link>
        </div>
      </div>
    );
  }

  const { orderId, approved, total } = state;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl shadow-xl p-10 text-center">
          {approved ? (
            <>
              <CheckCircleIcon className="w-20 h-20 text-green-500 mx-auto mb-4" />
              <h1 className="font-display font-bold text-3xl text-gray-900 mb-2">¡Pedido Confirmado!</h1>
              <p className="text-gray-500 mb-6">Tu pago fue aprobado y tu pedido está en camino.</p>
              <div className="bg-green-50 rounded-2xl p-4 mb-6">
                <p className="text-sm text-gray-500 mb-1">Número de Pedido</p>
                <p className="font-mono font-bold text-green-700 text-sm break-all">{orderId}</p>
              </div>
              <div className="bg-primary-50 rounded-2xl p-4 mb-6">
                <p className="text-sm text-gray-500 mb-1">Total Pagado</p>
                <p className="font-bold text-primary-600 text-2xl">{formatCurrency(total)}</p>
              </div>
              <p className="text-sm text-gray-400 mb-8">
                Recibirás un correo de confirmación. Puedes seguir tu pedido en "Mis Pedidos".
              </p>
            </>
          ) : (
            <>
              <XCircleIcon className="w-20 h-20 text-red-400 mx-auto mb-4" />
              <h1 className="font-display font-bold text-3xl text-gray-900 mb-2">Pago Rechazado</h1>
              <p className="text-gray-500 mb-6">
                Tu pago no pudo ser procesado. Por favor verifica los datos de tu tarjeta e intenta de nuevo.
              </p>
            </>
          )}

          <div className="flex flex-col gap-3">
            {approved && (
              <Link to="/orders" className="btn-primary w-full text-center">
                Ver Mis Pedidos
              </Link>
            )}
            {!approved && (
              <Link to="/payment" className="btn-primary w-full text-center">
                Intentar de Nuevo
              </Link>
            )}
            <Link to="/" className="btn-ghost w-full text-center">
              Seguir Comprando
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
