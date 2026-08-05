export type Role = "customer" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  highlights: string[];
  category: string;
  price: number;
  stock: number;
  image: string;
  createdAt: string;
}

export interface CartLineItem {
  productId: string;
  title: string;
  price: number;
  image: string;
  stock: number;
  quantity: number;
  lineTotal: number;
}

export interface Cart {
  items: CartLineItem[];
  total: number;
}

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

export interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  shippingAddress: string;
  createdAt: string;
  customerName?: string;
  customerEmail?: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalCustomers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  lowStock: number;
}
