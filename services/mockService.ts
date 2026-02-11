import { Order, OrderStatus, Product, Conversation, KPI, Platform } from '../types';

export const getKPIs = (): KPI => ({
  revenue: 528976.82,
  revenue_growth: 7.9,
  orders: 1243,
  orders_growth: 12.5,
  ai_handled_rate: 89,
  pending_shipments: 45
});

export const getRecentOrders = (): Order[] => [
  {
    id: 'ORD-001',
    store_id: 'STR-1',
    customer: { id: 'CUST-1', name: 'Armin A.', phone: '+216 20 123 456', platform_id: 'fb-1', platform_type: Platform.FACEBOOK },
    converty_order_id: '#9921',
    status: OrderStatus.PENDING,
    total_amount: 120.50,
    items_count: 2,
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString()
  },
  {
    id: 'ORD-002',
    store_id: 'STR-1',
    customer: { id: 'CUST-2', name: 'Mikasa A.', phone: '+216 98 765 432', platform_id: 'ig-1', platform_type: Platform.INSTAGRAM },
    converty_order_id: '#9920',
    status: OrderStatus.DELIVERED,
    total_amount: 85.00,
    items_count: 1,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
  },
  {
    id: 'ORD-003',
    store_id: 'STR-2',
    customer: { id: 'CUST-3', name: 'Eren Y.', phone: '+216 50 555 111', platform_id: 'fb-2', platform_type: Platform.FACEBOOK },
    converty_order_id: '#9919',
    status: OrderStatus.ATTEMPT,
    total_amount: 210.00,
    items_count: 3,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString()
  },
  {
    id: 'ORD-004',
    store_id: 'STR-1',
    customer: { id: 'CUST-4', name: 'Jean K.', phone: '+216 21 000 999', platform_id: 'ig-2', platform_type: Platform.INSTAGRAM },
    converty_order_id: '#9918',
    status: OrderStatus.CANCELLED,
    total_amount: 45.00,
    items_count: 1,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
  }
];

export const getProducts = (): Product[] => [
  {
    id: 'PROD-1',
    name: 'Wireless Noise Cancelling Headphones',
    description: 'Premium sound quality with 20h battery life.',
    price: 299.00,
    stock: 12,
    image_url: 'https://picsum.photos/200/200',
  },
  {
    id: 'PROD-2',
    name: 'Smart Fitness Watch V2',
    description: 'Track your health and workouts.',
    price: 159.00,
    stock: 0,
    estimated_restock_date: '2023-11-15',
    image_url: 'https://picsum.photos/201/201',
  },
  {
    id: 'PROD-3',
    name: 'Ergonomic Office Chair',
    description: 'Lumbar support for long working hours.',
    price: 450.00,
    stock: 5,
    image_url: 'https://picsum.photos/202/202',
  }
];

export const getConversations = (): Conversation[] => [
  {
    customer_id: 'CUST-1',
    customer_name: 'Armin A.',
    platform: Platform.FACEBOOK,
    last_message: 'Is the black color available?',
    last_message_time: '10 mins ago',
    unread_count: 1,
    messages: [
      { id: 'm1', platform: Platform.FACEBOOK, customer_id: 'CUST-1', customer_name: 'Armin A.', content: 'Hi, I saw your ad for the headphones.', is_ai_reply: false, is_comment: false, created_at: '10:00 AM' },
      { id: 'm2', platform: Platform.FACEBOOK, customer_id: 'CUST-1', customer_name: 'AI Agent', content: 'Hello! Yes, the Wireless Noise Cancelling Headphones are currently in stock. They cost 299 TND. Would you like to know about the warranty?', is_ai_reply: true, is_comment: false, created_at: '10:01 AM' },
      { id: 'm3', platform: Platform.FACEBOOK, customer_id: 'CUST-1', customer_name: 'Armin A.', content: 'Is the black color available?', is_ai_reply: false, is_comment: false, created_at: '10:05 AM' }
    ]
  },
  {
    customer_id: 'CUST-2',
    customer_name: 'Mikasa A.',
    platform: Platform.INSTAGRAM,
    last_message: 'Order confirmed: #9920',
    last_message_time: '2 hours ago',
    unread_count: 0,
    messages: [
      { id: 'm4', platform: Platform.INSTAGRAM, customer_id: 'CUST-2', customer_name: 'Mikasa A.', content: 'Where is my order?', is_ai_reply: false, is_comment: true, created_at: '08:00 AM' },
      { id: 'm5', platform: Platform.INSTAGRAM, customer_id: 'CUST-2', customer_name: 'AI Agent', content: 'Checking... Your order #9920 was delivered today at 9:00 AM. We hope you enjoy it!', is_ai_reply: true, is_comment: false, created_at: '08:01 AM' }
    ]
  }
];