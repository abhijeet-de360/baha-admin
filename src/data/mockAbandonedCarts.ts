export type CartStatus = 'Pending' | 'Reminder Sent' | 'Recovered' | 'Expired'
export type CheckoutStep = 'Cart View' | 'Contact Info' | 'Shipping Details' | 'Payment Step'

export interface AbandonedCartItem {
  id: string
  productId: string
  name: string
  image: string
  color: string
  size: string
  price: number
  quantity: number
}

export interface AbandonedCart {
  id: string
  cartNumber: string
  customer: {
    id: string
    name: string
    email: string
    phone: string
    avatar?: string
    isRegistered: boolean
    group: 'Regular' | 'VIP' | 'New' | 'Guest'
  }
  items: AbandonedCartItem[]
  totalAmount: number
  totalItems: number
  checkoutStep: CheckoutStep
  status: CartStatus
  createdAt: string // when cart was abandoned
  lastUpdated: string
  remindersSent: number
  lastReminderAt?: string
  couponOffered?: string
}

export const INITIAL_ABANDONED_CARTS: AbandonedCart[] = [
  {
    id: 'CART-9001',
    cartNumber: '#AC-9001',
    customer: {
      id: 'CUST-1001',
      name: 'Sarah Jenkins',
      email: 'sarah.j@example.com',
      phone: '+1 (555) 234-5678',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      isRegistered: true,
      group: 'VIP',
    },
    items: [
      {
        id: 'ITEM-1',
        productId: 'PROD-101',
        name: 'Organic Cotton Baby Romper',
        image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=300&auto=format&fit=crop&q=80',
        color: 'Pastel Blue',
        size: '6-9M',
        price: 34.99,
        quantity: 2,
      },
      {
        id: 'ITEM-2',
        productId: 'PROD-104',
        name: 'Cozy Fleece Bear Hoodie',
        image: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=300&auto=format&fit=crop&q=80',
        color: 'Soft Caramel',
        size: '12-18M',
        price: 45.00,
        quantity: 1,
      },
    ],
    totalAmount: 114.98,
    totalItems: 3,
    checkoutStep: 'Payment Step',
    status: 'Pending',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    remindersSent: 0,
  },
  {
    id: 'CART-9002',
    cartNumber: '#AC-9002',
    customer: {
      id: 'CUST-1002',
      name: 'Michael Miller',
      email: 'm.miller@example.com',
      phone: '+1 (555) 876-5432',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      isRegistered: true,
      group: 'Regular',
    },
    items: [
      {
        id: 'ITEM-3',
        productId: 'PROD-108',
        name: 'Knit Ribbed Toddler Sweater',
        image: 'https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?w=300&auto=format&fit=crop&q=80',
        color: 'Sage Green',
        size: '2T',
        price: 42.50,
        quantity: 1,
      },
      {
        id: 'ITEM-4',
        productId: 'PROD-112',
        name: 'Floral Print Summer Dress',
        image: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=300&auto=format&fit=crop&q=80',
        color: 'Blush Pink',
        size: '3T',
        price: 38.00,
        quantity: 2,
      },
    ],
    totalAmount: 118.50,
    totalItems: 3,
    checkoutStep: 'Shipping Details',
    status: 'Reminder Sent',
    createdAt: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(),
    lastUpdated: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    remindersSent: 1,
    lastReminderAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    couponOffered: 'SAVE10',
  },
  {
    id: 'CART-9003',
    cartNumber: '#AC-9003',
    customer: {
      id: 'CUST-1003',
      name: 'Emily Watson',
      email: 'emily.watson@example.com',
      phone: '+1 (555) 345-6789',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      isRegistered: true,
      group: 'VIP',
    },
    items: [
      {
        id: 'ITEM-5',
        productId: 'PROD-115',
        name: 'Quilted Winter Puffer Overalls',
        image: 'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=300&auto=format&fit=crop&q=80',
        color: 'Navy Blue',
        size: '4T',
        price: 68.00,
        quantity: 1,
      },
      {
        id: 'ITEM-6',
        productId: 'PROD-120',
        name: 'Breathable Cotton Sleep Sack',
        image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=300&auto=format&fit=crop&q=80',
        color: 'Cream Oat',
        size: '0-6M',
        price: 29.99,
        quantity: 2,
      },
      {
        id: 'ITEM-7',
        productId: 'PROD-101',
        name: 'Organic Cotton Baby Romper',
        image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=300&auto=format&fit=crop&q=80',
        color: 'Mint Green',
        size: '3-6M',
        price: 34.99,
        quantity: 1,
      },
    ],
    totalAmount: 162.97,
    totalItems: 4,
    checkoutStep: 'Payment Step',
    status: 'Recovered',
    createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    remindersSent: 2,
    lastReminderAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    couponOffered: 'VIPFREE',
  },
  {
    id: 'CART-9004',
    cartNumber: '#AC-9004',
    customer: {
      id: 'CUST-1004',
      name: 'David Kim',
      email: 'dkim.tech@example.com',
      phone: '+1 (555) 987-6543',
      isRegistered: true,
      group: 'Regular',
    },
    items: [
      {
        id: 'ITEM-8',
        productId: 'PROD-109',
        name: 'Denim Overalls & Tee Set',
        image: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=300&auto=format&fit=crop&q=80',
        color: 'Classic Wash',
        size: '18-24M',
        price: 52.00,
        quantity: 1,
      },
    ],
    totalAmount: 52.00,
    totalItems: 1,
    checkoutStep: 'Contact Info',
    status: 'Pending',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    lastUpdated: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    remindersSent: 0,
  },
  {
    id: 'CART-9005',
    cartNumber: '#AC-9005',
    customer: {
      id: 'CUST-1005',
      name: 'Jessica Taylor',
      email: 'jess.taylor@example.com',
      phone: '+1 (555) 456-7890',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      isRegistered: true,
      group: 'Regular',
    },
    items: [
      {
        id: 'ITEM-9',
        productId: 'PROD-130',
        name: 'Soft Bamboo Pajama Set',
        image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=300&auto=format&fit=crop&q=80',
        color: 'Lavender Swirl',
        size: '2T',
        price: 36.50,
        quantity: 3,
      },
      {
        id: 'ITEM-10',
        productId: 'PROD-131',
        name: 'Unisex Knit Booties Pack',
        image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=300&auto=format&fit=crop&q=80',
        color: 'Multicolor',
        size: '0-3M',
        price: 18.00,
        quantity: 1,
      },
    ],
    totalAmount: 127.50,
    totalItems: 4,
    checkoutStep: 'Cart View',
    status: 'Expired',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    lastUpdated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    remindersSent: 2,
    lastReminderAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'CART-9006',
    cartNumber: '#AC-9006',
    customer: {
      id: 'CUST-1006',
      name: 'Amanda Foster',
      email: 'amanda.f@example.com',
      phone: '+1 (555) 678-1234',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      isRegistered: true,
      group: 'Guest',
    },
    items: [
      {
        id: 'ITEM-11',
        productId: 'PROD-140',
        name: 'Handcrafted Wool Cardigan',
        image: 'https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?w=300&auto=format&fit=crop&q=80',
        color: 'Oatmeal',
        size: '12-18M',
        price: 54.99,
        quantity: 2,
      },
      {
        id: 'ITEM-12',
        productId: 'PROD-141',
        name: 'Ribbed Cotton Leggings 2-Pack',
        image: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=300&auto=format&fit=crop&q=80',
        color: 'Terracotta & Mustard',
        size: '12-18M',
        price: 28.00,
        quantity: 2,
      },
    ],
    totalAmount: 165.98,
    totalItems: 4,
    checkoutStep: 'Shipping Details',
    status: 'Reminder Sent',
    createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    lastUpdated: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    remindersSent: 1,
    lastReminderAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    couponOffered: 'SHIPPINGFREE',
  },
  {
    id: 'CART-9007',
    cartNumber: '#AC-9007',
    customer: {
      id: 'CUST-1007',
      name: 'Robert Chen',
      email: 'robert.chen@example.com',
      phone: '+1 (555) 321-7654',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      isRegistered: true,
      group: 'New',
    },
    items: [
      {
        id: 'ITEM-13',
        productId: 'PROD-104',
        name: 'Cozy Fleece Bear Hoodie',
        image: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=300&auto=format&fit=crop&q=80',
        color: 'Dusty Pink',
        size: '2T',
        price: 45.00,
        quantity: 1,
      },
    ],
    totalAmount: 45.00,
    totalItems: 1,
    checkoutStep: 'Payment Step',
    status: 'Pending',
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    lastUpdated: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    remindersSent: 0,
  },
  {
    id: 'CART-9008',
    cartNumber: '#AC-9008',
    customer: {
      id: 'CUST-1008',
      name: 'Elena Rostova',
      email: 'elena.rostova@example.com',
      phone: '+1 (555) 890-4321',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      isRegistered: false,
      group: 'Guest',
    },
    items: [
      {
        id: 'ITEM-14',
        productId: 'PROD-150',
        name: 'Waterproof Toddler Raincoat',
        image: 'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=300&auto=format&fit=crop&q=80',
        color: 'Sunshine Yellow',
        size: '3T',
        price: 49.99,
        quantity: 1,
      },
      {
        id: 'ITEM-15',
        productId: 'PROD-151',
        name: 'Matching Rain Boots',
        image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=300&auto=format&fit=crop&q=80',
        color: 'Yellow Accent',
        size: 'UK 7',
        price: 29.50,
        quantity: 1,
      },
    ],
    totalAmount: 79.49,
    totalItems: 2,
    checkoutStep: 'Shipping Details',
    status: 'Recovered',
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    lastUpdated: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    remindersSent: 1,
    lastReminderAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    couponOffered: 'WELCOME10',
  },
]

const ABANDONED_CARTS_STORAGE_KEY = 'baha_admin_abandoned_carts'

export function getStoredAbandonedCarts(): AbandonedCart[] {
  try {
    const data = localStorage.getItem(ABANDONED_CARTS_STORAGE_KEY)
    if (!data) {
      localStorage.setItem(ABANDONED_CARTS_STORAGE_KEY, JSON.stringify(INITIAL_ABANDONED_CARTS))
      return INITIAL_ABANDONED_CARTS
    }
    return JSON.parse(data)
  } catch {
    return INITIAL_ABANDONED_CARTS
  }
}

export function saveStoredAbandonedCarts(carts: AbandonedCart[]): void {
  try {
    localStorage.setItem(ABANDONED_CARTS_STORAGE_KEY, JSON.stringify(carts))
  } catch (err) {
    console.error('Failed to save abandoned carts to localStorage:', err)
  }
}

export function resetStoredAbandonedCarts(): AbandonedCart[] {
  try {
    localStorage.setItem(ABANDONED_CARTS_STORAGE_KEY, JSON.stringify(INITIAL_ABANDONED_CARTS))
    return INITIAL_ABANDONED_CARTS
  } catch {
    return INITIAL_ABANDONED_CARTS
  }
}
