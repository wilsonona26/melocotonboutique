import type { OrderStatus } from '../types';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: Date | { toDate?: () => Date } | string | number): string {
  let d: Date;
  if (date instanceof Date) {
    d = date;
  } else if (typeof date === 'object' && date !== null && 'toDate' in date && typeof date.toDate === 'function') {
    d = date.toDate();
  } else {
    d = new Date(date as string | number);
  }
  return new Intl.DateTimeFormat('es-EC', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
}

export function formatOrderStatus(status: OrderStatus): string {
  const map: Record<OrderStatus, string> = {
    pending: 'Pendiente',
    processing: 'Procesando',
    shipped: 'Enviado',
    delivered: 'Entregado',
    cancelled: 'Cancelado',
  };
  return map[status] ?? status;
}

export function formatOrderStatusColor(status: OrderStatus): string {
  const map: Record<OrderStatus, string> = {
    pending: 'badge-warning',
    processing: 'badge-info',
    shipped: 'badge-primary',
    delivered: 'badge-success',
    cancelled: 'badge-error',
  };
  return map[status] ?? 'badge-info';
}
