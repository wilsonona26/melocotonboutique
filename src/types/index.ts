// Product variants
export interface ProductVariant {
  id: string;
  size: string;
  color: string;
  stock: number;
  sku: string;
}

export interface Product {
  id: string;
  code: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  publicPrice: number;
  wholesalePrice: number;
  stock: number;
  images: string[];
  variants: ProductVariant[];
  featured: boolean;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariant?: ProductVariant;
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
  discount: number;
  total: number;
  paymentInfo: PaymentInfo;
  status: OrderStatus;
  trackingNumber?: string;
  notes?: string;
  couponCode?: string;
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
  variant?: string;
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

// Inventory
export interface InventoryMovement {
  id: string;
  productId: string;
  productName: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  createdAt: Date;
  createdBy: string;
}

// Marketing
export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  maxUses: number;
  currentUses: number;
  active: boolean;
  expiresAt: Date;
  createdAt: Date;
}

export interface PromoBanner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  linkUrl: string;
  active: boolean;
  order: number;
  createdAt: Date;
}

// Customer
export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  createdAt: Date;
}

export interface SavedAddress {
  id: string;
  userId: string;
  label: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

// Dashboard
export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  pendingOrders: number;
  monthlyRevenue: number;
  weeklyRevenue: number;
  lowStockProducts: Product[];
  recentOrders: Order[];
}
