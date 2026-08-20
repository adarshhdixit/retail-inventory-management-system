import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { ToastProvider } from "./context/ToastContext";
import ProtectedRoute from "./components/ProtectedRoute";
import CustomerProtectedRoute from './components/CustomerProtectedRoute';
import WhatsAppButton from './components/WhatsAppButton';
import BottomNav from './components/BottomNav';
import Footer from './components/Footer';
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Categories from "./pages/Categories";
import Products from "./pages/Products";
import Suppliers from "./pages/Suppliers";
import Sales from "./pages/Sales";
import Purchases from "./pages/Purchases";
import StoreHome from "./pages/StoreHome";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from './pages/OrderSuccess';
import CustomerAuth from "./pages/CustomerAuth";
import ProductDetail from "./pages/ProductDetail";
import MyOrders from './pages/MyOrders';
import Orders from './pages/Orders';
import Staff from './pages/Staff';
import Addresses from './pages/Addresses';
import Banners from './pages/Banners';
import CategoriesPage from './pages/CategoriesPage';
import HotSellingPage from './pages/HotSellingPage';
import NewlyAddedPage from './pages/NewlyAddedPage';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <ToastProvider>
          <BrowserRouter>
            <WhatsAppButton />
            <BottomNav />
            <Routes>
              {/* Public storefront — default landing */}
              <Route path="/" element={<StoreHome />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/hot-selling" element={<HotSellingPage />} />
              <Route path="/newly-added" element={<NewlyAddedPage />} />
              <Route
                path="/checkout"
                element={
                  <CustomerProtectedRoute>
                    <Checkout />
                  </CustomerProtectedRoute>
                }
              />
              <Route
                path="/order-success"
                element={
                  <CustomerProtectedRoute>
                    <OrderSuccess />
                  </CustomerProtectedRoute>
                }
              />
              <Route path="/account" element={<CustomerAuth />} />

              {/* Admin — clearly separated under /admin */}
              <Route path="/admin/login" element={<Login />} />
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/categories"
                element={
                  <ProtectedRoute>
                    <Categories />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/products"
                element={
                  <ProtectedRoute>
                    <Products />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/suppliers"
                element={
                  <ProtectedRoute>
                    <Suppliers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/purchases"
                element={
                  <ProtectedRoute>
                    <Purchases />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/sales"
                element={
                  <ProtectedRoute>
                    <Sales />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/orders"
                element={
                  <ProtectedRoute>
                    <Orders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/staff"
                element={
                  <ProtectedRoute>
                    <Staff />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-orders"
                element={
                  <CustomerProtectedRoute>
                    <MyOrders />
                  </CustomerProtectedRoute>
                }
              />
              <Route
                path="/addresses"
                element={
                  <CustomerProtectedRoute>
                    <Addresses />
                  </CustomerProtectedRoute>
                }
              />
              <Route
                path="/admin/banners"
                element={
                  <ProtectedRoute>
                    <Banners />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <Footer />
          </BrowserRouter>
        </ToastProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;