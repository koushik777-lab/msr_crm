import React from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import AppRoutes from "./routes/AppRoutes";
import { Toaster } from "react-hot-toast";
import { AgentProvider } from "./context/AgentContext";

const App = () => {
  return (
    <AuthProvider>
      <AgentProvider>
        <BrowserRouter>
          <Toaster position="top-center" />
          <AppRoutes />
        </BrowserRouter>
      </AgentProvider>
    </AuthProvider>
  );
};

export default App;
