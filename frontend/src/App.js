import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { SocketProvider } from './contexts/SocketContext';
import { OrdersProvider } from './contexts/OrdersContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import GenderPage from './pages/GenderPage';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Contact from './pages/Contact';
import Stores from './pages/Stores';
import Admin from './pages/Admin';
import AdminLogin from './pages/AdminLogin';
import AdminSetup from './pages/AdminSetup';
import Orders from './pages/Orders';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import TestHoodie from './components/TestHoodie';
import SimpleHoodieTest from './components/SimpleHoodieTest';
import MaintenanceMode from './components/MaintenanceMode';
import OAuthSuccess from './pages/OAuthSuccess';

// Composant interne qui utilise les hooks
const AppContent = () => {
  // Activer les raccourcis clavier
  useKeyboardShortcuts();
  
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="App min-h-screen flex flex-col">
      <MaintenanceMode />
      {!isAdminRoute && <Header />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/genre/:genre" element={<GenderPage />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/oauth-success" element={<OAuthSuccess />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/stores" element={<Stores />} />
          <Route path="/test-hoodie" element={<TestHoodie />} />
          <Route path="/simple-test" element={<SimpleHoodieTest />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/setup" element={<AdminSetup />} />
          
          {/* Routes protégées */}
          <Route path="/cart" element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/orders" element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          } />
          
          {/* Routes admin */}
          <Route path="/admin" element={
            <AdminRoute>
              <Admin />
            </AdminRoute>
          } />
        </Routes>
      </main>
      {!isAdminRoute && <Footer />}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <CartProvider>
          <SocketProvider>
            <OrdersProvider>
              <AppContent />
            </OrdersProvider>
          </SocketProvider>
        </CartProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}

export default App;
