export interface ProductColor {
  id: string
  name: string
  hexCode: string
  status: 'Active' | 'Inactive'
  createdAt: string
}

export const INITIAL_COLORS: ProductColor[] = [
  { id: 'col-1', name: 'Cherry Red', hexCode: '#FF0000', status: 'Active', createdAt: '2026-01-10' },
  { id: 'col-2', name: 'Sky Blue', hexCode: '#38BDF8', status: 'Active', createdAt: '2026-01-12' },
  { id: 'col-3', name: 'Midnight Black', hexCode: '#000000', status: 'Active', createdAt: '2026-01-15' },
  { id: 'col-4', name: 'Coral Pink', hexCode: '#FF7F7F', status: 'Active', createdAt: '2026-01-20' },
  { id: 'col-5', name: 'Mint Green', hexCode: '#34D399', status: 'Active', createdAt: '2026-01-25' },
  { id: 'col-6', name: 'Sunshine Yellow', hexCode: '#FACC15', status: 'Active', createdAt: '2026-02-01' },
  { id: 'col-7', name: 'Lavender Purple', hexCode: '#C084FC', status: 'Active', createdAt: '2026-02-05' },
  { id: 'col-8', name: 'Pure White', hexCode: '#FFFFFF', status: 'Active', createdAt: '2026-02-10' },
  { id: 'col-9', name: 'Teddy Brown', hexCode: '#854D0E', status: 'Inactive', createdAt: '2026-02-14' },
]

const COLORS_STORAGE_KEY = 'baha_admin_colors'

export const getStoredColors = (): ProductColor[] => {
  try {
    const data = localStorage.getItem(COLORS_STORAGE_KEY)
    if (data) {
      return JSON.parse(data)
    }
  } catch (err) {
    console.error('Error reading stored colors:', err)
  }
  return INITIAL_COLORS
}

export const saveStoredColors = (colors: ProductColor[]) => {
  try {
    localStorage.setItem(COLORS_STORAGE_KEY, JSON.stringify(colors))
  } catch (err) {
    console.error('Error saving stored colors:', err)
  }
}
