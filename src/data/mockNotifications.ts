export type TargetAudience = 'All Users' | 'VIP Customers' | 'New Users' | 'Wholesale Buyers'
export type NotificationType = 'Promotional' | 'System Alert' | 'Discount Offer' | 'Product Drop'
export type NotificationStatus = 'Sent' | 'Scheduled' | 'Draft'

export interface NotificationItem {
  id: string
  title: string
  body: string
  targetAudience: TargetAudience
  type: NotificationType
  status: NotificationStatus
  sentAt?: string
  scheduledFor?: string
  recipientsCount: number
  openRate: number // percentage e.g. 45.2
  actionUrl?: string
  promoCode?: string
  image?: string
  createdAt: string
}

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'NOTIF-1001',
    title: '🎉 Flash Sale Alert: 25% Off Summer Collection!',
    body: 'Exclusive 24-hour flash sale on all organic toddler dresses and summer rompers. Use code SUMMER25 at checkout!',
    targetAudience: 'All Users',
    type: 'Discount Offer',
    status: 'Sent',
    sentAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
    recipientsCount: 1450,
    openRate: 52.4,
    actionUrl: '/products/sale',
    promoCode: 'SUMMER25',
    image: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=300&auto=format&fit=crop&q=80',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'NOTIF-1002',
    title: '⭐ VIP Exclusive Early Access: Winter Overalls',
    body: 'As a valued VIP member, enjoy early access to our handcrafted fleece winter hoodie collection before public release.',
    targetAudience: 'VIP Customers',
    type: 'Product Drop',
    status: 'Sent',
    sentAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    recipientsCount: 230,
    openRate: 78.5,
    actionUrl: '/products/new-arrivals',
    image: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=300&auto=format&fit=crop&q=80',
    createdAt: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'NOTIF-1003',
    title: '🎁 Welcome Bonus: Free Shipping on First Order',
    body: 'Welcome to Baha Kids Fashion! Enjoy free express shipping on your first purchase with code WELCOMEFREE.',
    targetAudience: 'New Users',
    type: 'Promotional',
    status: 'Sent',
    sentAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), // 2 days ago
    recipientsCount: 380,
    openRate: 41.2,
    promoCode: 'WELCOMEFREE',
    createdAt: new Date(Date.now() - 50 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'NOTIF-1004',
    title: '⚠️ Scheduled Maintenance Notice',
    body: 'Baha app payments will undergo scheduled infrastructure upgrades tonight between 2 AM - 3 AM EST.',
    targetAudience: 'All Users',
    type: 'System Alert',
    status: 'Scheduled',
    scheduledFor: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
    recipientsCount: 1500,
    openRate: 0,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'NOTIF-1005',
    title: '🍂 Autumn Festive Collection Sneak Peek',
    body: 'Get ready for cozy autumn vibes! Check out our upcoming organic knit sweaters dropping next week.',
    targetAudience: 'All Users',
    type: 'Product Drop',
    status: 'Draft',
    recipientsCount: 0,
    openRate: 0,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
]

const NOTIFICATIONS_STORAGE_KEY = 'baha_admin_notifications'

export function getStoredNotifications(): NotificationItem[] {
  try {
    const data = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY)
    if (!data) {
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(INITIAL_NOTIFICATIONS))
      return INITIAL_NOTIFICATIONS
    }
    return JSON.parse(data)
  } catch {
    return INITIAL_NOTIFICATIONS
  }
}

export function saveStoredNotifications(notifications: NotificationItem[]): void {
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications))
  } catch (err) {
    console.error('Failed to save notifications to localStorage:', err)
  }
}
