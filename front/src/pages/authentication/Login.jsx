import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import msrLogo from "../../assets/msrSvgLogo.svg";
import axios from "axios";
import { API_URI } from "../../utils/constants";
import { FaEyeSlash, FaEye } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const Login = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error for that field
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
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
      setIsLoading(true);
      try {
        const { email, password } = formData;
        const {
          data: { token, user },
        } = await axios.post(`${API_URI}/login/admin`, { email, password });
        localStorage.setItem("token", token);
        localStorage.setItem("admin", JSON.stringify(user));
        setUser(user);
        navigate(`${user?.type === "admin" ? "/dashboard" : "/leads"}`);
      } catch (error) {
        setErrors({ submit: "Invalid credentials. Please try again." });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-[#030712] font-sans selection:bg-indigo-500/30 overflow-hidden relative">
      {/* Advanced Animated Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.2, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-600/20 blur-[120px]"
        />
        <motion.div
          animate={{ rotate: -360, scale: [1, 1.5, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-blue-600/20 blur-[150px]"
        />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      </div>

      {/* Main Layout Container */}
      <div className="z-10 w-full flex flex-col lg:flex-row h-screen">

        {/* Left Section - 3D Hero */}
        <div className="hidden lg:flex w-[45%] xl:w-1/2 relative justify-center items-center p-8 overflow-hidden flex-col">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative z-20 w-full max-w-lg xl:max-w-xl flex justify-center items-center"
          >
            <div className="relative w-full flex justify-center items-center">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-[2.5rem] blur-2xl opacity-40"></div>
              <img
                src={"/crmImg.png"}
                alt="CRM System"
                className="relative w-full h-auto max-h-[60vh] object-contain rounded-[2rem] shadow-[0_20px_50px_rgba(8,_112,_184,_0.3)] border border-white/5"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="max-w-xl mt-12 text-center z-20"
          >
            <h1 className="text-4xl lg:text-5xl font-black mb-4 tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-blue-100 to-indigo-300">
              Future of Business
            </h1>
            <p className="text-lg text-indigo-200/80 font-medium font-light">
              Experience the next generation CRM. Seamlessly connected, insanely fast, and elegantly designed.
            </p>
          </motion.div>
        </div>

        {/* Right Section - Form */}
        <div className="w-full lg:w-[55%] xl:w-1/2 flex items-center justify-center p-4 sm:p-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, type: "spring", bounce: 0.3 }}
            className="w-full max-w-[460px] relative"
          >
            {/* Glassmorphism Card */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 sm:p-12 rounded-[2rem] shadow-2xl relative overflow-hidden">

              {/* Internal glowing beam effect */}
              <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-400 to-transparent opacity-50"></div>

              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex justify-center mb-10"
              >
                <div className="bg-white/10 p-4 rounded-2xl shadow-inner border border-white/5 backdrop-blur-md">
                  <img src={msrLogo} alt="MSR Logo" className="h-12 lg:h-14 brightness-0 invert drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]" />
                </div>
              </motion.div>

              <div className="text-center mb-10">
                <motion.h2
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl font-bold text-white mb-2 tracking-tight"
                >
                  Welcome Back
                </motion.h2>
                <motion.p
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-indigo-200/70 font-medium"
                >
                  Securely login to your workspace
                </motion.p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-2"
                >
                  <label className="block text-sm font-semibold text-indigo-100 ml-1">
                    Email Address
                  </label>
                  <div className="relative group">
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-5 py-4 rounded-xl bg-black/20 border ${errors.email ? 'border-red-400/50' : 'border-white/10'} text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400/50 transition-all duration-300 placeholder:text-white/20`}
                    />
                  </div>
                  <AnimatePresence>
                    {errors.email && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-red-400 text-xs font-semibold ml-1 mt-1 flex items-center"
                      >
                        <svg className="w-3.5 h-3.5 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
                        {errors.email}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="space-y-2"
                >
                  <div className="flex justify-between items-center ml-1">
                    <label className="block text-sm font-semibold text-indigo-100">
                      Password
                    </label>
                    <a href="#" className="text-xs text-indigo-400 hover:text-white font-semibold transition-colors">
                      Forgot Password?
                    </a>
                  </div>
                  <div className="relative group">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full px-5 py-4 rounded-xl bg-black/20 border ${errors.password ? 'border-red-400/50' : 'border-white/10'} text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400/50 transition-all duration-300 placeholder:text-white/20`}
                    />
                    <button
                      type="button"
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors cursor-pointer p-1"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                    </button>
                  </div>
                  <AnimatePresence>
                    {errors.password && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-red-400 text-xs font-semibold ml-1 mt-1 flex items-center"
                      >
                        <svg className="w-3.5 h-3.5 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
                        {errors.password}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                <AnimatePresence>
                  {errors.submit && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium py-3 px-4 rounded-xl flex items-center"
                    >
                      <svg className="w-5 h-5 mr-3 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path></svg>
                      {errors.submit}
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(99, 102, 241, 0.4)" }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 rounded-xl text-white font-bold text-base flex items-center justify-center transition-all mt-4 bg-gradient-to-r from-indigo-600 to-blue-500 disabled:opacity-70 disabled:cursor-not-allowed group relative overflow-hidden"
                >
                  {/* Button shine effect */}
                  <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />

                  {isLoading ? (
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : null}
                  {isLoading ? 'Authenticating...' : 'Sign In to Workspace'}
                </motion.button>
              </form>
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
};

export default Login;

