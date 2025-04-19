import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// Images and Icons
import SearchIcon from "../assets/images/search-4-svgrepo-com.svg";
import LogoLight from "../assets/images/Pixel & Pen.png";
import LogoDark from "../assets/images/Pixel & Pen(B&W).png";
import MoonIcon from "../assets/images/moon-svgrepo-com.svg";
import SunIcon from "../assets/images/light-mode-svgrepo-com.svg";
import LanguageIcon from "../assets/images/language-svgrepo-com.svg";

const Navbar = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme");
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      return savedTheme === "dark" || (!savedTheme && prefersDark);
    }
    return false;
  });
  const [Sidebar, setSidebar] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  const toggleDark = () => {
    setIsDarkMode(!isDarkMode);
  };

  const toggleSidebar = () => {
    setSidebar(!Sidebar);
  };

  return (
    <>
      <div className="dark:bg-gray-900 transition-colors duration-200">
        <nav className="flex justify-between border-gray-200 dark:border-gray-700 p-2 lg:items-center bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
          <div className="main-logo">
            <img
              className="drop-shadow w-[15rem]"
              src={isDarkMode ? LogoDark : LogoLight}
              alt="Logo"
            />
          </div>

          <div
            className={`lg:hidden cursor-pointer p-2 ${
              Sidebar ? "hidden" : "flex items-center"
            }`}
            onClick={toggleSidebar}
          >
            <svg
              className="w-16 text-gray-900 dark:text-white"
              width="24px"
              height="24px"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 6H20M4 12H20M4 18H20"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div
            className={`lg:hidden cursor-pointer p-2 ${
              Sidebar ? "flex items-center" : "hidden"
            }`}
            onClick={toggleSidebar}
          >
            <svg
              className="text-gray-900 dark:text-white"
              width="27px"
              height="27px"
              viewBox="-0.5 -0.5 25 25"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6.96967 16.4697C6.67678 16.7626 6.67678 17.2374 6.96967 17.5303C7.26256 17.8232 7.73744 17.8232 8.03033 17.5303L6.96967 16.4697ZM13.0303 12.5303C13.3232 12.2374 13.3232 11.7626 13.0303 11.4697C12.7374 11.1768 12.2626 11.1768 11.9697 11.4697L13.0303 12.5303ZM11.9697 11.4697C11.6768 11.7626 11.6768 12.2374 11.9697 12.5303C12.2626 12.8232 12.7374 12.8232 13.0303 12.5303L11.9697 11.4697ZM18.0303 7.53033C18.3232 7.23744 18.3232 6.76256 18.0303 6.46967C17.7374 6.17678 17.2626 6.17678 16.9697 6.46967L18.0303 7.53033ZM13.0303 11.4697C12.7374 11.1768 12.2626 11.1768 11.9697 11.4697C11.6768 11.7626 11.6768 12.2374 11.9697 12.5303L13.0303 11.4697ZM16.9697 17.5303C17.2626 17.8232 17.7374 17.8232 18.0303 17.5303C18.3232 17.2374 18.3232 16.7626 18.0303 16.4697L16.9697 17.5303ZM11.9697 12.5303C12.2626 12.8232 12.7374 12.8232 13.0303 12.5303C13.3232 12.2374 13.3232 11.7626 13.0303 11.4697L11.9697 12.5303ZM8.03033 6.46967C7.73744 6.17678 7.26256 6.17678 6.96967 6.46967C6.67678 6.76256 6.67678 7.23744 6.96967 7.53033L8.03033 6.46967ZM8.03033 17.5303L13.0303 12.5303L11.9697 11.4697L6.96967 16.4697L8.03033 17.5303ZM13.0303 12.5303L18.0303 7.53033L16.9697 6.46967L11.9697 11.4697L13.0303 12.5303ZM11.9697 12.5303L16.9697 17.5303L18.0303 16.4697L13.0303 11.4697L11.9697 12.5303ZM13.0303 11.4697L8.03033 6.46967L6.96967 7.53033L11.9697 12.5303L13.0303 11.4697Z"
                fill="currentColor"
              />
            </svg>
          </div>

          <div className="menu lg:flex hidden lg:items-center">
            <ul className="lg:flex dark:text-gray-200">
              <li>
                <Link
                  className="p-3 rounded-md hover:text-blue-800 dark:hover:bg-gray-700 dark:hover:text-white hover:bg-gray-100 focus:bg-gray-200 dark:focus:bg-gray-600 transition-colors duration-200"
                  to="/"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  className="p-3 rounded-md hover:text-blue-800 dark:hover:bg-gray-700 dark:hover:text-white hover:bg-gray-100 focus:bg-gray-200 dark:focus:bg-gray-600 transition-colors duration-200"
                  to="/blog"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  className="p-3 rounded-md hover:text-blue-800 dark:hover:bg-gray-700 dark:hover:text-white hover:bg-gray-100 focus:bg-gray-200 dark:focus:bg-gray-600 transition-colors duration-200"
                  to="/category"
                >
                  Categories
                </Link>
              </li>
              <li>
                <Link
                  className="p-3 rounded-md hover:text-blue-800 dark:hover:bg-gray-700 dark:hover:text-white hover:bg-gray-100 focus:bg-gray-200 dark:focus:bg-gray-600 transition-colors duration-200"
                  to="/about"
                >
                  About us
                </Link>
              </li>
              <li>
                <Link
                  className="p-3 rounded-md hover:text-blue-800 dark:hover:bg-gray-700 dark:hover:text-white hover:bg-gray-100 focus:bg-gray-200 dark:focus:bg-gray-600 transition-colors duration-200"
                  to="/contact"
                >
                  Contact us
                </Link>
              </li>
            </ul>

            <ul className="lg:flex space-x-5 p-2 items-center">
              <button class="flex space-x-1 rounded-lg text-black bg-gray-200 p-2">
                <img src={SearchIcon} alt="search" />
                <p class="text-base">Enter text to search</p>
              </button>
              <Link to="/login">
                <button className="p-2 bg-blue-500 rounded-md text-white hover:bg-blue-600 transition-colors duration-200">
                  Login
                </button>
              </Link>
              <button
                className={`moon-btn p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 ${
                  isDarkMode ? "hidden" : ""
                }`}
                onClick={toggleDark}
              >
                <img className="w-6 h-6" src={MoonIcon} alt="dark-mode" />
              </button>

              <button
                className={`sun-btn p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 ${
                  isDarkMode ? "" : "hidden"
                }`}
                onClick={toggleDark}
              >
                <img className="w-6 h-6" src={SunIcon} alt="sun" />
              </button>
              <button className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
                <img className="w-6 h-6" src={LanguageIcon} alt="language" />
              </button>
            </ul>
          </div>
        </nav>

        <div
          className={`portrait-menu border-b-2 border-gray-200 dark:border-gray-700 lg:hidden my-1 bg-white dark:bg-gray-900 ${
            Sidebar ? "" : "hidden"
          }`}
        >
          <ul className="flex flex-col w-full p-0 m-0 list-none dark:text-gray-200">
            <li className="hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-800 dark:hover:text-white mx-3 my-1 rounded-sm p-1 transition-colors duration-200">
              <Link to="/">Home</Link>
            </li>
            <li className="hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-800 dark:hover:text-white mx-3 my-1 rounded-sm p-1 transition-colors duration-200">
              <Link to="/blog">Blog</Link>
            </li>
            <li className="hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-800 dark:hover:text-white mx-3 my-1 rounded-sm p-1 transition-colors duration-200">
              <Link to="/category">Categories</Link>
            </li>
            <li className="hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-800 dark:hover:text-white mx-3 my-1 rounded-sm p-1 transition-colors duration-200">
              <Link to="/about">About us</Link>
            </li>
            <li className="hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-800 dark:hover:text-white mx-3 my-1 rounded-sm p-1 transition-colors duration-200">
              <Link to="/contact">Contact us</Link>
            </li>
          </ul>

          <ul className="lg:flex lg:space-x-10 flex flex-col p-2 border-t-2 border-gray-200 dark:border-gray-700">
            <button class="flex space-x-1 rounded-lg text-black bg-gray-200 p-2">
              <img src={SearchIcon} alt="search" />
              <p class="text-base">Enter text to search</p>
            </button>
            <div
              className="my-4 flex items-center"
              style={{ marginTop: "10px" }}
            >
              <button
                className={`moon-btn p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 ${
                  isDarkMode ? "hidden" : ""
                }`}
                onClick={toggleDark}
              >
                <img className="w-6 h-6" src={MoonIcon} alt="dark-mode" />
              </button>

              <button
                className={`sun-btn p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 ${
                  isDarkMode ? "" : "hidden"
                }`}
                onClick={toggleDark}
              >
                <img className="w-6 h-6" src={SunIcon} alt="light-mode" />
              </button>

              <button className="lang-btn mx-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
                <img className="w-6 h-6" src={LanguageIcon} alt="language" />
              </button>
            </div>
          </ul>
        </div>
      </div>
    </>
  );
};

export default Navbar;
