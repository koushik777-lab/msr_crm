import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import { API_URI } from "../utils/constants";
import { getHeaders } from "../utils/helpers";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    return localStorage.getItem("admin")
      ? JSON.parse(localStorage.getItem("admin"))
      : null;
  });
  const [isBackend, setIsBackend] = useState(false);
  const [isSalesManager, setIsSalesManager] = useState(false);
  const [isAgent, setIsAgent] = useState(true);
  const [clientSheetVisible, setClientSheetVisible] = useState(false);

  useEffect(() => {
    if (user && user.email == "backend@msr.com" && !isBackend) {
      setIsBackend(true);
      setIsAgent(false);
    } else if (user && user.email == "sales@msr.com" && !isSalesManager) {
      setIsSalesManager(true);
      setIsAgent(false);
    } else if (user && (user.email == "admin@msr.com")) {
      setIsAgent(false);
    } else if (user && user.type == "agent") {
      setIsAgent(true);
    }
  }, [user, isBackend, isSalesManager]);

  useEffect(() => {
    const fetchVisibility = async () => {
      if (localStorage.getItem("token")) {
        try {
          const response = await axios.get(`${API_URI}/client-sheet-visibility`, getHeaders());
          setClientSheetVisible(response.data.visible);
        } catch (error) {
          console.error("Error fetching client sheet visibility:", error);
        }
      }
    };
    fetchVisibility();
  }, [user]);

  const logout = () => {
    localStorage.removeItem("admin");
    localStorage.removeItem("token");
    setUser(null);
    setIsBackend(false);
    setIsSalesManager(false);
    setIsAgent(false);
    setClientSheetVisible(false);
  };
  console.log("USER", user);
  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        logout,
        isBackend,
        isSalesManager,
        isAgent,
        clientSheetVisible,
        setClientSheetVisible,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
