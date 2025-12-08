import React from "react";
import { GiCoffeeCup } from "react-icons/gi";
import { IoMdPerson } from "react-icons/io";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import { BiLogoFacebookCircle } from "react-icons/bi";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FaApple } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LogoLight from "../../assets/images/Pixel & Pen.png";
import LogoDark from "../../assets/images/Pixel & Pen(B&W).png";

import PixelPenLoader from "../../components/PixelPenLoader";
import { useAuth } from "../../contexts/AuthContext";

function Login_page() {
  const { loggedIn, userData, loading, login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setshowPassword] = useState(false);
  const [role, setRole] = useState("");
  const [form, setform] = useState({ username: "", pass: "", loginAs: "" });
  const navigate = useNavigate();
  useEffect(() => {
    console.log(loggedIn, userData);
    if (loggedIn && !loading && userData?.userRole) {
      console.log("hello");
      navigate(`/dashboard/${userData.userRole.toLowerCase()}`);
    }
  }, [loggedIn, loading, userData, navigate]);
  

  const showPasswordToggle = () => {
    setshowPassword((prevState) => !prevState);
  };

  function handleChange(e) {
    setform({ ...form, [e.target.name]: e.target.value });
  }

  async function handleFormValidation(e) {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await login(form.username, form.pass, form.loginAs);

      if (result.success) {
        toast.success("Login successful!");
        navigate(`/dashboard/${result.userRole.toLowerCase()}`);
      } else {
        
        toast.error(`Error: ${result.error || "Login failed, please try again."}`);
      }
    } catch (err) {
      toast.error("An unexpected error occurred during login.");
    }
    setIsLoading(false);
  }

  if (isLoading || loading) {
    return <PixelPenLoader/>
    
  }

  if (loggedIn && userData?.userRole) {
    return null; 
}

  return (
    <>
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4 transition-all duration-300">
        <div className="w-full max-w-6xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-lg border border-white/20 dark:border-gray-700/50 transition-all duration-300">
            <div className="flex flex-col lg:flex-row min-h-[85vh]">
              {/* Left Side - Hero Section */}
              <div className="lg:w-2/5 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 dark:from-blue-700 dark:via-purple-700 dark:to-indigo-800 relative overflow-hidden">
                {/* Animated background elements */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-600/20 animate-pulse"></div>
                <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-bounce"></div>
                <div className="absolute bottom-10 left-10 w-24 h-24 bg-purple-400/20 rounded-full blur-lg animate-pulse"></div>
                
                <div className="relative z-10 h-full flex flex-col justify-center items-center p-8 text-center">
                  {/* Logo Section */}
                  <div className="mb-8 transform hover:scale-105 transition-transform duration-300">
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                      <img 
                        src={LogoDark} 
                        alt="WebsiteLogo" 
                        className="max-w-[150px] h-auto filter brightness-0 invert"
                      />
                    </div>
                  </div>

                  {/* Quote Section */}
                  <div className="mb-12 max-w-sm">
                    <blockquote className="text-white/90 font-medium text-lg leading-relaxed italic">
                      "A pixel paints, a pen writes—together, they build worlds."
                    </blockquote>
                  </div>

                  {/* Coffee Icon */}
                  <div className="flex flex-col items-center space-y-3">
                    <div className="bg-white/10 backdrop-blur-sm rounded-full p-4 border border-white/20 transform hover:scale-110 transition-all duration-300">
                      <GiCoffeeCup size={48} className="text-white animate-pulse" />
                    </div>
                    <p className="text-white/80 font-medium text-lg">Welcome Back</p>
                  </div>
                </div>
              </div>

              {/* Right Side - Form Section */}
              <div className="lg:w-3/5 p-8 lg:p-12 bg-white dark:bg-gray-800 transition-colors duration-300">
                <div className="max-w-md mx-auto">
                  {/* Header */}
                  <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-2">
                      Welcome Back
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">Sign in to your account</p>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleFormValidation} className="space-y-6">
                    {/* Role Selection */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Sign in as
                      </label>
                      <div className="relative">
                        <select
                          name="loginAs"
                          value={form.loginAs}
                          onChange={(e) => {
                            handleChange(e);
                            setRole(e.target.value);
                          }}
                          className={`w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none transition-all duration-300 ${
                            form.loginAs === "" ? "text-gray-400 dark:text-gray-500" : ""
                          }`}
                        >
                          <option value="" hidden>
                            Select your role...
                          </option>
                          <option value="Admin">Admin</option>
                          <option value="Contributor">Contributor</option>
                          <option value="Reader">Reader</option>
                        </select>
                      </div>
                    </div>

                    {/* Username Input */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Username
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          minLength={4}
                          className="w-full px-4 py-3 pl-12 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none transition-all duration-300 placeholder-gray-400 dark:placeholder-gray-500"
                          onChange={handleChange}
                          name="username"
                          value={form.username}
                          placeholder="Enter your username"
                        />
                        <IoMdPerson className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
                      </div>
                    </div>

                    {/* Password Input */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          minLength={4}
                          onChange={handleChange}
                          name="pass"
                          value={form.pass}
                          className="w-full px-4 py-3 pr-12 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none transition-all duration-300 placeholder-gray-400 dark:placeholder-gray-500"
                          placeholder="Enter your password"
                        />
                        <button
                          type="button"
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                          onClick={showPasswordToggle}
                        >
                          {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                        </button>
                      </div>
                    </div>

                    {/* Forgot Password Link */}
                    <div className="text-right">
                      <a href="#" className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200">
                        Forgot password?
                      </a>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 dark:from-blue-500 dark:to-purple-500 dark:hover:from-blue-600 dark:hover:to-purple-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                    >
                      Sign In
                    </button>
                  </form>

                  {/* Divider */}
                  {/* <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                        Or continue with
                      </span>
                    </div>
                  </div> */}

                  {/* Social Sign In */}
                  {/* <div className="flex justify-center space-x-4 mb-8">
                    <button className="w-12 h-12 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl flex items-center justify-center transition-all duration-300 transform hover:scale-110">
                      <FcGoogle size={24} />
                    </button>
                    <button className="w-12 h-12 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl flex items-center justify-center transition-all duration-300 transform hover:scale-110">
                      <BiLogoFacebookCircle size={24} className="text-blue-600" />
                    </button>
                    <button className="w-12 h-12 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl flex items-center justify-center transition-all duration-300 transform hover:scale-110">
                      <FaApple size={24} className="text-gray-800 dark:text-gray-200" />
                    </button>
                  </div> */}

                  {/* Register Link */}
                  <div className="text-center">
                    <p className="text-gray-600 dark:text-gray-400">
                      Don't have an account?{" "}
                      <Link
                        to="/register"
                        className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200"
                      >
                        Register here
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <ToastContainer 
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
      </main>
    </>
  );
}

export default Login_page;