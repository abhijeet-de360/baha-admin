export type BannerType = 'Hero Slider'
export type BannerStatus = 'Active' | 'Inactive' | 'Scheduled'

export interface Banner {
  id: string
  title: string
  subtitle: string
  buttonText: string
  buttonLink: string
  imageUrl: string
  mobileImageUrl?: string
  type: BannerType
  status: BannerStatus
  order: number
  startDate?: string
  endDate?: string
  createdAt: string
}

export const INITIAL_BANNERS: Banner[] = [
  {
    id: 'SLD-1001',
    title: 'Spring Organic Baby Collection 2026',
    subtitle: 'Ultra-soft 100% GOTS certified organic cotton for newborns & toddlers',
    buttonText: 'Shop New Arrivals',
    buttonLink: '/categories/organic-cotton',
    imageUrl: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1200&auto=format&fit=crop&q=80',
    mobileImageUrl: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&auto=format&fit=crop&q=80',
    type: 'Hero Slider',
    status: 'Active',
    order: 1,
    startDate: '2026-03-01',
    endDate: '2026-05-31',
    createdAt: '2026-02-15T10:00:00Z',
  },
  {
    id: 'SLD-1002',
    title: 'Festive Tuxedo & Party Wear Sale',
    subtitle: 'Flat 40% OFF on birthday tuxedos, dresses & wedding outfits for kids',
    buttonText: 'Explore Party Wear',
    buttonLink: '/categories/party-wear',
    imageUrl: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=1200&auto=format&fit=crop&q=80',
    type: 'Hero Slider',
    status: 'Active',
    order: 2,
    startDate: '2026-03-10',
    endDate: '2026-04-15',
    createdAt: '2026-02-20T14:30:00Z',
  },
  {
    id: 'SLD-1003',
    title: 'Cozy Fleece & Knitwear Special',
    subtitle: 'Warm hoodies, beanies, and winter sets designed for maximum comfort',
    buttonText: 'Shop Knitwear',
    buttonLink: '/categories/winter-wear',
    imageUrl: 'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=1200&auto=format&fit=crop&q=80',
    type: 'Hero Slider',
    status: 'Active',
    order: 3,
    createdAt: '2026-01-10T09:00:00Z',
  },
  {
    id: 'SLD-1004',
    title: 'Summer Essentials: Buy 2 Get 1 Free',
    subtitle: 'Mix and match colorful summer tees, shorts & playsuits for your little ones',
    buttonText: 'Claim Offer',
    buttonLink: '/offers/summer-b2g1',
    imageUrl: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=1200&auto=format&fit=crop&q=80',
    type: 'Hero Slider',
    status: 'Scheduled',
    order: 4,
    startDate: '2026-04-01',
    endDate: '2026-06-30',
    createdAt: '2026-02-28T11:15:00Z',
  },
  {
    id: 'SLD-1005',
    title: 'Back to School 2026 Early Bird Deal',
    subtitle: 'Get ready for school with durable backpacks, shoes & uniform tees',
    buttonText: 'Preview Collection',
    buttonLink: '/categories/back-to-school',
    imageUrl: 'https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=1200&auto=format&fit=crop&q=80',
    type: 'Hero Slider',
    status: 'Inactive',
    order: 5,
    startDate: '2026-07-01',
    endDate: '2026-08-31',
    createdAt: '2026-03-05T16:00:00Z',
  },
]
