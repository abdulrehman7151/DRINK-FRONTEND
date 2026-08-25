import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AdminLayout from './components/AdminLayout'
import AdminRoute from './components/AdminRoute'
import Admin from './pages/Admin'
import AdminProductForm from './pages/AdminProductForm'
import AdminProducts from './pages/AdminProducts'
import AdminOrdersLayout from './pages/AdminOrdersLayout'
import AdminOrderStage from './pages/AdminOrderStage'
import AdminAllOrders from './pages/AdminAllOrders'
import Cart from './pages/Cart'
import Home from './pages/Home'
import Login from './pages/Login'
import Contact from './pages/Contact'
import ProductDetails from './pages/ProductDetails'
import Products from './pages/Products'
import Signup from './pages/Signup'
import MyOrders from './pages/MyOrders'
import { ToastProvider } from './components/Toast'

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:productId" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index element={<Admin />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="products/new" element={<AdminProductForm />} />
            <Route path="products/:productId/edit" element={<AdminProductForm />} />
            <Route path="orders" element={<AdminOrdersLayout />}>
              <Route index element={<Navigate to="all" replace />} />
              <Route path="all" element={<AdminAllOrders />} />
              <Route path=":stage" element={<AdminOrderStage />} />
            </Route>
            <Route path="categories" element={<Navigate to="/admin" replace />} />
            <Route path="customers" element={<Navigate to="/admin" replace />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  )
}

export default App
