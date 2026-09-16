export interface Coupon {
  id: string
  code: string
  description: string
  discountType: 'percentage' | 'fixed' | 'free_shipping'
  discountValue: number
  minSpend: number
  maxDiscount?: number
  usageLimit: number | null // null = unlimited
  usedCount: number
  perCustomerLimit: number
  startDate: string
  endDate: string
  status: 'Active' | 'Scheduled' | 'Expired' | 'Draft'
  applicableCategories?: string[]
}

export const INITIAL_COUPONS: Coupon[] = [
  {
    id: 'coup-1',
    code: 'WELCOME20',
    description: 'Get 20% off on your first order across all kids fashion categories.',
    discountType: 'percentage',
    discountValue: 20,
    minSpend: 499,
    maxDiscount: 200,
    usageLimit: 500,
    usedCount: 342,
    perCustomerLimit: 1,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    status: 'Active',
    applicableCategories: ['Boys Collection', 'Girls Collection', 'Baby & Toddlers'],
  },
  {
    id: 'coup-2',
    code: 'SUMMERKIDS',
    description: 'Flat ₹300 OFF on summer collection orders above ₹1,499.',
    discountType: 'fixed',
    discountValue: 300,
    minSpend: 1499,
    usageLimit: 200,
    usedCount: 188,
    perCustomerLimit: 2,
    startDate: '2026-05-01',
    endDate: '2026-09-30',
    status: 'Active',
    applicableCategories: ['Summer Shorts & Tees', 'Boys Collection'],
  },
  {
    id: 'coup-3',
    code: 'FREESHIP100',
    description: 'Free Shipping on all toddler and newborn essential outfits.',
    discountType: 'free_shipping',
    discountValue: 0,
    minSpend: 299,
    usageLimit: 1000,
    usedCount: 712,
    perCustomerLimit: 5,
    startDate: '2026-02-01',
    endDate: '2026-10-31',
    status: 'Active',
    applicableCategories: ['Newborn Essentials', 'Baby & Toddlers'],
  },
  {
    id: 'coup-4',
    code: 'FESTIVE500',
    description: 'Exclusive ₹500 OFF on festive and party wear outfits.',
    discountType: 'fixed',
    discountValue: 500,
    minSpend: 2499,
    usageLimit: 150,
    usedCount: 150,
    perCustomerLimit: 1,
    startDate: '2026-01-15',
    endDate: '2026-03-31',
    status: 'Expired',
    applicableCategories: ['Party & Festive Wear'],
  },
  {
    id: 'coup-5',
    code: 'WINTER30',
    description: 'Early bird 30% OFF discount on winter jackets & outer wear.',
    discountType: 'percentage',
    discountValue: 30,
    minSpend: 999,
    maxDiscount: 600,
    usageLimit: 300,
    usedCount: 0,
    perCustomerLimit: 1,
    startDate: '2026-11-01',
    endDate: '2026-12-31',
    status: 'Scheduled',
    applicableCategories: ['Winter & Outerwear'],
  },
  {
    id: 'coup-6',
    code: 'VIPKIDS15',
    description: 'Extra 15% discount for VIP customer loyalty program members.',
    discountType: 'percentage',
    discountValue: 15,
    minSpend: 799,
    maxDiscount: 350,
    usageLimit: null, // Unlimited
    usedCount: 94,
    perCustomerLimit: 3,
    startDate: '2026-03-01',
    endDate: '2026-12-31',
    status: 'Active',
    applicableCategories: ['All Categories'],
  },
]
