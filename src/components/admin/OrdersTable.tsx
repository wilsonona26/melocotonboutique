import { useState } from 'react';
import type { Order, OrderStatus } from '../../types';
import { updateOrderStatus, updateOrderTracking, updateOrderNotes } from '../../firebase/orders';
import { formatCurrency, formatDate, formatOrderStatus } from '../../utils/formatters';
import { useToast } from '../common/Toast';
import { TruckIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';

const STATUSES: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

interface Props {
  orders: Order[];
  onRefresh: () => void;
}

export default function OrdersTable({ orders, onRefresh }: Props) {
  const [updating, setUpdating] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [trackingInput, setTrackingInput] = useState<{ [key: string]: string }>({});
  const [notesInput, setNotesInput] = useState<{ [key: string]: string }>({});
  const { showToast } = useToast();

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    setUpdating(orderId);
    try {
      await updateOrderStatus(orderId, status);
      showToast(`Estado actualizado a: ${formatOrderStatus(status)}`);
      onRefresh();
    } finally {
      setUpdating(null);
    }
  };

  const handleSaveTracking = async (orderId: string) => {
    const tracking = trackingInput[orderId];
    if (!tracking) return;
    try {
      await updateOrderTracking(orderId, tracking);
      showToast('Número de seguimiento guardado');
      onRefresh();
    } catch {
      showToast('Error al guardar tracking', 'error');
    }
  };

  const handleSaveNotes = async (orderId: string) => {
    const notes = notesInput[orderId];
    if (!notes) return;
    try {
      await updateOrderNotes(orderId, notes);
      showToast('Notas guardadas');
      onRefresh();
    } catch {
      showToast('Error al guardar notas', 'error');
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 font-semibold text-gray-600">ID Pedido</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-600">Cliente</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-600">Fecha</th>
            <th className="text-right py-3 px-4 font-semibold text-gray-600">Total</th>
            <th className="text-center py-3 px-4 font-semibold text-gray-600">Estado</th>
            <th className="text-center py-3 px-4 font-semibold text-gray-600">Detalles</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {orders.map(order => (
            <>
              <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4 font-mono text-xs text-gray-500">{order.id.slice(0, 8)}...</td>
                <td className="py-3 px-4">
                  <p className="font-medium text-gray-900">{order.customerInfo.firstName} {order.customerInfo.lastName}</p>
                  <p className="text-gray-400 text-xs">{order.customerInfo.email}</p>
                </td>
                <td className="py-3 px-4 text-gray-500">{formatDate(order.createdAt)}</td>
                <td className="py-3 px-4 text-right font-bold text-gray-900">{formatCurrency(order.total)}</td>
                <td className="py-3 px-4">
                  <div className="flex justify-center">
                    <select
                      value={order.status}
                      onChange={e => handleStatusChange(order.id, e.target.value as OrderStatus)}
                      disabled={updating === order.id}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-300 bg-white"
                    >
                      {STATUSES.map(s => (
                        <option key={s} value={s}>{formatOrderStatus(s)}</option>
                      ))}
                    </select>
                  </div>
                </td>
                <td className="py-3 px-4 text-center">
                  <button
                    onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                    className="text-primary-500 hover:text-primary-700 text-xs font-medium transition-colors"
                  >
                    {expanded === order.id ? 'Ocultar' : 'Ver detalles'}
                  </button>
                </td>
              </tr>
              {expanded === order.id && (
                <tr key={`${order.id}-detail`}>
                  <td colSpan={6} className="px-4 pb-4 bg-primary-50/50">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                      {/* Customer Info */}
                      <div className="bg-white rounded-xl p-4 border border-gray-100">
                        <h4 className="font-semibold text-gray-700 text-xs mb-2">📋 Datos del Cliente</h4>
                        <div className="space-y-1 text-xs text-gray-600">
                          <p><strong>Nombre:</strong> {order.customerInfo.firstName} {order.customerInfo.lastName}</p>
                          <p><strong>Email:</strong> {order.customerInfo.email}</p>
                          <p><strong>Teléfono:</strong> {order.customerInfo.phone}</p>
                          <p><strong>Dirección:</strong> {order.shippingInfo.address}</p>
                          <p><strong>Ciudad:</strong> {order.shippingInfo.city}, {order.shippingInfo.state} {order.shippingInfo.zipCode}</p>
                          <p><strong>País:</strong> {order.shippingInfo.country}</p>
                        </div>
                      </div>

                      {/* Tracking & Notes */}
                      <div className="space-y-3">
                        <div className="bg-white rounded-xl p-4 border border-gray-100">
                          <h4 className="font-semibold text-gray-700 text-xs mb-2 flex items-center gap-1">
                            <TruckIcon className="w-3.5 h-3.5" /> Número de Seguimiento
                          </h4>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={trackingInput[order.id] ?? order.trackingNumber ?? ''}
                              onChange={(e) => setTrackingInput({ ...trackingInput, [order.id]: e.target.value })}
                              placeholder="Ej: EC123456789"
                              className="input-field text-xs py-1.5 flex-1"
                            />
                            <button onClick={() => handleSaveTracking(order.id)} className="btn-primary text-xs py-1.5 px-3">
                              Guardar
                            </button>
                          </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-gray-100">
                          <h4 className="font-semibold text-gray-700 text-xs mb-2 flex items-center gap-1">
                            <ChatBubbleLeftIcon className="w-3.5 h-3.5" /> Notas del Pedido
                          </h4>
                          <div className="flex gap-2">
                            <textarea
                              value={notesInput[order.id] ?? order.notes ?? ''}
                              onChange={(e) => setNotesInput({ ...notesInput, [order.id]: e.target.value })}
                              placeholder="Agregar notas..."
                              rows={2}
                              className="input-field text-xs py-1.5 flex-1 resize-none"
                            />
                            <button onClick={() => handleSaveNotes(order.id)} className="btn-primary text-xs py-1.5 px-3 self-end">
                              Guardar
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="rounded-xl border border-primary-100 overflow-hidden">
                      <table className="w-full text-xs">
                        <thead className="bg-primary-100/50">
                          <tr>
                            <th className="text-left py-2 px-3 font-semibold text-gray-600">Producto</th>
                            <th className="text-center py-2 px-3 font-semibold text-gray-600">Cant.</th>
                            <th className="text-right py-2 px-3 font-semibold text-gray-600">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.items.map((item, i) => (
                            <tr key={i} className="border-t border-primary-100/50">
                              <td className="py-2 px-3 text-gray-700">
                                {item.productName} ({item.productCode})
                                {item.variant && <span className="text-gray-400 ml-1">- {item.variant}</span>}
                              </td>
                              <td className="py-2 px-3 text-center">{item.quantity}</td>
                              <td className="py-2 px-3 text-right font-medium">{formatCurrency(item.subtotal)}</td>
                            </tr>
                          ))}
                          {order.discount > 0 && (
                            <tr className="border-t border-primary-100/50">
                              <td colSpan={2} className="py-2 px-3 text-right text-green-600">Descuento {order.couponCode && `(${order.couponCode})`}:</td>
                              <td className="py-2 px-3 text-right font-medium text-green-600">-{formatCurrency(order.discount)}</td>
                            </tr>
                          )}
                          <tr className="border-t border-primary-200">
                            <td colSpan={2} className="py-2 px-3 font-bold text-right text-gray-700">Total:</td>
                            <td className="py-2 px-3 text-right font-bold text-primary-600">{formatCurrency(order.total)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-2 text-xs text-gray-500 flex flex-wrap gap-4">
                      <span>💳 ****{order.paymentInfo.lastFourDigits}</span>
                      <span className={`font-medium ${order.paymentInfo.status === 'approved' ? 'text-green-600' : 'text-red-500'}`}>
                        Pago: {order.paymentInfo.status === 'approved' ? 'Aprobado' : 'Rechazado'}
                      </span>
                      {order.trackingNumber && <span>🚚 Tracking: {order.trackingNumber}</span>}
                    </div>
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
}
