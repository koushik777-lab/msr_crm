import axios from "axios";
import React from "react";
import { useAuth } from "../context/AuthContext";
import { API_URI } from "../utils/constants";
import { fetchUser } from "../routes/AppRoutes";
import { getErrToast, getHeaders, getSuccessToast } from "../utils/helpers";

const LoginOverlay = () => {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const isLogout = user?.offDuty;

  if (user && !isLogout) {
    return null;
  }

  const handleLogin = async () => {
    setLoading(true);
    try {
      await axios.get(`${API_URI}/agent/off-duty`, getHeaders());
      const response = await fetchUser();
      setUser(response);
      getSuccessToast("Logged in successfully");
    } catch (error) {
      console.error("Error logging in:", error);
      getErrToast("Error logging in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 backdrop-blur-sm z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
          You've been logged out
        </h2>
        <p className="text-gray-600 mb-6 text-center">
          Please log in to access this section.
        </p>
        <button
          className={`w-full font-medium py-2 px-4 rounded transition duration-300 ${
            loading
              ? "bg-gray-400 text-gray-100 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Log In"}
        </button>
      </div>
    </div>
  );
};

export default LoginOverlay;
