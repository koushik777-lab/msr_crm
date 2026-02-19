import axios from "axios";
import React, { useEffect } from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Home from "../pages/Home";
import Login from "../pages/authentication/Login";
import Dashboard from "../pages/dashboard/Dashboard";
import Leads from "../pages/leads/Leads";
import Agents from "../pages/agents/Agents";
import Payment from "../pages/payment/Payment";
import MainLayout from "../layouts/MainLayout";
import NotFound from "../pages/NotFound";
import Marketing from "../pages/marketing/Marketing";
import Quotation from "../pages/quotation/Quotation";
import { Toaster } from "react-hot-toast";
import Renewal from "../pages/renewal/Renewal";
import Whatsapp from "../pages/whatsapp/Whatsapp";
import Sheet from "../pages/client_sheet/Sheet";
import { API_URI } from "../utils/constants";
import { getHeaders } from "../utils/helpers";
import PaymentHistory from "../pages/PaymentHistory/PaymentHistory";

const PrivateRoutes = () => {
  const { user } = useAuth();
  return user ? <Outlet /> : <Navigate to="/login" />;
};

const AdminRoutes = () => {
  const { user } = useAuth();
  return user?.type === "admin" ? <Outlet /> : <Navigate to="/404" />;
};

export const fetchUser = async () => {
  try {
    const response = await axios.get(`${API_URI}/agent`, getHeaders());
    if (response?.data?.data) {
      localStorage.setItem("admin", JSON.stringify(response.data.data));
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user data:", error);
  }
};

const AppRoutes = () => {
  const { user, isBackend, isSalesManager } = useAuth();

  useEffect(() => {
    if (localStorage.getItem("token")) {
      fetchUser();
    }
  }, []);

  return (
    <>
      {/* <Toaster /> */}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<PrivateRoutes />}>
          <Route element={<MainLayout />}>
            <Route
              path="/"
              element={
                <Navigate
                  to={user?.type === "admin" ? "/dashboard" : "/leads"}
                />
              }
            />
            {!isBackend && <Route path="/leads" element={<Leads />} />}
            <Route path="/payment" element={<Payment />} />
            <Route path="/paymentHistory" element={<PaymentHistory />} />
            {!isBackend && (
              <>
                <Route path="/whatsapp" element={<Whatsapp />} />
              </>
            )}
            <Route path="/quotation" element={<Quotation />} />

            <Route path="/clientSheet" element={<Quotation />} />
            <Route
              path="/marketing"
              element={isBackend ? <Navigate to="/leads" /> : <Marketing />}
            />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/renewal" element={<Renewal />} />
            <Route element={<AdminRoutes />}>
              <Route
                path="/agents"
                element={isBackend ? <Navigate to="/leads" /> : <Agents />}
              />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
};

export default AppRoutes;
