import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Notifications from "./Notifications";
import { FiLogOut } from "react-icons/fi";

const Header = ({ handleLogout }) => {
  const { user, isBackend, isSalesManager } = useAuth();
  const [imageError, setImageError] = useState(false);
  const location = useLocation();
  const name = user?.name || "User";
  const firstLetter = name.charAt(0);

  // Capitalize role text
  let roleText = user?.type;
  if (isBackend) roleText = "Backend";
  else if (isSalesManager) roleText = "Sales Manager";

  return (
    <header className="flex justify-between items-center px-6 py-3 bg-white shadow-sm border-b border-gray-100 z-10 w-full">
      {/* Left side empty or breadcrumbs */}
      <div className="flex items-center">
        <h1 className="text-xl font-bold text-gray-800 capitalize">
          {location.pathname === "/" ? "Dashboard" : location.pathname.substring(1).replace(/([A-Z])/g, ' $1').trim()}
        </h1>
      </div>

      {/* Right side items */}
      <div className="flex items-center gap-6">
        <Notifications />

        {/* Divider */}
        <div className="h-8 w-px bg-gray-200"></div>

        {/* User Profile */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col text-right">
            <span className="text-gray-900 font-semibold text-sm">{name}</span>
            <span className="text-gray-500 text-xs font-medium capitalize">
              {roleText}
            </span>
          </div>

          <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center border-2 border-white shadow-sm overflow-hidden">
            {!imageError ? (
              <img
                src="/userImg.png"
                alt={firstLetter}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <span className="text-lg font-bold text-sky-600">
                {firstLetter}
              </span>
            )}
          </div>
        </div>

        {/* Modern Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
          title="Logout"
        >
          <FiLogOut className="text-lg" />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
