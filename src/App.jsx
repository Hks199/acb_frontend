import { useState, useEffect } from 'react';
import { Routes, Route } from "react-router";
import Homepage from './pages/Homepage';
import ProductDetails from './pages/products/ProductDetails';
import UserProfile from './pages/profile/UserProfile';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AllProducts from './pages/products/AllProducts';
import Cart from './pages/cart/Cart';
import CustomerOrder from './pages/orders/CustomerOrder';

import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import VerifyScreen from './pages/auth/VerifyScreen';
import ForgotPassword from './pages/auth/ForgotPassword';
import UpdatePassword from './pages/auth/UpdatePassword';
import VendorList from './pages/gallery/VendorList';
import { getUserByAuthToken } from './api/user';
import useUserHook from './context/UserContext';
import ProtectedRoutes from './pages/ProtectedRoutes';
import PublicRoute from './pages/PublicRoute';

import { ToastContainer } from 'react-toastify';
import ReturnRefund from './pages/policy/ReturnRefund';
import Loading from './components/Loading';


function App() {
  const { user, setUser, isAuth, setIsAuth, loadingUser, setLoadingUser } = useUserHook();

  const getUserByToken = async () => {
    try {
      const resp = await getUserByAuthToken();
      if (resp?.data?.status === "success") {
        setIsAuth(true);
        setUser({ ...resp.data.userData, userId: resp.data.userData._id });
      } else {
        setIsAuth(false);
        setUser(null);
      }
    } catch (err) {
      setIsAuth(false);
      setUser(null);
    } finally {
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    getUserByToken();
  }, []);

  if (loadingUser) return <Loading />

  return (
    <>
      <Navbar user={user} isAuth={isAuth} />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/products" element={<AllProducts />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/return-and-refund" element={<ReturnRefund />} />

        {/* Protected Route */}
        <Route path="/cart" element={
          <ProtectedRoutes isAuth={isAuth}>
            <Cart />
          </ProtectedRoutes>
        } />
        <Route path="/orders" element={
          <ProtectedRoutes isAuth={isAuth}>
            <CustomerOrder />
          </ProtectedRoutes>
        } />
        <Route path="/profile" element={
          <ProtectedRoutes isAuth={isAuth}>
            <UserProfile />
          </ProtectedRoutes>
        } />
        <Route path="/art-gallery" element={<VendorList />} />

        {/* Cannot go to /login route when user is logged in */}
        <Route path="/login" element={
          <PublicRoute isAuth={isAuth}>
            <Login />
          </PublicRoute>
        } />
        <Route path="/signup" element={
          <PublicRoute isAuth={isAuth}>
            <Signup />
          </PublicRoute>
        } />

        <Route path="/verify-otp" element={
          <PublicRoute isAuth={isAuth}>
            <VerifyScreen />
          </PublicRoute>
          } />
        <Route path="/forgot-password" element={
          <PublicRoute isAuth={isAuth}>
            <ForgotPassword />
          </PublicRoute>
          } />
        <Route path="/update-password" element={
          <PublicRoute isAuth={isAuth}>
            <UpdatePassword />
          </PublicRoute>
          } />

        <Route path="*" element={<Homepage />} />
      </Routes>
      <Footer />

      <ToastContainer progressClassName="custom-progress-bar" />
    </>
  );
}

export default App;


/*
- doc: https://reactrouter.com/start/declarative/routing

<Routes>
  <Route index element={<Home />} />
  <Route path="about" element={<About />} />

  <Route element={<AuthLayout />}>
    <Route path="login" element={<Login />} />
    <Route path="register" element={<Register />} />
  </Route>

  <Route path="concerts">
    <Route index element={<ConcertsHome />} />
    <Route path=":city" element={<City />} />
    <Route path="trending" element={<Trending />} />
  </Route>
</Routes>

** Nested Routing**
"/dashboard" and "/dashboard/settings"

<Routes>
  <Route path="dashboard" element={<Dashboard />}>
    <Route index element={<Home />} />
    <Route path="settings" element={<Settings />} />
  </Route>
</Routes>

- Child routes are rendered through the <Outlet/> in the parent route
import { Outlet } from "react-router";

export default function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      {/* will either be <Home/> or <Settings/> 
      <Outlet />
    </div>
  );
}

*/