import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import Profile from "@/pages/Profile";
import Settings from "@/pages/Settings";
import Faq from "@/pages/Faq";
import Blogs from "@/pages/Blogs";
import ClothingSizes from "@/pages/ClothingSizes";
import Categories from "@/pages/Categories";
import Products from "@/pages/Products";
import ProductDetail from "@/pages/ProductDetail";
import Orders from "@/pages/Orders";
import OrderDetail from "@/pages/OrderDetail";
import AbandonedCarts from "@/pages/AbandonedCarts";
import Colors from "@/pages/Colors";
import Testimonials from "@/pages/Testimonials";
import Customers from "@/pages/Customers";
import Banners from "@/pages/Banners";
import Coupons from "@/pages/Coupons";
import Notifications from "@/pages/Notifications";
import { ThemeProvider } from "@/components/theme-provider";
import CustomerDetails from "./pages/CustomerDetails";
import SubCategories from "./pages/SubCategories";
import SizeCharts from "./pages/SizeCharts";
import AddProduct from "./pages/AddProduct";
import EditProduct from "./pages/EditProduct";
import AddBanners from "./pages/AddBanners";
import EditBanner from "./pages/EditBanner";

export default function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="baha-ui-theme">
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/banners" element={<Banners />} />
            <Route path="/banner/add" element={<AddBanners />} />
            <Route path="/banner/edit/:id" element={<EditBanner />} />
            <Route path="/coupons" element={<Coupons />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/:id" element={<OrderDetail />} />
            <Route path="/abandoned-carts" element={<AbandonedCarts />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/customers/:id" element={<CustomerDetails />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/products/add" element={<AddProduct />} />
            <Route path="/products/edit/:id" element={<EditProduct />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/sub-categories" element={<SubCategories />} />
            <Route path="/blogs" element={<Blogs />} />
            <Route path="/sizes" element={<ClothingSizes />} />
            <Route path="/size-charts" element={<SizeCharts />} />
            <Route path="/colors" element={<Colors />} />
            <Route path="/testimonials" element={<Testimonials />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/faq" element={<Faq />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
