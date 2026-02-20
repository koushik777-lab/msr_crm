import React, { createContext, useState, useContext, useEffect } from "react";

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
  // let isBackend = false, isSalesManager = false, isAgent= false;

  // if (user && user.email == "backend@msr.com") {
  //     isBackend= true;
  //   }
  //   if (user && user.email == "sales@msr.com" ) {
  //       isSalesManager= true;
  //   }
  //   if (user && user.type == "agent") {
  //     isAgent = true
  //   }
  useEffect(() => {
    if (user && user.email == "backend@msr.com" && !isBackend) {
      setIsBackend(true);
      setIsAgent(false);
    } else if (user && user.email == "sales@msr.com" && !isSalesManager) {
      setIsSalesManager(true);
      setIsAgent(false);
    } else if (user && (user.email == "admin@msr.com")) {
      // setIsSalesManager(true);
      setIsAgent(false);
    } else if (user && user.type == "agent") {
      setIsAgent(true);
    }
  }, [user, isBackend, isSalesManager]);

  const logout = () => {
    localStorage.removeItem("admin");
    localStorage.removeItem("token");
    setUser(null);
    setIsBackend(false);
    setIsSalesManager(false);
    setIsAgent(false);
  };
  console.log("USER", user);
  return (
    <AuthContext.Provider
      value={{ user, setUser, logout, isBackend, isSalesManager, isAgent }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
