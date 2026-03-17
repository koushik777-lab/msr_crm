import React, { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header/Header";
import Sidebar from "../components/Sidebar/Sidebar";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { API_URI } from "../utils/constants";
import { getHeaders } from "../utils/helpers";

const MainLayout = () => {
  const { user, isAgent, isSalesManager, isBackend } = useAuth();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { pathname } = useLocation();

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

  const postLoginTime = async (body) => {
    try {
      await axios.post(`${API_URI}/online-time`, body, getHeaders());
    } catch (error) {
      console.log("Error posting login time:", error);
    }
  };

  useEffect(() => {
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
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />

      <div className="flex-1 flex flex-col w-full overflow-hidden">
        <Header handleLogout={handleLogout} />

        <main
          className={`flex-1 overflow-x-hidden overflow-y-auto ${pathname != "/leads" ? "container max-w-[1836px]" : "w-full"
            } mx-auto px-4 py-8`}
        >
          <div className="w-full h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
