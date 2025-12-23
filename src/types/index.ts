// User Types
export interface User {
  userId: number;
  email: string;
  customerId: string;
  customerName?: string;
  role: 'SUPER_ADMIN' | 'EDITOR' | 'CUSTOMER';
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

// Auth Types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  username?: string;
  customerId?: string;
  role?: string;
  expiresAt?: string;
}

// Dashboard Types
export interface DashboardStats {
  totalShipments: number;
  shippedShipments: number;
  pendingShipments: number;
  labelCreatedShipments: number;
  totalCustomers: number;
  pendingLabels: number;
  recentShipments: RecentShipment[];
}

export interface RecentShipment {
  shipmentId: number;
  orderCode: string;
  flexCode: string;
  customerCode: string;
  customerName: string;
  status: string;
  waybill?: string;
  createdAt: string;
}

// Shipment Types
export interface Shipment {
  shipmentId: number;
  orderCode: string;
  flexCode: string;
  customerCode: string;
  customerName: string;
  status: string;
  waybill?: string;
  shipCompany?: string;
  createdAt: string;
}

export interface ShipmentDetail extends Shipment {
  // Receiver Information
  receiverName?: string;
  receiverPhone?: string;
  receiverEmail?: string;
  receiverAddress?: string;
  receiverCity?: string;
  receiverState?: string;
  receiverZipCode?: string;
  receiverCountry?: string;
  
  // Package Details
  packageWeight?: number;
  packageLength?: number;
  packageWidth?: number;
  packageHeight?: number;
  packageDescription?: string;
  productImage?: string;
  productVariant?: string;
  productVariant2?: string;
  productQuantity?: number;
  productPrice?: number;
  
  // Pricing
  shippingCost?: number;
  currency?: string;
  
  // Additional Info
  isCreatedLabel?: boolean;
  labelDate?: string;
  isShipped?: boolean;
  shippedDate?: string;
  notes?: string;
}

// Customer Types
export interface Customer {
  customerId: number;
  customerCode: string;
  customerName: string;
  companyName?: string;
  email?: string;
  phone?: string;
  address?: string;
  province?: string;
  district?: string;
  createdAt: string;
  totalShipments?: number;
  activeShipments?: number;
  assignedAt?: string;
}

export interface CustomerDetail extends Customer {
  taxNumber?: string;
  taxOffice?: string;
  completedShipments?: number;
  labelCreatedShipments?: number;
}

export interface CustomerStats {
  totalCustomers: number;
  activeCustomers: number;
  inactiveCustomers: number;
}

// User Management Types
export interface CreateUserRequest {
  customerId: string;
  email: string;
  password: string;
  role: 'SUPER_ADMIN' | 'EDITOR' | 'CUSTOMER';
}

export interface AssignCustomerRequest {
  editorId: number;
  customerId: number;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}
