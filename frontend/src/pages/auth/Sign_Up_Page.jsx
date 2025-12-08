import React, { useEffect, useState } from "react";
import { TbMessageChatbot } from "react-icons/tb";
import axios from "axios";
import { GiCoffeeCup } from "react-icons/gi";
import { IoMdPerson } from "react-icons/io";
import { MdEmail } from "react-icons/md";
import { FcGoogle } from "react-icons/fc";
import { BiLogoFacebookCircle } from "react-icons/bi";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FaApple } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LogoDark from "../../assets/images/Pixel & Pen(B&W).png";

function Sign_Up_Page() {
  const navigate = useNavigate();
  const [showPassword, setshowPassword] = useState(false);
  const [showConfirmPassword, setshowConfirmPassword] = useState();
  const [role, setRole] = useState("");
  const [form, setForm] = useState({
    pass: "",
    cpass: "",
    email: "",
    username: "",
    RegisterAs: "",
  });
  const [Strength, setStrength] = useState();
  const [valuePassMatch, setvaluePassMatch] = useState();
  const [Error, setError] = useState();
  const [isEmailExist, setisEmailExist] = useState(null);
  const [isUserExist, setisUserExist] = useState(null);

  const AxiosInstance = axios.create({
    baseURL: "http://localhost:3000/",
    timeout: 10000,
    headers: { "X-Custom-Header": "foobar" },
  });

  const showTogglePassword = () => {
    setshowPassword((prevState) => !prevState);
  };

  const showToggleConfirmPassword = () => {
    setshowConfirmPassword((prevState) => !prevState);
  };

  function checkPasswordMatch(e) {
    const { name, value } = e.target;
    const updatedForm = { ...form, [name]: value };
    setForm(updatedForm);

    if (name === "pass" || name === "cpass") {
      const { pass, cpass } = updatedForm;

      if (!pass || !cpass) {
        setvaluePassMatch("Password field can't be left Empty");
      } else if (pass === cpass) {
        setvaluePassMatch("Password Matched");
      } else {
        setvaluePassMatch("Password didn't Match");
      }
    }
  }

  const passwordMatch = {
    "Password Matched": "text-green-500 dark:text-green-400 border-green-500",
    "Password didn't Match": "text-red-500 dark:text-red-400 border-red-500",
    "Password field can't be left Empty": "text-yellow-500 dark:text-yellow-400 border-red-500",
  };

  function CheckPasswordStrength(e) {
    setForm({ ...form, [e.target.name]: e.target.value });

    let password = e.target.value;

    if (password.length === 0) {
      setStrength("");
    } else if (
      password.length >= 8 &&
      /[a-z]/.test(password) &&
      /\d/.test(password) &&
      /[A-Z]/.test(password) &&
      /[^A-Za-z0-9]/.test(password)
    ) {
      setStrength("Password is Strong");
    } else if (
      password.length >= 8 &&
      /[a-z]/.test(password) &&
      /\d/.test(password) &&
      /[A-Z]/.test(password)
    ) {
      setStrength("Password is Medium");
    }
    // Check if the password is weak (length >= 4)
    else if (password.length >= 4) {
      setStrength("Password is Weak");
    } else {
      setStrength("Password is Very Weak");
    }
  }

  const strengthClasses = {
    "Password is Very Weak": "text-red-500 dark:text-red-400 border-red-500",
    "Password is Weak": "text-orange-500 dark:text-orange-400 border-orange-500",
    "Password is Medium": "text-yellow-500 dark:text-yellow-400 border-yellow-500",
    "Password is Strong": "text-green-500 dark:text-green-400 border-green-500",
  };

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setRole(e.target.value);
    console.log(form);
  }

  async function checkUsernameExist(username) {
    if (username) {
      try {
        const response = await AxiosInstance.get(`/check-username/${username}`);
        setisUserExist(response.data.exists);
      } catch (err) {
        console.log("Error checking email existence:", err);
      }
    } else {
      setisUserExist(null);
    }
  }

  useEffect(() => {
    if (form.username) {
      checkUsernameExist(form.username);
      console.log(form.username);
    }
  }, [form.username]);

  async function checkEmailExist(email) {
    if (email) {
      try {
        const response = await AxiosInstance.get(`/check-email/${email}`);
        setisEmailExist(response.data.exists);
      } catch (err) {
        console.log("Error checking email existence:", err);
      }
    } else {
      setisEmailExist(null);
    }
  }

  useEffect(() => {
    if (form.email) {
      checkEmailExist(form.email);
      console.log(form.email);
    }
  }, [form.email]);

  function handlePasswordChange(e) {
    checkPasswordMatch(e);
    CheckPasswordStrength(e);
  }

  async function handleFormSubmit(e) {
    e.preventDefault();

    if (form.pass !== form.cpass) {
      toast.error("Check credentials and Retry again!");
      return; // Don't submit the form
    } else if (isEmailExist || isUserExist) {
      toast.error("Email or username already exists!");
      return; // Don't submit the form
    } else {
      if (!form.RegisterAs) {
        toast.error("Please select a user role");
        return;
      }
      try {
        const response = await AxiosInstance.post("/submit", {
          username: form.username,
          password: form.pass,
          email: form.email,
          RegisterAs: form.RegisterAs,
        });

        console.log("Navigating to /verify-otp with email:", form.email);
        navigate("/verify-otp", {
          state: { email: form.email },
        });

        toast.success("Otp sent successfully");
      } catch (err) {
        const message = err.response?.data?.message || "An error occurred";
        console.log(err);
        toast.error(message);
      }

      setForm({ pass: "", cpass: "", email: "", username: "" });
      setStrength("");
      setvaluePassMatch("");
      console.log("Form submitted successfully");
    }
  }

  return (
    <>
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4 transition-all duration-300">
        <div className="w-full max-w-6xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-lg border border-white/20 dark:border-gray-700/50 transition-all duration-300">
            <div className="flex flex-col lg:flex-row min-h-[90vh]">
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
                    <p className="text-white/80 font-medium text-lg">Enjoy the Journey</p>
                  </div>
                </div>
              </div>

              {/* Right Side - Form Section */}
              <div className="lg:w-3/5 p-8 lg:p-12 bg-white dark:bg-gray-800 transition-colors duration-300">
                <div className="max-w-md mx-auto">
                  {/* Header */}
                  <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-2">
                      Create Account
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">Join our creative community today</p>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleFormSubmit} className="space-y-6">
                    {/* Role Selection */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Choose your role
                      </label>
                      <div className="relative">
                        <select
                          name="RegisterAs"
                          value={form.RegisterAs}
                          onChange={(e) => {
                            handleChange(e);
                            setRole(e.target.value);
                          }}
                          className={`w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none transition-all duration-300 ${
                            form.RegisterAs === "" ? "text-gray-400 dark:text-gray-500" : ""
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

                    {/* Email Input */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email Address
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 pl-12 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none transition-all duration-300 placeholder-gray-400 dark:placeholder-gray-500"
                          placeholder="Enter your email"
                        />
                        <MdEmail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
                        {isEmailExist && (
                          <p className="text-red-500 dark:text-red-400 text-sm mt-1 flex items-center">
                            <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                            Email already exists
                          </p>
                        )}
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
                          name="username"
                          value={form.username}
                          onChange={handleChange}
                          minLength={4}
                          required
                          className="w-full px-4 py-3 pl-12 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none transition-all duration-300 placeholder-gray-400 dark:placeholder-gray-500"
                          placeholder="Choose a username"
                        />
                        <IoMdPerson className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
                        {isUserExist && (
                          <p className="text-red-500 dark:text-red-400 text-sm mt-1 flex items-center">
                            <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                            Username already exists
                          </p>
                        )}
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
                          value={form.pass}
                          maxLength={16}
                          minLength={4}
                          name="pass"
                          onChange={handlePasswordChange}
                          className="w-full px-4 py-3 pr-12 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none transition-all duration-300 placeholder-gray-400 dark:placeholder-gray-500"
                          placeholder="Create a password"
                        />
                        <button
                          type="button"
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                          onClick={showTogglePassword}
                        >
                          {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                        </button>
                        {Strength && (
                          <p className={`text-sm mt-1 font-medium ${strengthClasses[Strength]}`}>
                            {Strength}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Confirm Password Input */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          required
                          value={form.cpass}
                          name="cpass"
                          className="w-full px-4 py-3 pr-12 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none transition-all duration-300 placeholder-gray-400 dark:placeholder-gray-500"
                          placeholder="Confirm your password"
                          onChange={handlePasswordChange}
                        />
                        <button
                          type="button"
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                          onClick={showToggleConfirmPassword}
                        >
                          {showConfirmPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                        </button>
                        {valuePassMatch && (
                          <p className={`text-sm mt-1 font-medium ${passwordMatch[valuePassMatch]}`}>
                            {valuePassMatch}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 dark:from-blue-500 dark:to-purple-500 dark:hover:from-blue-600 dark:hover:to-purple-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                    >
                      Create Account
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

                  {/* Social Sign Up
                  <div className="flex justify-center space-x-4 mb-8">
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

                  {/* Login Link */}
                  <div className="text-center">
                    <p className="text-gray-600 dark:text-gray-400">
                      Already have an account?{" "}
                      <Link
                        to="/Login"
                        className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200"
                      >
                        Sign in here
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

export default Sign_Up_Page;