export interface Product {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  publicPrice: number;
  wholesalePrice: number;
  stock: number;
  images: string[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  userEmail: string;
  customerInfo: CustomerInfo;
  shippingInfo: ShippingInfo;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  paymentInfo: PaymentInfo;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productCode: string;
  price: number;
  quantity: number;
  subtotal: number;
  image: string;
}

export interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface ShippingInfo {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface PaymentInfo {
  method: 'credit_card' | 'debit_card';
  lastFourDigits: string;
  cardHolder: string;
  status: 'pending' | 'approved' | 'rejected';
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: 'customer' | 'admin';
  createdAt: Date;
}
