import React, { useState, useEffect } from "react";

import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";

import {
  FileText,
  Users,
  Eye,
  Heart,
} from 'lucide-react';
import AxiosInstance from "../../api/axiosInstance";

import {
  FaBars,
  FaComments,
  FaUserCog,
} from "react-icons/fa";
import { BiSolidDashboard } from "react-icons/bi";
import { MdArticle, MdAnalytics, MdLogout } from "react-icons/md";
import { IoPersonAdd, IoSettingsSharp } from "react-icons/io5";
import { FaAnglesRight } from "react-icons/fa6";
import { FaAnglesLeft } from "react-icons/fa6";
import { IoIosAddCircle } from "react-icons/io";

import PixelPenLoader from "../../components/PixelPenLoader";
import { useAuth } from "../../contexts/AuthContext";



const ContributorDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loggedIn, logout, userData, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [isAccepted, setAccecpted] = useState(false);
  const [isBlock, setBlock] = useState(false);
  const [status, setStatus] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [isRender, setIsRender] = useState(1);
  const [statsData, setStatsData] = useState([]);

  const [recentArticles, setRecentArticles] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    document.title = 'Contributor · Pixel & Pen';
  }, []);

  const NAV_ITEMS = [
    {
      label: "Dashboard",
      path: "",
      icon: <BiSolidDashboard size={18} />,
      status: true,
      external: false,
    },
    {
      label: "Profile",
      path: "profile",
      icon: <FaUserCog size={18} />,
      status: true,
      external: false,
    },
    {
      label: "Article",
      path: "article",
      icon: <MdArticle size={18} />,
      status: isAccepted,
      external: false,
    },
    {
      label: "Comments",
      path: "comments",
      icon: <FaComments size={18} />,
      status: isAccepted,
      external: false,
    },
    {
      label: "Stats",
      path: "stats",
      icon: <MdAnalytics size={18} />,
      status: isAccepted,
      external: false,
    },
    {
      label: "Settings",
      path: "settings",
      icon: <IoSettingsSharp size={18} />,
      status: true,
      external: false,
    },
    {
      label: "Article Editor",
      path: "article/editor",
      icon: <IoIosAddCircle size={18} />,
      status: isAccepted && !isBlock,
      external: true,
    },
  ];

  const activeItem = NAV_ITEMS.find(({ path }) => {
    if (path === "") {
      return location.pathname === "/dashboard/contributor";
    }

    return location.pathname === `/dashboard/contributor/${path}`;
  });

  const activeMenu = activeItem?.label || "Dashboard";

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await AxiosInstance.get('/dashboard/contri/status');

        const status = response.data[0].status;
        const reject = response.data[0].reject_reason ? response.data[0].reject_reason : '';

        setStatus(status);
        setRejectReason(reject);

        if (status == 'Approved') {
          setAccecpted(true);
          setBlock(false);
        }
        else if (status == 'Block') {
          setBlock(true);
          setAccecpted(true);
        }


        const response1 = await AxiosInstance.get('/dashboard/contri/stat/posts');
        setStatsData((prev) => ([...prev, { title: "Total Posts", value: response1.data.total_p || 0, color: "blue", icon: FileText }]));

        const response2 = await AxiosInstance.get('/dashboard/contri/stat/views');
        setStatsData((prev) => ([...prev, { title: "Total Views", value: response2.data.total_v || 0, color: "green", icon: Eye }]))

        const response3 = await AxiosInstance.get('/dashboard/contri/stat/likes');
        setStatsData((prev) => ([...prev, { title: "Total Likes", value: response3.data.total_l || 0, color: "red", icon: Heart }]));

        const response4 = await AxiosInstance.get('/dashboard/contri/stat/followers');
        setStatsData((prev) => ([...prev, { title: "Followers", value: response4.data.total_f || 0, color: "purple", icon: Users }]));

      } catch (error) {
        console.log(error);

      }
    }

    const fetchRecent = async () => {
      try {
        const response = await AxiosInstance.get('/dashboard/contri/recent');
        setRecentArticles(response.data.recents);

        const response1 = await AxiosInstance.get('/dashboard/contri/announcements');
        setAnnouncements(response1.data.announce);

      } catch (error) {
        console.log(error);
      }

    }
    fetchStats();
    fetchRecent();

  }, [isRender]);


  if (loading) return <PixelPenLoader />

  if (!loggedIn) return navigate("/login");

  return (
    <div className="font-[Inter,system-ui,sans-serif] flex h-screen overflow-hidden bg-[#FAFAF8] dark:bg-slate-900 text-gray-800 dark:text-gray-100 antialiased">

      {/* Mobile Sidebar Backdrop*/}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        ></div>
      )}

      {/* Sidebar */}

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
              Contributor Panel
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
          {NAV_ITEMS.map(({ label, path, icon, status, external }) => (
            <NavLink
              key={label}
              to={path}
              end={path === ""}
              disabled={!status}
              target={path === "/article/editor" ? "_blank" : undefined}
              rel={path === "/article/editor" ? "noopener noreferrer" : undefined}
              onClick={(e) => {
                if (!status) {
                  e.preventDefault();
                  return;
                }
                setMobileOpen(false)
              }}
              className={({ isActive }) => `
                flex items-center gap-3 mx-2 rounded transition-colors duration-150 text-sm font-medium whitespace-nowrap overflow-hidden
                ${!status ? "opacity-40 cursor-not-allowed" : ""}
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
            <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-0.5 leading-none">Pixel & Pen — Contributor</p>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="p-5 sm:p-7">
            <Outlet
              context={{
                userData,
                statsData,
                recentArticles,
                announcements,
                status,
                rejectReason,
              }}
            />
          </div>
        </main>

      </div>
    </div>
  );
}

export default ContributorDashboard;