import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckIcon } from '@heroicons/react/24/solid';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatters';
import { validateCoupon } from '../firebase/coupons';
import type { CustomerInfo, ShippingInfo, Coupon } from '../types';

type Step = 1 | 2 | 3;

const STEPS = [
  { num: 1, label: 'Datos Personales' },
  { num: 2, label: 'Envío' },
  { num: 3, label: 'Resumen' },
];

export default function Checkout() {
  const { items, totalPrice } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);

  const [customer, setCustomer] = useState<CustomerInfo>({
    firstName: '',
    lastName: '',
    email: currentUser?.email ?? '',
    phone: '',
  });

  const [shipping, setShipping] = useState<ShippingInfo>({
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Ecuador',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const shippingCost = totalPrice >= 50 ? 0 : 5;

  const discount = appliedCoupon
    ? appliedCoupon.discountType === 'percentage'
      ? Math.round((totalPrice * appliedCoupon.discountValue / 100) * 100) / 100
      : Math.min(appliedCoupon.discountValue, totalPrice)
    : 0;

  const total = totalPrice - discount + shippingCost;

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!customer.firstName.trim()) e.firstName = 'Requerido';
    if (!customer.lastName.trim()) e.lastName = 'Requerido';
    if (!customer.email.trim()) e.email = 'Requerido';
    if (!customer.phone.trim()) e.phone = 'Requerido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (!shipping.address.trim()) e.address = 'Requerido';
    if (!shipping.city.trim()) e.city = 'Requerido';
    if (!shipping.state.trim()) e.state = 'Requerido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep(s => (s + 1) as Step);
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    try {
      const result = await validateCoupon(couponCode.trim(), totalPrice);
      if (result.valid && result.coupon) {
        setAppliedCoupon(result.coupon);
        setCouponError('');
      } else {
        setCouponError(result.error ?? 'Cupón inválido');
        setAppliedCoupon(null);
      }
    } catch {
      setCouponError('Error al validar el cupón');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  const handlePayment = () => {
    navigate('/payment', {
      state: { customer, shipping, shippingCost, total, items, discount, couponId: appliedCoupon?.id, couponCode: appliedCoupon?.code }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="section-title mb-6 text-center">Finalizar Compra</h1>

        {/* Steps */}
        <div className="flex items-center justify-center mb-8 gap-0">
          {STEPS.map((s, i) => (
            <div key={s.num} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                  s.num < step ? 'bg-green-500 text-white' :
                  s.num === step ? 'bg-primary-500 text-white' :
                  'bg-gray-200 text-gray-500'
                }`}>
                  {s.num < step ? <CheckIcon className="w-4 h-4" /> : s.num}
                </div>
                <span className={`text-xs mt-1 font-medium ${s.num === step ? 'text-primary-600' : 'text-gray-400'}`}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-16 h-0.5 mx-2 mb-4 transition-all ${s.num < step ? 'bg-green-400' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8">
          {/* Step 1: Customer Info */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="font-display font-bold text-lg text-gray-900 mb-4">Datos Personales</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                  <input
                    type="text"
                    value={customer.firstName}
                    onChange={e => setCustomer(p => ({ ...p, firstName: e.target.value }))}
                    className={`input-field ${errors.firstName ? 'border-red-400' : ''}`}
                  />
                  {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Apellido *</label>
                  <input
                    type="text"
                    value={customer.lastName}
                    onChange={e => setCustomer(p => ({ ...p, lastName: e.target.value }))}
                    className={`input-field ${errors.lastName ? 'border-red-400' : ''}`}
                  />
                  {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico *</label>
                <input
                  type="email"
                  value={customer.email}
                  onChange={e => setCustomer(p => ({ ...p, email: e.target.value }))}
                  className={`input-field ${errors.email ? 'border-red-400' : ''}`}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono *</label>
                <input
                  type="tel"
                  value={customer.phone}
                  onChange={e => setCustomer(p => ({ ...p, phone: e.target.value }))}
                  className={`input-field ${errors.phone ? 'border-red-400' : ''}`}
                  placeholder="0998765432"
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>
            </div>
          )}

          {/* Step 2: Shipping */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="font-display font-bold text-lg text-gray-900 mb-4">Información de Envío</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección *</label>
                <input
                  type="text"
                  value={shipping.address}
                  onChange={e => setShipping(p => ({ ...p, address: e.target.value }))}
                  className={`input-field ${errors.address ? 'border-red-400' : ''}`}
                  placeholder="Calle principal y secundaria, número"
                />
                {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad *</label>
                  <input
                    type="text"
                    value={shipping.city}
                    onChange={e => setShipping(p => ({ ...p, city: e.target.value }))}
                    className={`input-field ${errors.city ? 'border-red-400' : ''}`}
                  />
                  {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Provincia *</label>
                  <input
                    type="text"
                    value={shipping.state}
                    onChange={e => setShipping(p => ({ ...p, state: e.target.value }))}
                    className={`input-field ${errors.state ? 'border-red-400' : ''}`}
                  />
                  {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Código Postal</label>
                  <input
                    type="text"
                    value={shipping.zipCode}
                    onChange={e => setShipping(p => ({ ...p, zipCode: e.target.value }))}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">País</label>
                  <input type="text" value="Ecuador" readOnly className="input-field bg-gray-50" />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Summary */}
          {step === 3 && (
            <div className="animate-fade-in">
              <h2 className="font-display font-bold text-lg text-gray-900 mb-4">Resumen del Pedido</h2>

              <div className="space-y-3 mb-6">
                {items.map(({ product, quantity }) => (
                  <div key={product.id} className="flex gap-3 items-center">
                    <img
                      src={product.images?.[0] || 'https://placehold.co/48x48/FDE8E8/E76F51?text=?'}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">{product.name}</p>
                      <p className="text-xs text-gray-400">Cant: {quantity}</p>
                    </div>
                    <span className="text-sm font-bold text-gray-700">{formatCurrency(product.publicPrice * quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span><span>{formatCurrency(totalPrice)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Descuento ({appliedCoupon?.code})</span><span>-{formatCurrency(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Envío</span>
                  <span className={shippingCost === 0 ? 'text-green-600' : ''}>{shippingCost === 0 ? 'Gratis' : formatCurrency(shippingCost)}</span>
                </div>
                <div className="flex justify-between font-bold text-base pt-1 border-t">
                  <span>Total</span><span className="text-primary-600">{formatCurrency(total)}</span>
                </div>
              </div>

              {/* Coupon */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-2">Cupón de descuento</label>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-2">
                    <span className="text-sm text-green-700 font-medium">✅ {appliedCoupon.code} aplicado</span>
                    <button onClick={handleRemoveCoupon} className="text-xs text-red-500 hover:text-red-700">Quitar</button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={e => setCouponCode(e.target.value.toUpperCase())}
                      className="input-field flex-1 text-sm"
                      placeholder="CÓDIGO"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={couponLoading}
                      className="btn-outline text-sm px-4"
                    >
                      {couponLoading ? '...' : 'Aplicar'}
                    </button>
                  </div>
                )}
                {couponError && <p className="text-red-500 text-xs mt-1">{couponError}</p>}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4 text-xs text-gray-500">
                <div>
                  <p className="font-semibold text-gray-700 mb-1">Enviar a:</p>
                  <p>{customer.firstName} {customer.lastName}</p>
                  <p>{shipping.address}</p>
                  <p>{shipping.city}, {shipping.state}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700 mb-1">Contacto:</p>
                  <p>{customer.email}</p>
                  <p>{customer.phone}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            {step > 1 ? (
              <button onClick={() => setStep(s => (s - 1) as Step)} className="btn-outline">
                Anterior
              </button>
            ) : (
              <div />
            )}
            {step < 3 ? (
              <button onClick={handleNext} className="btn-primary">
                Continuar
              </button>
            ) : (
              <button onClick={handlePayment} className="btn-primary px-8">
                💳 Ir al Pago
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
