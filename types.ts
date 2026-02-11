export enum OrderStatus {
  PENDING = 'pending',
  ATTEMPT = 'attempt',
  REJECTED = 'rejected',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  CONFIRMED = 'confirmed',
  UPLOADED = 'uploaded'
}

export enum Platform {
  FACEBOOK = 'facebook',
  INSTAGRAM = 'instagram',
  CONVERTY = 'converty'
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  platform_id: string;
  platform_type: Platform;
  avatar_url?: string;
}

export interface Order {
  id: string;
  store_id: string;
  customer: Customer;
  converty_order_id: string;
  delivery_order_id?: string;
  status: OrderStatus;
  total_amount: number;
  items_count: number;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  estimated_restock_date?: string | null;
  image_url: string;
  variations?: Record<string, any>;
}

export interface Message {
  id: string;
  platform: Platform;
  customer_id: string;
  customer_name: string;
  content: string;
  is_ai_reply: boolean;
  is_comment: boolean;
  created_at: string;
}

export interface Conversation {
  customer_id: string;
  customer_name: string;
  platform: Platform;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  messages: Message[];
}

export interface KPI {
  revenue: number;
  revenue_growth: number;
  orders: number;
  orders_growth: number;
  ai_handled_rate: number;
  pending_shipments: number;
}