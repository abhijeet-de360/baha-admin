export type CustomerStatus = 'Active' | 'VIP' | 'Inactive' | 'Blocked'
export type CustomerGroup = 'Regular' | 'VIP' | 'Wholesale' | 'New'

export interface CustomerAddress {
  street: string
  city: string
  state: string
  zipCode: string
  country: string
}

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  avatar?: string
  status: CustomerStatus
  group: CustomerGroup
  totalOrders: number
  totalSpent: number
  lastOrderDate: string
  address: CustomerAddress
  notes?: string
  createdAt: string
}

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'CUST-1001',
    name: 'Sarah Jenkins',
    email: 'sarah.j@example.com',
    phone: '+1 (555) 234-5678',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    status: 'VIP',
    group: 'VIP',
    totalOrders: 14,
    totalSpent: 842.50,
    lastOrderDate: '2026-09-10T14:22:00Z',
    address: {
      street: '742 Evergreen Terrace',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62704',
      country: 'United States',
    },
    notes: 'Frequent buyer of organic baby rompers. Prefers eco-friendly packaging.',
    createdAt: '2025-11-12T08:30:00Z',
  },
  {
    id: 'CUST-1002',
    name: 'Michael Miller',
    email: 'm.miller@example.com',
    phone: '+1 (555) 876-5432',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    status: 'Active',
    group: 'Regular',
    totalOrders: 6,
    totalSpent: 310.20,
    lastOrderDate: '2026-09-11T10:05:00Z',
    address: {
      street: '128 Pinecrest Drive',
      city: 'Austin',
      state: 'TX',
      zipCode: '78701',
      country: 'United States',
    },
    notes: 'Bought toddler jackets and winter hoodies.',
    createdAt: '2026-01-05T11:20:00Z',
  },
  {
    id: 'CUST-1003',
    name: 'Emily Watson',
    email: 'emily.watson@example.com',
    phone: '+1 (555) 345-6789',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    status: 'VIP',
    group: 'VIP',
    totalOrders: 19,
    totalSpent: 1250.75,
    lastOrderDate: '2026-09-11T12:30:00Z',
    address: {
      street: '450 Sunset Boulevard',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90028',
      country: 'United States',
    },
    notes: 'Mom & fashion blogger. Often posts Baha products on Instagram.',
    createdAt: '2025-08-19T15:45:00Z',
  },
  {
    id: 'CUST-1004',
    name: 'David Kim',
    email: 'dkim.tech@example.com',
    phone: '+1 (555) 987-6543',
    status: 'Active',
    group: 'Regular',
    totalOrders: 3,
    totalSpent: 185.40,
    lastOrderDate: '2026-09-11T16:10:00Z',
    address: {
      street: '88 Market Street, Apt 4B',
      city: 'Seattle',
      state: 'WA',
      zipCode: '98101',
      country: 'United States',
    },
    notes: 'Prefers Cash on Delivery payments.',
    createdAt: '2026-04-14T09:10:00Z',
  },
  {
    id: 'CUST-1005',
    name: 'Jessica Taylor',
    email: 'jess.taylor@example.com',
    phone: '+1 (555) 456-7890',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    status: 'Inactive',
    group: 'Regular',
    totalOrders: 2,
    totalSpent: 98.50,
    lastOrderDate: '2026-09-09T08:15:00Z',
    address: {
      street: '312 Maple Avenue',
      city: 'Denver',
      state: 'CO',
      zipCode: '80202',
      country: 'United States',
    },
    notes: 'Had one order cancelled due to size selection.',
    createdAt: '2026-02-28T14:00:00Z',
  },
  {
    id: 'CUST-1006',
    name: 'Amanda Foster',
    email: 'amanda.f@example.com',
    phone: '+1 (555) 678-1234',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    status: 'Active',
    group: 'Wholesale',
    totalOrders: 8,
    totalSpent: 3450.00,
    lastOrderDate: '2026-09-02T16:00:00Z',
    address: {
      street: '1204 Commerce St',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601',
      country: 'United States',
    },
    notes: 'Boutique owner purchasing in bulk for seasonal stock.',
    createdAt: '2025-06-10T10:00:00Z',
  },
  {
    id: 'CUST-1007',
    name: 'Robert Chen',
    email: 'robert.chen@example.com',
    phone: '+1 (555) 321-7654',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    status: 'Active',
    group: 'New',
    totalOrders: 1,
    totalSpent: 45.00,
    lastOrderDate: '2026-09-05T18:30:00Z',
    address: {
      street: '75 Peachtree Rd',
      city: 'Atlanta',
      state: 'GA',
      zipCode: '30303',
      country: 'United States',
    },
    notes: 'First time buyer via summer sale promotion.',
    createdAt: '2026-09-04T12:15:00Z',
  },
  {
    id: 'CUST-1008',
    name: 'Elena Rostova',
    email: 'elena.rostova@example.com',
    phone: '+1 (555) 890-4321',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    status: 'Blocked',
    group: 'Regular',
    totalOrders: 4,
    totalSpent: 210.00,
    lastOrderDate: '2026-07-12T11:00:00Z',
    address: {
      street: '99 Ocean Drive',
      city: 'Miami',
      state: 'FL',
      zipCode: '33139',
      country: 'United States',
    },
    notes: 'Blocked due to repeated fraudulent chargeback claims.',
    createdAt: '2026-01-20T09:45:00Z',
  }
]

const CUSTOMERS_STORAGE_KEY = 'baha_admin_customers'

export function getStoredCustomers(): Customer[] {
  try {
    const data = localStorage.getItem(CUSTOMERS_STORAGE_KEY)
    if (!data) {
      localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(INITIAL_CUSTOMERS))
      return INITIAL_CUSTOMERS
    }
    return JSON.parse(data)
  } catch {
    return INITIAL_CUSTOMERS
  }
}

export function saveStoredCustomers(customers: Customer[]): void {
  try {
    localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(customers))
  } catch (err) {
    console.error('Failed to save customers to localStorage:', err)
  }
}
