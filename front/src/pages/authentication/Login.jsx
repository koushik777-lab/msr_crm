import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import msrLogo from "../../assets/msrSvgLogo.svg";
import axios from "axios";
import { API_URI } from "../../utils/constants";
import { FaEyeSlash, FaEye } from "react-icons/fa";

const Login = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        // Simulate authentication
        const { email, password } = formData;
        const {
          data: { token, user },
        } = await axios.post(`${API_URI}/login/admin`, { email, password });
        localStorage.setItem("token", token);
        localStorage.setItem("admin", JSON.stringify(user));
        setUser(user);
        navigate(`${user?.type === "admin" ? "/dashboard" : "/leads"}`);
      } catch (error) {
        setErrors({ submit: "Invalid credentials" });
      }
    }
  };

  return (
    <div className="w-full h-[100vh] bg-white p-8">
      <div className="flex flex-col lg:flex-row justify-center items-center">
        <img
          src={"/crmImg.png"}
          alt="CRM System"
          className="max-h-[93vh] object-cover"
        />

        {/* Login Form Section */}
        <div className="w-full lg:w-[45%] flex items-center justify-center">
          <div className="w-full max-w-md">
            <div className="flex justify-center mb-6">
              <img src={msrLogo} alt="MSR Logo" className="h-16" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-gray-800 text-center">
              Log in to your account
            </h2>
            <p className="text-gray-600 mb-8 text-center">
              Welcome back ! Please enter your details.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 text-gray-900"
                />
                {errors.email && (
                  <span className="text-red-500 text-sm mt-1">
                    {errors.email}
                  </span>
                )}
              </div>

              <div className="mb-6 relative">
                <label className="block text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 text-gray-900"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <FaEyeSlash size={20} />
                    ) : (
                      <FaEye size={20} />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <span className="text-red-500 text-sm mt-1">
                    {errors.password}
                  </span>
                )}
              </div>

              {errors.submit && (
                <div className="text-red-500 text-center mb-4">
                  {errors.submit}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors duration-200"
              >
                Login
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
