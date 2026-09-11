export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled'
export type PaymentStatus = 'Paid' | 'Pending' | 'Refunded'
export type PaymentMethod = 'Credit Card' | 'PayPal' | 'Apple Pay' | 'Cash on Delivery'

export interface OrderItem {
  id: string
  productName: string
  color: string
  colorHex: string
  size: string
  quantity: number
  unitPrice: number
  image: string
}

export interface CustomerInfo {
  name: string
  email: string
  phone: string
  avatar?: string
}

export interface ShippingAddress {
  street: string
  city: string
  state: string
  zipCode: string
  country: string
}

export interface Order {
  id: string
  orderNumber: string
  customer: CustomerInfo
  shippingAddress: ShippingAddress
  items: OrderItem[]
  subtotal: number
  shippingFee: number
  tax: number
  discount: number
  totalAmount: number
  orderStatus: OrderStatus
  paymentStatus: PaymentStatus
  paymentMethod: PaymentMethod
  trackingNumber?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-1001',
    orderNumber: 'ORD-2026-8801',
    customer: {
      name: 'Sarah Jenkins',
      email: 'sarah.j@example.com',
      phone: '+1 (555) 234-5678',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    },
    shippingAddress: {
      street: '742 Evergreen Terrace',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62704',
      country: 'United States',
    },
    items: [
      {
        id: 'item-1',
        productName: 'Organic Cotton Pastel Romper',
        color: 'Coral Pink',
        colorHex: '#F472B6',
        size: '6-12M',
        quantity: 2,
        unitPrice: 24.99,
        image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=200&auto=format&fit=crop&q=80',
      },
      {
        id: 'item-2',
        productName: 'Soft Ribbed Baby Beanie',
        color: 'Soft Yellow',
        colorHex: '#FEF08A',
        size: '6M',
        quantity: 1,
        unitPrice: 12.50,
        image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=200&auto=format&fit=crop&q=80',
      },
    ],
    subtotal: 62.48,
    shippingFee: 5.00,
    tax: 4.37,
    discount: 5.00,
    totalAmount: 66.85,
    orderStatus: 'Delivered',
    paymentStatus: 'Paid',
    paymentMethod: 'Credit Card',
    trackingNumber: 'TRK-98421034US',
    notes: 'Please leave package at the front porch.',
    createdAt: '2026-09-10T14:22:00Z',
    updatedAt: '2026-09-11T09:15:00Z',
  },
  {
    id: 'ord-1002',
    orderNumber: 'ORD-2026-8802',
    customer: {
      name: 'Michael Miller',
      email: 'm.miller@example.com',
      phone: '+1 (555) 876-5432',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
    shippingAddress: {
      street: '128 Pinecrest Drive',
      city: 'Austin',
      state: 'TX',
      zipCode: '78701',
      country: 'United States',
    },
    items: [
      {
        id: 'item-3',
        productName: 'Toddler Denim Jacket with Fleece Collar',
        color: 'Classic Blue',
        colorHex: '#007AFF',
        size: '2T',
        quantity: 1,
        unitPrice: 42.00,
        image: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=200&auto=format&fit=crop&q=80',
      },
    ],
    subtotal: 42.00,
    shippingFee: 0.00,
    tax: 3.46,
    discount: 0.00,
    totalAmount: 45.46,
    orderStatus: 'Shipped',
    paymentStatus: 'Paid',
    paymentMethod: 'PayPal',
    trackingNumber: 'FEDEX-441209381',
    createdAt: '2026-09-11T10:05:00Z',
    updatedAt: '2026-09-11T15:30:00Z',
  },
  {
    id: 'ord-1003',
    orderNumber: 'ORD-2026-8803',
    customer: {
      name: 'Emily Watson',
      email: 'emily.watson@example.com',
      phone: '+1 (555) 345-6789',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
    shippingAddress: {
      street: '450 Sunset Boulevard',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90028',
      country: 'United States',
    },
    items: [
      {
        id: 'item-4',
        productName: 'Floral Print Summer Sundress',
        color: 'Sunshine Yellow',
        colorHex: '#FFCC00',
        size: '4T',
        quantity: 2,
        unitPrice: 28.99,
        image: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=200&auto=format&fit=crop&q=80',
      },
      {
        id: 'item-5',
        productName: 'Cozy Fleece Bear Hoodie',
        color: 'Teddy Brown',
        colorHex: '#78350F',
        size: '4T',
        quantity: 1,
        unitPrice: 34.50,
        image: 'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=200&auto=format&fit=crop&q=80',
      },
    ],
    subtotal: 92.48,
    shippingFee: 8.00,
    tax: 7.40,
    discount: 10.00,
    totalAmount: 97.88,
    orderStatus: 'Processing',
    paymentStatus: 'Paid',
    paymentMethod: 'Apple Pay',
    createdAt: '2026-09-11T12:30:00Z',
    updatedAt: '2026-09-11T13:00:00Z',
  },
  {
    id: 'ord-1004',
    orderNumber: 'ORD-2026-8804',
    customer: {
      name: 'David Kim',
      email: 'dkim.tech@example.com',
      phone: '+1 (555) 987-6543',
    },
    shippingAddress: {
      street: '88 Market Street, Apt 4B',
      city: 'Seattle',
      state: 'WA',
      zipCode: '98101',
      country: 'United States',
    },
    items: [
      {
        id: 'item-6',
        productName: 'Kids Athletic Track Pants',
        color: 'Navy Blue',
        colorHex: '#1E293B',
        size: '5T',
        quantity: 3,
        unitPrice: 19.99,
        image: 'https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=200&auto=format&fit=crop&q=80',
      },
    ],
    subtotal: 59.97,
    shippingFee: 5.00,
    tax: 4.80,
    discount: 0.00,
    totalAmount: 69.77,
    orderStatus: 'Pending',
    paymentStatus: 'Pending',
    paymentMethod: 'Cash on Delivery',
    notes: 'Call customer before delivery.',
    createdAt: '2026-09-11T16:10:00Z',
    updatedAt: '2026-09-11T16:10:00Z',
  },
  {
    id: 'ord-1005',
    orderNumber: 'ORD-2026-8805',
    customer: {
      name: 'Jessica Taylor',
      email: 'jess.taylor@example.com',
      phone: '+1 (555) 456-7890',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    },
    shippingAddress: {
      street: '312 Maple Avenue',
      city: 'Denver',
      state: 'CO',
      zipCode: '80202',
      country: 'United States',
    },
    items: [
      {
        id: 'item-7',
        productName: 'Unisex Cotton Pajama Set',
        color: 'Mint Green',
        colorHex: '#A7F3D0',
        size: '3T',
        quantity: 2,
        unitPrice: 22.00,
        image: 'https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?w=200&auto=format&fit=crop&q=80',
      },
    ],
    subtotal: 44.00,
    shippingFee: 5.00,
    tax: 3.52,
    discount: 4.00,
    totalAmount: 48.52,
    orderStatus: 'Cancelled',
    paymentStatus: 'Refunded',
    paymentMethod: 'Credit Card',
    notes: 'Customer requested cancellation due to incorrect size selection.',
    createdAt: '2026-09-09T08:15:00Z',
    updatedAt: '2026-09-09T11:40:00Z',
  },
]

const ORDERS_STORAGE_KEY = 'baha_admin_orders'

export function getStoredOrders(): Order[] {
  try {
    const data = localStorage.getItem(ORDERS_STORAGE_KEY)
    if (!data) {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(INITIAL_ORDERS))
      return INITIAL_ORDERS
    }
    return JSON.parse(data)
  } catch {
    return INITIAL_ORDERS
  }
}

export function saveStoredOrders(orders: Order[]): void {
  try {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders))
  } catch (err) {
    console.error('Failed to save orders to localStorage:', err)
  }
}
