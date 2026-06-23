// Roles & Permissions
export type UserRole = 'CUSTOMER' | 'STAFF' | 'ADMIN' | 'SUPER_ADMIN';

export interface RolePermissions {
  canAccessAdmin: boolean;
  canViewProducts: boolean;
  canCreateProducts: boolean;
  canEditProducts: boolean;
  canDeleteProducts: boolean;
  canUploadImages: boolean;
  canManageInventory: boolean;
  canViewOrders: boolean;
  canUpdateOrderStatus: boolean;
  canManageOrders: boolean;
  canManageBanners: boolean;
  canManageCoupons: boolean;
  canViewReports: boolean;
  canManageUsers: boolean;
  canAssignRoles: boolean;
  canViewAuditLogs: boolean;
  canManageSettings: boolean;
  canImportProducts: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  CUSTOMER: {
    canAccessAdmin: false,
    canViewProducts: true,
    canCreateProducts: false,
    canEditProducts: false,
    canDeleteProducts: false,
    canUploadImages: false,
    canManageInventory: false,
    canViewOrders: false,
    canUpdateOrderStatus: false,
    canManageOrders: false,
    canManageBanners: false,
    canManageCoupons: false,
    canViewReports: false,
    canManageUsers: false,
    canAssignRoles: false,
    canViewAuditLogs: false,
    canManageSettings: false,
    canImportProducts: false,
  },
  STAFF: {
    canAccessAdmin: true,
    canViewProducts: true,
    canCreateProducts: false,
    canEditProducts: false,
    canDeleteProducts: false,
    canUploadImages: false,
    canManageInventory: true,
    canViewOrders: true,
    canUpdateOrderStatus: true,
    canManageOrders: false,
    canManageBanners: false,
    canManageCoupons: false,
    canViewReports: false,
    canManageUsers: false,
    canAssignRoles: false,
    canViewAuditLogs: false,
    canManageSettings: false,
    canImportProducts: false,
  },
  ADMIN: {
    canAccessAdmin: true,
    canViewProducts: true,
    canCreateProducts: true,
    canEditProducts: true,
    canDeleteProducts: true,
    canUploadImages: true,
    canManageInventory: true,
    canViewOrders: true,
    canUpdateOrderStatus: true,
    canManageOrders: true,
    canManageBanners: true,
    canManageCoupons: true,
    canViewReports: true,
    canManageUsers: false,
    canAssignRoles: false,
    canViewAuditLogs: false,
    canManageSettings: false,
    canImportProducts: true,
  },
  SUPER_ADMIN: {
    canAccessAdmin: true,
    canViewProducts: true,
    canCreateProducts: true,
    canEditProducts: true,
    canDeleteProducts: true,
    canUploadImages: true,
    canManageInventory: true,
    canViewOrders: true,
    canUpdateOrderStatus: true,
    canManageOrders: true,
    canManageBanners: true,
    canManageCoupons: true,
    canViewReports: true,
    canManageUsers: true,
    canAssignRoles: true,
    canViewAuditLogs: true,
    canManageSettings: true,
    canImportProducts: true,
  },
};

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
  brand: string;
  publicPrice: number;
  wholesalePrice: number;
  stock: number;
  images: string[];
  mainImage: number;
  variants: ProductVariant[];
  featured: boolean;
  active: boolean;
  color: string;
  size: string;
  tags: string[];
  seoTitle: string;
  seoDescription: string;
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
  role: UserRole;
  active: boolean;
  createdAt: Date;
  updatedAt?: Date;
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

// Audit Log
export interface AuditLog {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: string;
  createdAt: Date;
}

// Notification
export interface UserNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'order' | 'stock' | 'promo' | 'system';
  read: boolean;
  link?: string;
  createdAt: Date;
}

// Product Import
export interface ProductImportRow {
  sku: string;
  code: string;
  name: string;
  description: string;
  category: string;
  brand: string;
  publicPrice: number;
  wholesalePrice: number;
  stock: number;
  featured: boolean;
  active: boolean;
  color: string;
  size: string;
}

export interface ImportValidationResult {
  row: number;
  data: ProductImportRow;
  valid: boolean;
  errors: string[];
  isDuplicate: boolean;
}

// AI Product Generator
export interface AIProductSuggestion {
  title: string;
  description: string;
  shortDescription: string;
  whatsappMessage: string;
  seoTitle: string;
  seoDescription: string;
  suggestedCategory: string;
  suggestedTags: string[];
}
