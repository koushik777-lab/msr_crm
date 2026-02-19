import React, { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header/Header";
import { useAuth } from "../context/AuthContext";
import BackHeader from "../components/BackHeader";
import axios from "axios";
import { API_URI } from "../utils/constants";
import { getHeaders } from "../utils/helpers";

const MainLayout = () => {
  const { user, isAgent, isSalesManager, isBackend } = useAuth();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const handleLogout = () => {
    postLoginTime({
      userId: user?._id,
      type: "logout",
      logoutTime: new Date().toISOString(),
      isAgent: isAgent,
      status: "manual",
    });
    logout();
    navigate("/login");
  };
  const { pathname } = useLocation();
  console.log(pathname);

  const postLoginTime = async (body) => {
    try {
      await axios.post(`${API_URI}/online-time`, body, getHeaders());
    } catch (error) {
      console.log("Error posting login time:", error);
    }
  };
  useEffect(() => {
    console.log("MainLayout useEffect", user, isAgent);
    let isAgentLogin = !(
      user?.email == "admin@msr.com" ||
      user?.email == "sales@msr.com" ||
      user?.email == "backend@msr.com"
    );
    postLoginTime({
      userId: user?._id,
      type: "login",
      loginTime: new Date().toISOString(),
      isAgent: isAgentLogin,
    });
  }, []);

  return (
    <div className=" bg-white min-h-screen">
      <Header />
      <main
        className={`${pathname != "/leads" ? "container" : "max-w-[1836px]"} mx-auto px-4 py-2  `}
      >
        <div className="mt-16 overflow-x-hidden">
          <Outlet />
        </div>
        <button
          onClick={handleLogout}
          className="fixed bottom-5 left-5 text-red-500 hover:text-red-700 font-medium"
        >
          Logout
        </button>
      </main>
    </div>
  );
};

export default MainLayout;
