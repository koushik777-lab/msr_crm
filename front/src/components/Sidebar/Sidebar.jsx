import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import theme from "../../utils/theme";
import msrLogo from "../../assets/msrSvgLogo.svg";

// Icons
import {
  MdDashboard,
  MdPayment,
  MdMarkEmailRead,
  MdHistory
} from "react-icons/md";
import { BsPeopleFill, BsWhatsapp } from "react-icons/bs";
import { FaFileInvoice, FaUserTie, FaMoneyCheckAlt } from "react-icons/fa";
import { HiDocumentText } from "react-icons/hi";
import { TbLayoutSidebarLeftCollapse, TbLayoutSidebarLeftExpand, TbFileInvoice } from "react-icons/tb";

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const { user, isBackend, isSalesManager, isAgent } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const menuItems = [];

  // Construct menu items based on role, identical to previous Header logic
  menuItems.push({
    path: "/dashboard",
    name: "Dashboard",
    icon: <MdDashboard className="text-xl" />,
    show: true,
  });

  menuItems.push({
    path: "/leads",
    name: "Leads",
    icon: <BsPeopleFill className="text-xl" />,
    show: !isBackend,
  });

  menuItems.push({
    path: "/quotation",
    name: "Quotation",
    icon: <FaFileInvoice className="text-xl" />,
    show: true,
  });

  menuItems.push({
    path: "/clientSheet",
    name: "Client Sheet",
    icon: <HiDocumentText className="text-xl" />,
    show: true,
  });

  menuItems.push({
    path: "/payment",
    name: "Payment",
    icon: <MdPayment className="text-xl" />,
    show: true,
  });

  menuItems.push({
    path: "/paymentHistory",
    name: "Payment Received",
    icon: <FaMoneyCheckAlt className="text-xl" />, // Changed icon as requested
    show: true,
  });

  menuItems.push({
    path: "/agents",
    name: "Agents",
    icon: <FaUserTie className="text-xl" />,
    show: !isBackend && !isAgent,
  });

  menuItems.push({
    path: "/marketing",
    name: "Marketing",
    icon: <MdMarkEmailRead className="text-xl" />,
    show: !isBackend,
  });

  menuItems.push({
    path: "/renewal",
    name: "Renewal & Surv",
    icon: <MdHistory className="text-xl" />,
    show: true,
  });

  menuItems.push({
    path: "/master-sheet",
    name: "MASTER SHEET",
    icon: <HiDocumentText className="text-xl" />,
    show: true,
  });

  menuItems.push({
    path: "/whatsapp",
    name: "Whatsapp",
    icon: <BsWhatsapp className="text-xl" />,
    show: !isBackend,
  });

  return (
    <aside
      className={`bg-white shadow-xl transition-all duration-300 ease-in-out flex flex-col h-full z-40 relative ${isCollapsed ? "w-20" : "w-64"
        }`}
    >
      {/* Sidebar Header with Logo and Shrink Toggle */}
      <div className={`flex items-center justify-between h-16 border-b px-4 ${isCollapsed ? "justify-center" : ""}`}>
        {!isCollapsed && (
          <div className="w-16 ml-2 overflow-hidden flex-shrink-0 transition-opacity duration-300">
            <img src={msrLogo} alt="MSR Logo" className="w-full h-auto" />
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors focus:outline-none"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? (
            <TbLayoutSidebarLeftExpand className="text-2xl text-sky-600" />
          ) : (
            <TbLayoutSidebarLeftCollapse className="text-2xl text-sky-600" />
          )}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-2 no-scrollbar">
        {menuItems.map((item, index) => {
          if (!item.show) return null;

          const active = isActive(item.path);

          return (
            <Link
              key={index}
              to={item.path}
              className={`flex items-center rounded-xl transition-all duration-200 group ${active
                ? "bg-sky-50 text-sky-600 shadow-sm"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                } ${isCollapsed ? "justify-center p-3" : "px-4 py-3 gap-4"}`}
              title={isCollapsed ? item.name : ""}
            >
              <div className={`flex-shrink-0 transition-transform duration-200 ${active ? "scale-110" : "group-hover:scale-110"}`} style={active ? { color: theme.primaryColor } : {}}>
                {item.icon}
              </div>

              {!isCollapsed && (
                <span className={`font-medium whitespace-nowrap text-sm ${active ? "opacity-100 font-semibold" : "opacity-90"}`}
                  style={active ? { color: theme.primaryColor } : {}}>
                  {item.name}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom gap or profile if needed could go here, but we keep it clean */}
      <div className="p-4 border-t">
        {!isCollapsed ? (
          <div className="text-xs text-gray-400 text-center">© 2026 MSR CRM</div>
        ) : (
          <div className="text-xs text-gray-400 text-center">©</div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
