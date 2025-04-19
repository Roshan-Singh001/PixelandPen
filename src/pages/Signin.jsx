import React, { useState, useEffect } from "react";
import EyeOpenIcon from "../assets/images/eye-svgrepo-com.svg";
import EyeCloseIcon from "../assets/images/eye-closed-svgrepo-com.svg";

const EyeIcon = ({ show, onClick }) => (
  <img
    src={show ? EyeOpenIcon : EyeCloseIcon}
    onClick={onClick}
    alt="Toggle Password Visibility"
    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer w-5 h-5"
  />
);

const InputField = ({
  type,
  name,
  value,
  onChange,
  placeholder,
  showToggle,
  showPassword,
  toggle,
}) => (
  <div className="relative">
    <input
      type={showToggle && showPassword ? "text" : type}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full px-2 py-1 h-8 border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 text-sm transition-colors duration-300"
    />
    {showToggle && <EyeIcon show={showPassword} onClick={toggle} />}
  </div>
);

const AnimatedBackground = () => (
  <div className="absolute inset-0 -z-10">
    <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 animate-gradient-xy overflow-hidden dark:opacity-0"></div>
    <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-purple-800 to-indigo-900 animate-gradient-xy overflow-hidden opacity-0 dark:opacity-100"></div>
  </div>
);

const LoginSignup = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [userType, setUserType] = useState("normalUser");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    contributorReason: "",
    adminSecretCode: "",
  });

  useEffect(() => {
    if (!isLogin && userType === "admin") {
      setUserType("normalUser");
    }
  }, [isLogin, userType]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      email: "",
      password: "",
      confirmPassword: "",
      contributorReason: "",
      adminSecretCode: "",
    });
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleSwitchMode = () => {
    setIsLogin((prev) => !prev);
    resetForm();
    if (isLogin && userType === "admin") {
      setUserType("normalUser");
    }
  };

  const renderFormFields = () => {
    const commonFields = (
      <>
        <InputField
          type="email"
          name="email"
          placeholder="Enter email"
          value={formData.email}
          onChange={handleInputChange}
        />
        <InputField
          type="password"
          name="password"
          placeholder="Enter password"
          value={formData.password}
          onChange={handleInputChange}
          showToggle
          showPassword={showPassword}
          toggle={() => setShowPassword((prev) => !prev)}
        />
      </>
    );

    switch (userType) {
      case "normalUser":
        return isLogin ? (
          <>{commonFields}</>
        ) : (
          <>
            {commonFields}
            <InputField
              type="password"
              name="confirmPassword"
              placeholder="Confirm password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              showToggle
              showPassword={showConfirmPassword}
              toggle={() => setShowConfirmPassword((prev) => !prev)}
            />
          </>
        );

      case "contributor":
        return isLogin ? (
          <>{commonFields}</>
        ) : (
          <>
            {commonFields}
            <textarea
              name="contributorReason"
              placeholder="Why do you want to be a contributor?"
              value={formData.contributorReason}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-md h-28 focus:border-green-500 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 text-base transition-colors duration-300"
            />
          </>
        );

      case "admin":
        return (
          <>
            {commonFields}
            <InputField
              type="text"
              name="adminSecretCode"
              placeholder="Enter admin secret code"
              value={formData.adminSecretCode}
              onChange={handleInputChange}
            />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <AnimatedBackground />

      <div className="w-full max-w-md mx-auto mt-12 bg-white/80 dark:bg-gray-800/90 backdrop-blur-md p-6 rounded-md shadow-md space-y-3 z-10 transition-colors duration-300">
        <h2 className="text-base font-medium text-center text-gray-700 dark:text-gray-200 transition-colors duration-300">
          {isLogin ? "Sign In" : "Sign Up"}
        </h2>

        <div className="flex justify-between items-center gap-2 text-xs">
          <label className="text-gray-700 dark:text-gray-300 transition-colors duration-300">
            Role:
          </label>
          <select
            value={userType}
            onChange={(e) => setUserType(e.target.value)}
            className="flex-1 px-2 py-1 h-8 bg-white border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 text-xs transition-colors duration-300"
          >
            <option value="normalUser">Normal User</option>
            <option value="contributor">Contributor</option>
            {isLogin && <option value="admin">Admin</option>}
          </select>
        </div>

        <form className="space-y-2 text-sm">
          <div className="mt-3">{renderFormFields()}</div>

          <button
            type="submit"
            className={`w-full py-1 h-8 ${
              userType === "admin"
                ? "bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
                : userType === "contributor"
                ? "bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
                : "bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
            } text-white rounded-md font-medium text-xs transition-all duration-300`}
          >
            {isLogin ? "Sign In" : "Sign Up"}
          </button>
        </form>

        <p className="text-center text-xs text-gray-600 dark:text-gray-400 transition-colors duration-300">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={handleSwitchMode}
            className="text-blue-500 dark:text-blue-400 hover:underline transition-colors duration-300"
          >
            {isLogin ? "Sign Up" : "Sign In"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginSignup;
