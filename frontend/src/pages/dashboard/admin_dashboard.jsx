import React, { useState, useEffect } from "react";
import {
  UserCheck, FileText, Eye, Users, FolderCog,
} from "lucide-react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import AxiosInstance from "../../api/axiosInstance";
import { FaBars } from "react-icons/fa";
import { BiComment, BiSolidDashboard } from "react-icons/bi";
import { MdArticle, MdAnalytics, MdLogout } from "react-icons/md";
import { IoPersonAdd, IoSettingsSharp } from "react-icons/io5";
import { FaAnglesRight, FaAnglesLeft } from "react-icons/fa6";
import { GrAnnounce } from "react-icons/gr";

import { useAuth } from "../../contexts/AuthContext";
import PixelPenLoader from "../../components/PixelPenLoader";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    path: "",
    icon: <BiSolidDashboard size={18} />,
  },
  {
    label: "Article",
    path: "article",
    icon: <MdArticle size={18} />,
  },
  {
    label: "Contributor",
    path: "contributor",
    icon: <IoPersonAdd size={18} />,
  },
  {
    label: "Announcements",
    path: "announcements",
    icon: <GrAnnounce size={18} />,
  },
  {
    label: "Comments",
    path: "comments",
    icon: <BiComment size={18} />,
  },
  {
    label: "Category",
    path: "category",
    icon: <FolderCog size={18} />,
  },
  {
    label: "Analytics",
    path: "analytics",
    icon: <MdAnalytics size={18} />,
  },
  {
    label: "Settings",
    path: "settings",
    icon: <IoSettingsSharp size={18} />,
  },
];

/* Root component */
const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loggedIn, logout, userData, loading } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [statsData, setStatsData] = useState([]);
  const [articleRequests, setArticleRequests] = useState([]);
  const [contributorRequests, setContributorRequests] = useState([]);

  useEffect(() => {
    document.title = 'Admin · Pixel & Pen';
  }, []);

  const activeItem = NAV_ITEMS.find(({ path }) => {
    if (path === "") {
      return location.pathname === "/dashboard/admin";
    }

    return location.pathname === `/dashboard/admin/${path}`;
  });

  const activeMenu = activeItem?.label || "Dashboard";

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [r1, r2, r3, r4] = await Promise.all([
          AxiosInstance.get("/dashboard/admin/stat/posts"),
          AxiosInstance.get("/dashboard/admin/stat/views"),
          AxiosInstance.get("/dashboard/admin/stat/contributors"),
          AxiosInstance.get("/dashboard/admin/stat/readers"),
        ]);
        setStatsData([
          { title: "Total Posts", value: r1.data.total_p || 0, icon: FileText },
          { title: "Total Views", value: r2.data.total_v || 0, icon: Eye },
          { title: "Total Contributors", value: r3.data.total_c || 0, icon: UserCheck },
          { title: "Total Readers", value: r4.data.total_r || 0, icon: Users },
        ]);
      } catch (e) { console.error(e); }

      try {
        const [ra, rc] = await Promise.all([
          AxiosInstance.get("/dashboard/admin/recent/article"),
          AxiosInstance.get("/dashboard/admin/recent/contributor"),
        ]);
        setArticleRequests(ra.data.recents ?? []);
        setContributorRequests(rc.data.recents ?? []);
      } catch (e) { console.error(e); }
    };

    fetchAll();
  }, []);

  if (loading) return <PixelPenLoader />;
  if (!loggedIn) { navigate("/login"); return null; }

  return (
    <div className="font-[Inter,system-ui,sans-serif] flex h-screen overflow-hidden bg-[#FAFAF8] dark:bg-slate-900 text-gray-800 dark:text-gray-100 antialiased">

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`
          flex flex-col h-screen
          bg-white dark:bg-slate-800
          border-r border-gray-200 dark:border-slate-700
          transition-all duration-200 ease-in-out
          fixed top-0 left-0 z-50 lg:static lg:z-auto
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          ${minimized ? "w-[60px]" : "w-56"}
        `}
      >
        {/* Header row */}
        <div className={`flex items-center border-b border-gray-200 dark:border-slate-700 h-14 px-3   ${minimized ? "justify-center" : "justify-between"}`}>
          {!minimized && (
            <span className="text-sm font-semibold text-[#1E3A5F] dark:text-blue-400 tracking-wide select-none">
              Admin Panel
            </span>
          )}

          <button
            onClick={() => setMinimized(m => !m)}
            className="hidden lg:flex p-1.5 rounded hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-400 dark:text-slate-500 transition-colors  "
            aria-label="Toggle sidebar width"
          >
            {minimized ? <FaAnglesRight size={13} /> : <FaAnglesLeft size={13} />}
          </button>
        </div>

        <nav className="flex-1 py-2 flex flex-col gap-0.5 overflow-y-auto overflow-x-hidden">
          {NAV_ITEMS.map(({ label, path, icon }) => (
            <NavLink
              key={label}
              to={path}
              end={path === ""}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => `
        flex items-center gap-3 mx-2 rounded transition-colors duration-150 text-sm font-medium whitespace-nowrap overflow-hidden
        ${minimized ? "justify-center px-0 py-2.5" : "px-3 py-2.5"}
        ${isActive
                  ? "bg-[#1E3A5F] text-white"
                  : "text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-800 dark:hover:text-gray-100"
                }
      `}
            >
              <span>{icon}</span>

              {!minimized && (
                <span className="truncate">{label}</span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-gray-200 dark:border-slate-700 p-2  ">
          <button
            onClick={logout}
            title="Log out"
            className={`flex items-center gap-3 w-full rounded text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-150
              ${minimized ? "justify-center px-0 py-2.5" : "px-3 py-2.5"}`}
          >
            <MdLogout size={18} />
            {!minimized && <span className="whitespace-nowrap">Log Out</span>}
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">

        {/* Top bar */}
        <header className="  bg-white dark:bg-slate-800 border-b-2 border-gray-100 dark:border-slate-700 px-5 h-14 flex items-center gap-3"
          style={{ borderBottomColor: undefined }}
        >
          <button
            className="lg:hidden p-1.5 rounded border border-gray-200 dark:border-slate-600 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors mr-1"
            onClick={() => setMobileOpen(o => !o)}
            aria-label="Open menu"
          >
            <FaBars size={15} />
          </button>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 leading-none">{activeMenu}</p>
            <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-0.5 leading-none">Pixel & Pen — Admin</p>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="p-5 sm:p-7">
            <Outlet
              context={{
                userData,
                statsData,
                articleRequests,
                contributorRequests,
              }}
            />
          </div>
        </main>

      </div>
    </div>
  );
};

export default AdminDashboard;