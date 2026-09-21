import slugify from 'slugify'

export interface Product {
  id: string
  title: string
  slug: string
  description: string
  category: string
  regularPrice: number
  salePrice?: number
  sku: string
  stockQuantity: number
  lowStockThreshold: number
  stockStatus: 'In Stock' | 'Low Stock' | 'Out of Stock'
  sizes: string[]
  images: string[]
  primaryImageIndex: number
  status: 'Active' | 'Inactive'
  createdAt: string
  featured?: boolean
  // Additional Specs
  color?: string
  colors?: string[]
  fabric?: string
  gender?: 'Boys' | 'Girls' | 'Unisex' | 'Babies'
  ageGroup?: string
  careInstructions?: string
  tags?: string[]
}

export const CATEGORIES_LIST = [
  'Boys Collection',
  'Girls Collection',
  'Baby & Toddlers',
  'Newborn Essentials',
  'Party & Festive Wear',
  'Winter & Outerwear',
  'Summer Shorts & Tees',
  'Sleepwear & Pajamas',
]

export const SIZES_LIST = ['0-3M', '3-6M', '6-12M', '12-18M', '2T', '3T', '4T', '5T', '6T', '7-8Y', '9-10Y']

export const generateSlug = (text: string): string => {
  return slugify(text, {
    lower: true,
    strict: true,
    trim: true,
  })
}

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    title: 'Cute Floral Summer Dress',
    slug: 'cute-floral-summer-dress',
    description: 'Lightweight breathable organic cotton dress with cheerful sunflower prints and back zipper.',
    category: 'Girls Collection',
    regularPrice: 34.99,
    salePrice: 27.99,
    sku: 'DRS-GRL-001',
    stockQuantity: 45,
    lowStockThreshold: 10,
    stockStatus: 'In Stock',
    sizes: ['2T', '3T', '4T', '5T'],
    images: [
      'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=600&auto=format&fit=crop&q=80',
    ],
    primaryImageIndex: 0,
    status: 'Active',
    createdAt: '2026-02-01',
    color: 'Yellow Floral',
    fabric: '100% Organic Cotton',
    gender: 'Girls',
    ageGroup: '2-5 Years',
    careInstructions: 'Machine wash cold inside out, tumble dry low.',
    tags: ['summer', 'floral', 'dress', 'cotton'],
  },
  {
    id: 'prod-2',
    title: 'Dino Explorer Graphic Tee & Shorts Set',
    slug: 'dino-explorer-graphic-tee-shorts-set',
    description: 'Fun dinosaur print short-sleeve shirt paired with elasticated denim shorts for active boys.',
    category: 'Boys Collection',
    regularPrice: 29.99,
    salePrice: 24.99,
    sku: 'SET-BOY-002',
    stockQuantity: 18,
    lowStockThreshold: 15,
    stockStatus: 'In Stock',
    sizes: ['3T', '4T', '5T', '6T'],
    images: [
      'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=600&auto=format&fit=crop&q=80',
    ],
    primaryImageIndex: 0,
    status: 'Active',
    createdAt: '2026-02-05',
    color: 'Navy & Blue',
    fabric: '95% Cotton 5% Elastane',
    gender: 'Boys',
    ageGroup: '3-7 Years',
    careInstructions: 'Machine wash warm, dry in shade.',
    tags: ['dinosaur', 'boys set', 'shorts'],
  },
  {
    id: 'prod-3',
    title: 'Soft Velvet Festive Kurta Set',
    slug: 'soft-velvet-festive-kurta-set',
    description: 'Traditional festive ethnic kurta paired with pyjama. Lined with ultra-soft cotton to prevent itching.',
    category: 'Party & Festive Wear',
    regularPrice: 49.99,
    salePrice: 39.99,
    sku: 'ETH-UNI-003',
    stockQuantity: 4,
    lowStockThreshold: 5,
    stockStatus: 'Low Stock',
    sizes: ['2T', '3T', '4T', '7-8Y'],
    images: [
      'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=600&auto=format&fit=crop&q=80',
    ],
    primaryImageIndex: 0,
    status: 'Active',
    createdAt: '2026-02-12',
    color: 'Maroon Gold',
    fabric: 'Silk Blend & Cotton Lined',
    gender: 'Unisex',
    ageGroup: '2-8 Years',
    careInstructions: 'Dry clean only.',
    tags: ['festive', 'traditional', 'kurta', 'party'],
  },
  {
    id: 'prod-4',
    title: 'Cozy Fleece Bear Ear Hooded Jacket',
    slug: 'cozy-fleece-bear-ear-hooded-jacket',
    description: 'Warm plush fleece hooded jacket featuring adorable bear ears on top. Front zip enclosure.',
    category: 'Winter & Outerwear',
    regularPrice: 39.99,
    sku: 'WNT-BAB-004',
    stockQuantity: 0,
    lowStockThreshold: 8,
    stockStatus: 'Out of Stock',
    sizes: ['6-12M', '12-18M', '2T', '3T'],
    images: [
      'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
    ],
    primaryImageIndex: 0,
    status: 'Inactive',
    createdAt: '2026-02-18',
    color: 'Teddy Brown',
    fabric: 'Plush Sherpa Fleece',
    gender: 'Unisex',
    ageGroup: '6M - 3 Years',
    careInstructions: 'Gentle cycle cold, lay flat to dry.',
    tags: ['winter', 'jacket', 'fleece', 'bear ears'],
  },
]

const STORAGE_KEY = 'baha_admin_products'

export const getStoredProducts = (): Product[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (data) {
      return JSON.parse(data)
    }
  } catch (err) {
    console.error('Error reading stored products:', err)
  }
  return INITIAL_PRODUCTS
}

export const saveStoredProducts = (products: Product[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products))
  } catch (err) {
    console.error('Error saving stored products:', err)
  }
}
