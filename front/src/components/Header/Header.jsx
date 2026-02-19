import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import msrLogo from "../../assets/msrSvgLogo.svg";
import theme from "../../utils/theme";
import { useAuth } from "../../context/AuthContext";
import { MdDashboard, MdPayment, MdMarkEmailRead } from "react-icons/md";
import { BsPeopleFill, BsWhatsapp } from "react-icons/bs";
import { TbFileDescription } from "react-icons/tb";
import { FaFileInvoice, FaUserTie, FaHistory } from "react-icons/fa";
import { HiDocumentText } from "react-icons/hi";
import { IoNotificationsOutline } from "react-icons/io5";
import Notifications from "./Notifications";

const Header = () => {
  const { logout, user } = useAuth();
  const [imageError, setImageError] = useState(false);
  const location = useLocation();
  const name = user?.name || "User";
  const firstLetter = name.charAt(0);
  const isActive = (path) => location.pathname === path;
  const { isBackend, isSalesManager, isAgent } = useAuth();

  return (
    <header className="flex justify-between items-center px-8 py-1 bg-white shadow-md fixed top-0 left-0 right-0 z-50">
      <div className="w-12">
        <img src={msrLogo} alt="MSR Logo" className="w-full h-auto" />
      </div>

      <nav className="flex gap-3">
        {/* {!isBackend && ( */}
        <Link
          to="/dashboard"
          className={`font-medium px-2 py-1.5 rounded-md hover:bg-gray-100 transition-colors text-sm flex items-center gap-1.5 ${
            isActive("/dashboard") ? "underline" : "text-gray-700"
          }`}
          style={isActive("/dashboard") ? { color: theme.primaryColor } : {}}
        >
          <MdDashboard className="text-lg" />
          Dashboard
        </Link>
        {/* )} */}

        {!isBackend && (
          <Link
            to="/leads"
            className={`font-medium px-2 py-1.5 rounded-md hover:bg-gray-100 transition-colors text-sm flex items-center gap-1.5 ${
              isActive("/leads") ? "underline" : "text-gray-700"
            }`}
            style={isActive("/leads") ? { color: theme.primaryColor } : {}}
          >
            <BsPeopleFill className="text-lg" />
            Leads
          </Link>
        )}

        {/* {!isBackend && ( */}
        <Link
          to="/quotation"
          className={`font-medium px-2 py-1.5 rounded-md hover:bg-gray-100 transition-colors text-sm flex items-center gap-1.5 ${
            isActive("/quotation") ? "underline" : "text-gray-700"
          }`}
          style={isActive("/quotation") ? { color: theme.primaryColor } : {}}
        >
          <FaFileInvoice className="text-lg" />
          Quotation
        </Link>
        {/* )} */}

        {/* {!isBackend && ( */}
        <Link
          to="/clientSheet"
          className={`font-medium px-2 py-1.5 rounded-md hover:bg-gray-100 transition-colors text-sm flex items-center gap-1.5 ${
            isActive("/clientSheet") ? "underline" : "text-gray-700"
          }`}
          style={isActive("/clientSheet") ? { color: theme.primaryColor } : {}}
        >
          <HiDocumentText className="text-lg" />
          Client Sheet
        </Link>
        {/* )} */}

        {/* {!isBackend && ( */}
        <Link
          to="/payment"
          className={`font-medium px-2 py-1.5 rounded-md hover:bg-gray-100 transition-colors text-sm flex items-center gap-1.5 ${
            isActive("/payment") ? "underline" : "text-gray-700"
          }`}
          style={isActive("/payment") ? { color: theme.primaryColor } : {}}
        >
          <MdPayment className="text-lg" />
          Payment
        </Link>
        {/* )} */}
        {/* {!isBackend && ( */}
        <Link
          to="/paymentHistory"
          className={`font-medium px-2 py-1.5 rounded-md hover:bg-gray-100 transition-colors text-sm flex items-center gap-1.5 ${
            isActive("/paymentHistory") ? "underline" : "text-gray-700"
          }`}
          style={
            isActive("/paymentHistory") ? { color: theme.primaryColor } : {}
          }
        >
          <MdPayment className="text-lg" />
          Payment Received
        </Link>
        {/* )} */}

        {!isBackend && !isAgent && (
          <Link
            to="/agents"
            className={`font-medium px-2 py-1.5 rounded-md hover:bg-gray-100 transition-colors text-sm flex items-center gap-1.5 ${
              isActive("/agents") ? "underline" : "text-gray-700"
            }`}
            style={isActive("/agents") ? { color: theme.primaryColor } : {}}
          >
            <FaUserTie className="text-lg" />
            Agents
          </Link>
        )}

        {!isBackend && (
          <Link
            to="/marketing"
            className={`font-medium px-2 py-1.5 rounded-md hover:bg-gray-100 transition-colors text-sm flex items-center gap-1.5 ${
              isActive("/marketing") ? "underline" : "text-gray-700"
            }`}
            style={isActive("/marketing") ? { color: theme.primaryColor } : {}}
          >
            <MdMarkEmailRead className="text-lg" />
            Marketing
          </Link>
        )}

        <Link
          to="/renewal"
          className={`font-medium px-2 py-1.5 rounded-md hover:bg-gray-100 transition-colors text-sm flex items-center gap-1.5 ${
            isActive("/renewal") ? "underline" : "text-gray-700"
          }`}
          style={isActive("/renewal") ? { color: theme.primaryColor } : {}}
        >
          <FaHistory className="text-lg" />
          Renewal & Surv
        </Link>

        {!isBackend && (
          <Link
            to="/whatsapp"
            className={`font-medium px-2 py-1.5 rounded-md hover:bg-gray-100 transition-colors text-sm flex items-center gap-1.5 ${
              isActive("/whatsapp") ? "underline" : "text-gray-700"
            }`}
            style={isActive("/whatsapp") ? { color: theme.primaryColor } : {}}
          >
            <BsWhatsapp className="text-lg" />
            Whatsapp
          </Link>
        )}
      </nav>

      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
          {!imageError ? (
            <img
              src="/userImg.png"
              alt={firstLetter}
              className="w-full h-full rounded-full"
              onError={() => setImageError(true)}
            />
          ) : (
            <span className="text-xl font-semibold text-gray-600">
              {firstLetter}
            </span>
          )}
        </div>
        <div className="flex flex-col">
          <span className="text-gray-700 font-medium text-lg">{name}</span>
          <span className="text-gray-500 text-sm capitalize">
            {isBackend
              ? "Backend"
              : isSalesManager
                ? "Sales Manager"
                : user?.type}
          </span>
        </div>
        <Notifications />
      </div>
    </header>
  );
};

export default Header;
