import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import Dashboard from '@/pages/Dashboard'
import Login from '@/pages/Login'
import Profile from '@/pages/Profile'
import Settings from '@/pages/Settings'
import Faq from '@/pages/Faq'
import Blogs from '@/pages/Blogs'
import ClothingSizes from '@/pages/ClothingSizes'
import Categories from '@/pages/Categories'
import Products from '@/pages/Products'
import AddEditProduct from '@/pages/AddEditProduct'
import Orders from '@/pages/Orders'
import Colors from '@/pages/Colors'
import Testimonials from '@/pages/Testimonials'
import { ThemeProvider } from '@/components/theme-provider'

export default function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="baha-ui-theme">
      <BrowserRouter>
        <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/add" element={<AddEditProduct />} />
          <Route path="/products/edit/:id" element={<AddEditProduct />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/sizes" element={<ClothingSizes />} />
          <Route path="/colors" element={<Colors />} />
          <Route path="/testimonials" element={<Testimonials />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </ThemeProvider>
  )
}
