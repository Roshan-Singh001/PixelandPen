import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";

// Images
import LogoLight from "../assets/images/Pixel & Pen.png";
import LogoDark from "../assets/images/Pixel & Pen(B&W).png";

// Icons — swapped to a single consistent set (Feather via react-icons)
import {
  FiMenu,
  FiX,
  FiChevronDown,
  FiMoon,
  FiSun,
  FiGlobe,
  FiLogOut,
  FiUser,
  FiGrid,
} from "react-icons/fi";


const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "Blog", to: "/blog" },
  { label: "Categories", to: "/category" },
  { label: "About us", to: "/about" },
  { label: "Contact us", to: "/contact" },
];

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false); // account dropdown
  const [mobileOpen, setMobileOpen] = useState(false); // mobile sheet
  const { isDarkMode, toggleDark } = useTheme();
  const { loggedIn, logout, userData } = useAuth();
  const menuRef = useRef(null);

  // Close the account dropdown when clicking outside it
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Lock body scroll while the mobile sheet is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header
      className="sticky top-0 z-50 w-full border-b backdrop-blur-md
        bg-[#FAFAF8]/90 border-[#E5E7EB]
        dark:bg-[#0B1220]/90 dark:border-[#243247]
        font-['Inter',sans-serif]"
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo — left */}
        <Link to="/" className="flex shrink-0 items-center gap-2" onClick={() => setMobileOpen(false)}>
          <img
            className="h-8 w-auto sm:h-9"
            src={isDarkMode ? LogoDark : LogoLight}
            alt="Pixel & Pen"
          />
        </Link>

        {/* Nav links — true center, classic SaaS layout */}
        <ul className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.to}>
              <Link
                to={link.to}
                className="group relative px-4 py-2 text-[15px] font-medium tracking-tight
                  text-[#1F2937] transition-colors duration-200
                  hover:text-[#1E3A5F]
                  dark:text-[#F8FAFC] dark:hover:text-[#4F8EF7]"
              >
                {link.label}
                <span
                  className="pointer-events-none absolute inset-x-4 -bottom-0.5 h-[2px] scale-x-0
                    rounded-full bg-gradient-to-r from-[#F59E0B] to-[#F97316] transition-transform
                    duration-200 ease-out group-hover:scale-x-100
                    dark:from-[#F6B93B] dark:to-[#FF8A3D]"
                />
              </Link>
            </li>
          ))}
        </ul>

        {/* Right cluster — actions */}
        <div className="hidden items-center gap-2 lg:flex">
          <button
            aria-label="Change language"
            className="rounded-full p-2 text-[#6B7280] transition-colors duration-200
              hover:bg-[#1E3A5F]/5 hover:text-[#1E3A5F]
              dark:text-[#AAB4C5] dark:hover:bg-white/5 dark:hover:text-[#4F8EF7]"
          >
            <FiGlobe className="h-5 w-5" />
          </button>

          <button
            aria-label="Toggle dark mode"
            onClick={toggleDark}
            className="rounded-full p-2 text-[#6B7280] transition-colors duration-200
              hover:bg-[#1E3A5F]/5 hover:text-[#1E3A5F]
              dark:text-[#AAB4C5] dark:hover:bg-white/5 dark:hover:text-[#F6B93B]"
          >
            {isDarkMode ? <FiSun className="h-5 w-5" /> : <FiMoon className="h-5 w-5" />}
          </button>

          <span className="mx-1 h-6 w-px bg-[#E5E7EB] dark:bg-[#243247]" />

          {loggedIn ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium
                  transition-colors duration-200
                  border-[#E5E7EB] bg-white text-[#1F2937] hover:border-[#1E3A5F]/30
                  dark:border-[#243247] dark:bg-[#162033] dark:text-[#F8FAFC] dark:hover:border-[#4F8EF7]/40"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1E3A5F] text-xs font-semibold text-white dark:bg-[#4F8EF7] dark:text-[#0B1220]">
                  {(userData?.name || "U").charAt(0).toUpperCase()}
                </span>
                Account
                <FiChevronDown
                  className={`h-4 w-4 text-[#6B7280] transition-transform duration-200 dark:text-[#AAB4C5] ${
                    menuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {menuOpen && (
                <div
                  className="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border shadow-lg
                    border-[#E5E7EB] bg-white
                    dark:border-[#243247] dark:bg-[#162033]"
                >
                  <Link
                    to={`/dashboard/${userData?.userRole}`}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#1F2937] transition-colors
                      hover:bg-[#1E3A5F]/5 dark:text-[#F8FAFC] dark:hover:bg-white/5"
                  >
                    <FiGrid className="h-4 w-4 text-[#6B7280] dark:text-[#AAB4C5]" />
                    Dashboard
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#1F2937] transition-colors
                      hover:bg-[#1E3A5F]/5 dark:text-[#F8FAFC] dark:hover:bg-white/5"
                  >
                    <FiUser className="h-4 w-4 text-[#6B7280] dark:text-[#AAB4C5]" />
                    Profile
                  </Link>
                  <div className="h-px bg-[#E5E7EB] dark:bg-[#243247]" />
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      logout();
                    }}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-[#DC2626]
                      transition-colors hover:bg-[#DC2626]/5 dark:text-[#EF4444] dark:hover:bg-[#EF4444]/10"
                  >
                    <FiLogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login">
              <button
                className="rounded-md px-5 py-2 text-sm font-semibold text-white shadow-sm
                  transition-colors duration-200
                  bg-[#1E3A5F] hover:bg-[#16304f]
                  dark:bg-[#4F8EF7] dark:text-[#0B1220] dark:hover:bg-[#3f7de0]"
              >
                Log in
              </button>
            </Link>
          )}
        </div>

        {/* Mobile trigger */}
        <button
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileOpen((v) => !v)}
          className="flex items-center justify-center rounded-md p-2 text-[#1F2937]
            hover:bg-[#1E3A5F]/5 dark:text-[#F8FAFC] dark:hover:bg-white/5 lg:hidden"
        >
          {mobileOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile sheet */}
      <div
        className={`overflow-hidden border-t transition-[max-height] duration-300 ease-in-out lg:hidden
          border-[#E5E7EB] bg-[#FAFAF8] dark:border-[#243247] dark:bg-[#0B1220]
          ${mobileOpen ? "max-h-[26rem]" : "max-h-0"}`}
      >
        <ul className="flex flex-col px-4 py-2">
          {NAV_LINKS.map((link) => (
            <li key={link.to}>
              <Link
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className="block rounded-md px-3 py-3 text-[15px] font-medium text-[#1F2937]
                  transition-colors hover:bg-[#1E3A5F]/5 hover:text-[#1E3A5F]
                  dark:text-[#F8FAFC] dark:hover:bg-white/5 dark:hover:text-[#4F8EF7]"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-between border-t px-4 py-3 border-[#E5E7EB] dark:border-[#243247]">
          <div className="flex items-center gap-1">
            <button
              aria-label="Toggle dark mode"
              onClick={toggleDark}
              className="rounded-full p-2 text-[#6B7280] hover:bg-[#1E3A5F]/5 dark:text-[#AAB4C5] dark:hover:bg-white/5"
            >
              {isDarkMode ? <FiSun className="h-5 w-5" /> : <FiMoon className="h-5 w-5" />}
            </button>
            <button
              aria-label="Change language"
              className="rounded-full p-2 text-[#6B7280] hover:bg-[#1E3A5F]/5 dark:text-[#AAB4C5] dark:hover:bg-white/5"
            >
              <FiGlobe className="h-5 w-5" />
            </button>
          </div>

          {loggedIn ? (
            <div className="flex items-center gap-2">
              <Link
                to={`/dashboard/${userData?.userRole}`}
                onClick={() => setMobileOpen(false)}
                className="rounded-full border px-3.5 py-1.5 text-sm font-medium text-[#1F2937]
                  border-[#E5E7EB] dark:border-[#243247] dark:text-[#F8FAFC]"
              >
                Dashboard
              </Link>
              <button
                onClick={() => {
                  setMobileOpen(false);
                  logout();
                }}
                className="rounded-full px-3.5 py-1.5 text-sm font-medium text-[#DC2626] dark:text-[#EF4444]"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" onClick={() => setMobileOpen(false)}>
              <button
                className="rounded-full px-5 py-2 text-sm font-semibold text-white
                  bg-[#1E3A5F] dark:bg-[#4F8EF7] dark:text-[#0B1220]"
              >
                Log in
              </button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;