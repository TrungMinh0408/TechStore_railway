
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import NotFound from "./utils/NotFound";

import Login from "./pages/Login/Login";
import ForgotPassword from "./pages/Login/ForgotPassword";
import ResetPassword from "./pages/Login/ResetPassword";

import Sidebar from "./components/sidebar/Sidebar";
import Settings from "./components/Settings/Settings";

import Pos from "./pages/Pos/Pos";
import Payment from "./pages/Pos/Payment";
import ConfirmPayment from "./pages/Pos/ConfirmPayment";

import Inventory from "./pages/Inventories";
import Details from "./pages/Inventories/Details";

import Purchase from "./pages/purchases/Purchases";
import CreatePurchase from "./pages/purchases/CreatePurchase";
import EditPurchase from "./pages/purchases/EditPurchase";
import PurchaseDetail from "./pages/purchases/PurchaseDetail";

import ActivityIndex from "./pages/Activity/ActivityIndex";
import ActivityDetail from "./pages/Activity/ActivityDetail";
import QRPayment from "./pages/Pos/QRPayment";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/* ================= Layout ================= */
const Layout = ({ children }) => (
  <div className="flex min-h-screen bg-app-bg">
    <Sidebar />
    <div className="flex-1 min-w-0 overflow-x-hidden p-6">
      {children}
    </div>
  </div>
);

/* ================= Private Route ================= */
const PrivateRoute = ({ children }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
};

export default function App() {
  const { token, loading } = useAuth();

  if (loading) return <div>Loading auth...</div>;

  return (
    <>
      <Routes>

        {/* ROOT */}
        <Route
          path="/"
          element={
            token ? <Navigate to="/pos" replace /> : <Navigate to="/login" replace />
          }
        />

        {/* LOGIN */}
        <Route
          path="/login"
          element={!token ? <Login /> : <Navigate to="/pos" replace />}
        />

        <Route
          path="/forgot-password"
          element={!token ? <ForgotPassword /> : <Navigate to="/pos" replace />}
        />

        <Route
          path="/reset-password/:token"
          element={!token ? <ResetPassword /> : <Navigate to="/pos" replace />}
        />

        {/* ================= DASHBOARD ================= */}

        <Route
          path="/pos"
          element={
            <PrivateRoute>
              <Layout>
                <Pos />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/payment"
          element={
            <PrivateRoute>
              <Layout>
                <Payment />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route path="/pos/qr-payment" element={<QRPayment />} />
        <Route
          path="/confirmpayment"
          element={
            <PrivateRoute>
              <Layout>
                <ConfirmPayment />
              </Layout>
            </PrivateRoute>
          }
        />

        {/* INVENTORY */}
        <Route
          path="/inventories"
          element={
            <PrivateRoute>
              <Layout>
                <Inventory />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/inventories/:productId/details"
          element={
            <PrivateRoute>
              <Layout>
                <Details />
              </Layout>
            </PrivateRoute>
          }
        />

        {/* PURCHASE */}
        <Route
          path="/purchases"
          element={
            <PrivateRoute>
              <Layout>
                <Purchase />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/purchases/create"
          element={
            <PrivateRoute>
              <Layout>
                <CreatePurchase />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/purchases/edit/:id"
          element={
            <PrivateRoute>
              <Layout>
                <EditPurchase />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/purchases/:id"
          element={
            <PrivateRoute>
              <Layout>
                <PurchaseDetail />
              </Layout>
            </PrivateRoute>
          }
        />

        {/* ACTIVITY */}
        <Route
          path="/activity"
          element={
            <PrivateRoute>
              <Layout>
                <ActivityIndex />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/activity/:id"
          element={
            <PrivateRoute>
              <Layout>
                <ActivityDetail />
              </Layout>
            </PrivateRoute>
          }
        />

        {/* SETTINGS */}
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <Layout>
                <Settings />
              </Layout>
            </PrivateRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />

      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="light"
      />
    </>
  );
}
