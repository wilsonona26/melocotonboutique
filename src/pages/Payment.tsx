import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LockClosedIcon, CreditCardIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { createOrder } from '../firebase/orders';
import { formatCurrency } from '../utils/formatters';
import {
  validateCardNumber, validateExpiryDate, validateCVV, formatCardNumber,
} from '../utils/validators';
import type { CartItem, CustomerInfo, ShippingInfo } from '../types';

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { clearCart } = useCart();

  const state = location.state as {
    customer: CustomerInfo;
    shipping: ShippingInfo;
    shippingCost: number;
    total: number;
    items: CartItem[];
  } | null;

  const [card, setCard] = useState({ number: '', holder: '', month: '', year: '', cvv: '', type: 'credit_card' as 'credit_card' | 'debit_card' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState(false);
  const [flip, setFlip] = useState(false);

  if (!state || !currentUser) {
    navigate('/checkout');
    return null;
  }

  const { customer, shipping, shippingCost, total, items } = state;
  const subtotal = total - shippingCost;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!validateCardNumber(card.number.replace(/\s/g, ''))) e.number = 'Número de tarjeta inválido';
    if (!card.holder.trim()) e.holder = 'Nombre del titular requerido';
    if (!validateExpiryDate(card.month, card.year)) e.expiry = 'Fecha de expiración inválida';
    if (!validateCVV(card.cvv)) e.cvv = 'CVV inválido (3-4 dígitos)';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setProcessing(true);

    // Simulate payment processing (90% approval rate)
    await new Promise(r => setTimeout(r, 2000));
    const approved = Math.random() < 0.9;
    const lastFour = card.number.replace(/\s/g, '').slice(-4);

    try {
      const orderId = await createOrder({
        userId: currentUser.uid,
        userEmail: currentUser.email ?? '',
        customerInfo: customer,
        shippingInfo: shipping,
        items: items.map(({ product, quantity }) => ({
          productId: product.id,
          productName: product.name,
          productCode: product.code,
          price: product.publicPrice,
          quantity,
          subtotal: product.publicPrice * quantity,
          image: product.images?.[0] ?? '',
        })),
        subtotal,
        shipping: shippingCost,
        discount: 0,
        total,
        paymentInfo: {
          method: card.type,
          lastFourDigits: lastFour,
          cardHolder: card.holder,
          status: approved ? 'approved' : 'rejected',
        },
        status: approved ? 'pending' : 'cancelled',
      });

      clearCart();
      navigate('/order-confirmation', { state: { orderId, approved, total } });
    } catch (err) {
      console.error(err);
      setErrors({ submit: 'Error al procesar el pago. Intenta de nuevo.' });
    } finally {
      setProcessing(false);
    }
  };

  const cardDigits = card.number.replace(/\s/g, '').padEnd(16, '•');
  const formattedCard = `${cardDigits.slice(0,4)} ${cardDigits.slice(4,8)} ${cardDigits.slice(8,12)} ${cardDigits.slice(12,16)}`;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <LockClosedIcon className="w-4 h-4" /> Pago 100% Seguro
          </div>
          <h1 className="section-title">Pago con Tarjeta</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Payment Form */}
          <div className="lg:col-span-3">
            {/* Card Preview */}
            <div className="mb-6 flex justify-center">
              <div
                className={`relative w-72 h-44 rounded-2xl shadow-xl transition-transform duration-500 ${flip ? 'rotate-y-180' : ''}`}
                style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
              >
                <div className="absolute inset-0 gradient-primary rounded-2xl p-6 text-white">
                  <div className="flex justify-between items-start mb-8">
                    <div className="text-xs font-medium opacity-80">
                      {card.type === 'credit_card' ? 'CRÉDITO' : 'DÉBITO'}
                    </div>
                    <CreditCardIcon className="w-8 h-8 opacity-60" />
                  </div>
                  <p className="font-mono text-lg tracking-widest mb-3">{formattedCard}</p>
                  <div className="flex justify-between text-xs">
                    <div>
                      <p className="opacity-60 mb-0.5">TITULAR</p>
                      <p className="font-medium uppercase truncate max-w-[140px]">{card.holder || 'NOMBRE APELLIDO'}</p>
                    </div>
                    <div className="text-right">
                      <p className="opacity-60 mb-0.5">VENCE</p>
                      <p className="font-medium">{card.month || 'MM'}/{card.year || 'YY'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6">
              {errors.submit && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-4">
                  {errors.submit}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Card Type */}
                <div className="flex gap-3">
                  {(['credit_card', 'debit_card'] as const).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setCard(p => ({ ...p, type: t }))}
                      className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                        card.type === t ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      {t === 'credit_card' ? '💳 Crédito' : '🏦 Débito'}
                    </button>
                  ))}
                </div>

                {/* Card Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Número de tarjeta *</label>
                  <input
                    type="text"
                    value={card.number}
                    onChange={e => setCard(p => ({ ...p, number: formatCardNumber(e.target.value) }))}
                    maxLength={19}
                    className={`input-field font-mono ${errors.number ? 'border-red-400' : ''}`}
                    placeholder="1234 5678 9012 3456"
                    autoComplete="cc-number"
                  />
                  {errors.number && <p className="text-red-500 text-xs mt-1">{errors.number}</p>}
                </div>

                {/* Card Holder */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del titular *</label>
                  <input
                    type="text"
                    value={card.holder}
                    onChange={e => setCard(p => ({ ...p, holder: e.target.value.toUpperCase() }))}
                    className={`input-field ${errors.holder ? 'border-red-400' : ''}`}
                    placeholder="NOMBRE APELLIDO"
                    autoComplete="cc-name"
                  />
                  {errors.holder && <p className="text-red-500 text-xs mt-1">{errors.holder}</p>}
                </div>

                {/* Expiry & CVV */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mes</label>
                    <input
                      type="text"
                      value={card.month}
                      onChange={e => setCard(p => ({ ...p, month: e.target.value.replace(/\D/g, '').slice(0,2) }))}
                      className={`input-field text-center ${errors.expiry ? 'border-red-400' : ''}`}
                      placeholder="MM"
                      maxLength={2}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Año</label>
                    <input
                      type="text"
                      value={card.year}
                      onChange={e => setCard(p => ({ ...p, year: e.target.value.replace(/\D/g, '').slice(0,2) }))}
                      className={`input-field text-center ${errors.expiry ? 'border-red-400' : ''}`}
                      placeholder="AA"
                      maxLength={2}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                    <input
                      type="text"
                      value={card.cvv}
                      onChange={e => setCard(p => ({ ...p, cvv: e.target.value.replace(/\D/g, '').slice(0,4) }))}
                      onFocus={() => setFlip(true)}
                      onBlur={() => setFlip(false)}
                      className={`input-field text-center ${errors.cvv ? 'border-red-400' : ''}`}
                      placeholder="123"
                      maxLength={4}
                    />
                  </div>
                </div>
                {errors.expiry && <p className="text-red-500 text-xs">{errors.expiry}</p>}
                {errors.cvv && <p className="text-red-500 text-xs">{errors.cvv}</p>}

                <button
                  type="submit"
                  disabled={processing}
                  className="btn-primary w-full text-base py-3.5 justify-center flex items-center gap-2"
                >
                  <LockClosedIcon className="w-5 h-5" />
                  {processing ? 'Procesando pago...' : `Pagar ${formatCurrency(total)}`}
                </button>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="font-display font-bold text-lg mb-4">Tu Pedido</h3>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {items.map(({ product, quantity }) => (
                  <div key={product.id} className="flex gap-3">
                    <img
                      src={product.images?.[0] || 'https://placehold.co/48x48/FDE8E8/E76F51?text=?'}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1">{product.name}</p>
                      <p className="text-xs text-gray-400">x{quantity}</p>
                    </div>
                    <span className="text-sm font-bold">{formatCurrency(product.publicPrice * quantity)}</span>
                  </div>
                ))}
              </div>
              <hr className="my-4 border-gray-100" />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                <div className="flex justify-between text-gray-600">
                  <span>Envío</span>
                  <span className={shippingCost === 0 ? 'text-green-600' : ''}>{shippingCost === 0 ? 'Gratis' : formatCurrency(shippingCost)}</span>
                </div>
                <div className="flex justify-between font-bold text-base pt-1 border-t">
                  <span>Total</span><span className="text-primary-600">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
