import React, { useState, useEffect, useRef } from "react";
import { IoNotificationsOutline, IoClose } from "react-icons/io5";
import { FiBell, FiSettings, FiTrash2 } from "react-icons/fi";
import { Badge } from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { API_URI } from "../../utils/constants";
import { getHeaders } from "../../utils/helpers";

export default function Notifications() {
  const [isOpen, setIsOpen] = useState(false);
  const [notificationsData, setNotificationData] = useState([]);
  const { isSalesManager, isBackend, isAgent, user } = useAuth();

  // No longer using static notifications

  const getNotifications = async () => {
    try {
      const { data } = await axios.post(
        `${API_URI}/quotationNotification`,
        {
          name: isAgent
            ? user?.name
            : isSalesManager
              ? "Sales Manager"
              : isBackend
                ? "backend"
                : "admin",
        },
        getHeaders(),
      );

      // console.log(data);
      setNotificationData(data.quotations);
    } catch (error) {
      console.log(error?.response?.data?.message || error.message);
    }
  };

  const sidebarRef = useRef(null);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // Not using mark as read or delete functions since we're using API data

  // Calculate the number of notifications for the badge
  const unreadCount = notificationsData ? notificationsData.length : 0;

  // Close sidebar when clicking outside of it
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        isOpen
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    // Fetch notifications when component mounts or sidebar is opened
    // if (isOpen) {
    getNotifications();
    // }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isAgent, isSalesManager, isBackend, user]);

  return (
    <div className="relative">
      <Badge badgeContent={unreadCount} color="error">
        <div
          className="text-2xl cursor-pointer hover:bg-gray-200 p-2 rounded-full"
          onClick={toggleSidebar}
        >
          <IoNotificationsOutline color="#1976D2" />
        </div>
      </Badge>

      {/* Notification Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 right-0 h-full bg-white shadow-lg z-50 transition-all duration-300 overflow-hidden ${
          isOpen ? "w-80" : "w-0"
        }`}
        style={{
          boxShadow: isOpen ? "-5px 0 15px rgba(0, 0, 0, 0.1)" : "none",
          transition: "width 0.3s ease-in-out",
        }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center">
              <FiBell className="text-blue-600 mr-2" />
              <h2 className="font-semibold">Notifications</h2>
            </div>
            <div className="flex items-center">
              <button
                onClick={toggleSidebar}
                className="p-1 hover:bg-gray-200 rounded-full"
              >
                <IoClose className="text-xl" />
              </button>
            </div>
          </div>

          {/* No Actions section as requested */}

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {notificationsData && notificationsData.length > 0 ? (
              notificationsData.map((notification, index) => (
                <div
                  key={index}
                  className="p-3 border-b hover:bg-gray-50 cursor-pointer bg-blue-50 my-2"
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-gray-800">
                      {notification?.isManuallyCreated
                        ? "Client Sheet"
                        : "Quotation"}{" "}
                      Reminder
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    A quotation has been generated for{" "}
                    {notification?.isManuallyCreated
                      ? notification.companyName
                      : notification.company}
                  </p>
                  <p className="text-xs font-semibold text-gray-700 mt-2">
                    Order Number: {notification.orderNumber}
                  </p>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                <FiBell className="mb-2 text-2xl" />
                <p>No notifications</p>
              </div>
            )}
          </div>

          {/* Footer */}
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 bg-opacity-30 z-40"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </div>
  );
}
