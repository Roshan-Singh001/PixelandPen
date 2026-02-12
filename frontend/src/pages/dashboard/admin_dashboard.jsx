import React, { useState, useEffect } from "react";

import { 
  UserCheck,
  ShieldCheck,
  LayoutDashboard, 
  FileText, 
  MessageCircle, 
  BarChart3, 
  UserCog, 
  Settings, 
  Plus, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  Users,
  Eye,
  Heart,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Megaphone,
  Sparkles,
  Wrench
} from 'lucide-react';
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
  FaCheckCircle,
  FaTimesCircle,
  FaUserPlus,
  FaBars,
} from "react-icons/fa";
import { BiComment, BiSolidDashboard } from "react-icons/bi";
import { MdArticle, MdAnalytics, MdLogout } from "react-icons/md";
import { IoPersonAdd, IoSettingsSharp } from "react-icons/io5";
import { FaAnglesRight } from "react-icons/fa6";
import { FaAnglesLeft } from "react-icons/fa6";
import { GrAnnounce } from "react-icons/gr";

import ArticleRequests from "./admin_components/ArticleRequests";
import ContriRequest from "./admin_components/ContriRequest";
import SiteAnalytics from "./admin_components/SiteAnalytics";
import AdminSettings from "./admin_components/AdminSettings";
import Announcements from "./admin_components/Annoucements";
import CommentsManage from "./admin_components/CommentsManage";
import { useAuth } from "../../contexts/AuthContext";
import { ThemeProvider } from "../../contexts/ThemeContext";
import PixelPenLoader from "../../components/PixelPenLoader";

const AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30000,
  headers: { "X-Custom-Header": "foobar" },
  withCredentials: true,
});

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuMinimize, setMenuMinimize] = useState(false);
  const [menuOption, setMenuOption] = useState("Dashboard");
  const { loggedIn, logout, userData, loading } = useAuth();
  const [statsData, setStatsData] = useState([]);
  const [articleRequests, setArticleRequests] = useState([]);
  const [contributorRequests, setContributorRequests] = useState([]);

  useEffect(() => {
    const fetchStats = async()=>{
    try {
      const response1 = await AxiosInstance.get('/dashboard/admin/stat/posts');
      setStatsData((prev)=>([...prev, {title: "Total Posts", value: response1.data.total_p || 0, color: "blue", icon: FileText} ]))

      const response2 = await AxiosInstance.get('/dashboard/admin/stat/views');
      setStatsData((prev)=>([...prev, {title: "Total Views", value: response2.data.total_v || 0, color: "green", icon: Eye} ]))

      const response3 = await AxiosInstance.get('/dashboard/admin/stat/contributors');
      setStatsData((prev)=>([...prev, {title: "Total Contributors", value: response3.data.total_c || 0, color: "red", icon: UserCheck} ]));

      const response4 = await AxiosInstance.get('/dashboard/admin/stat/readers');
      setStatsData((prev)=>([...prev, {title: "Total Readers", value: response4.data.total_r || 0, color: "purple", icon: Users } ]))

      console.log(statsData);
    } catch (error) {
      console.log(error);
      
    }
  }

  const fetchRecent = async ()=>{
    try {
      const response = await AxiosInstance.get('/dashboard/admin/recent/article');
      setArticleRequests(response.data.recents);

      const response1 = await AxiosInstance.get('/dashboard/admin/recent/contributor');
      setContributorRequests(response1.data.recents);
    } catch (error) {
      console.log(error); 
    }

  }

  fetchStats();
  fetchRecent();

  }, [])

  const getStatusColor = (status) => {
      switch (status.toLowerCase()) {
        case 'approved': return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
        case 'pending': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20';
        case 'rejected': return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
        default: return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20';
      }
    };
  
    const getStatusIcon = (status) => {
      switch (status.toLowerCase()) {
        case 'approved': return CheckCircle;
        case 'pending': return Clock;
        case 'rejected': return XCircle;
        default: return FileText;
      }
    };

  if (loading) return <PixelPenLoader/>
  if (!loggedIn) return navigate("/login");

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-300">
      <button className="fixed top-4 left-4 sm:hidden text-2xl text-indigo-600 dark:text-indigo-400 z-[60]"
              onClick={() => setMenuOpen(!menuOpen)}
              >
              <FaBars />
      </button>
      

    {menuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 sm:hidden"
          onClick={() => setMenuOpen(false)}
          ></div>
    )}
      {/* Sidebar */}
      <aside
        className={`
          h-screen py-6 m-0 transition-all duration-300 ease-in-out bg-white dark:bg-gray-800
          fixed top-0 left-0 z-50
          ${menuOpen ? 'translate-x-0' : '-translate-x-full'}
          ${menuOpen ? '' : 'w-0 overflow-hidden'}
          sm:static sm:translate-x-0 sm:z-auto
          ${menuMinimize ? 'sm:w-[4.6rem]' : 'sm:w-64'}
          
        `}
      >
        <div className="flex justify-evenly gap-2">
          {menuMinimize == false && (
            <h2 className="inline text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              Admin Panel
            </h2>
          )}
          {menuMinimize ? (
            <button
              onClick={(e) => setMenuMinimize(false)}
              className="p-2 rounded-full max-[700px]:hidden hover:bg-indigo-100 dark:hover:bg-indigo-600"
            >
              <FaAnglesRight size={20} className="text-black dark:text-white" />
            </button>
          ) : (
            <button
              onClick={(e) => setMenuMinimize(true)}
              className="p-2 rounded-full max-[700px]:hidden hover:bg-indigo-100 dark:hover:bg-indigo-600"
            >
              <FaAnglesLeft size={20} className="text-black dark:text-white" />
            </button>
          )}
        </div>
        <nav className="flex flex-col mt-4">
          {[
            { label: "Dashboard", icon: <BiSolidDashboard size={25} /> },
            { label: "Article", icon: <MdArticle size={25} /> },
            { label: "Contributor", icon: <IoPersonAdd size={25} /> },
            { label: "Announcements", icon: <GrAnnounce size={25} /> },
            { label: "Comments", icon: <BiComment size={25} /> },
            { label: "Analytics", icon: <MdAnalytics size={25} /> },
            { label: "Settings", icon: <IoSettingsSharp size={25} /> },
          ].map(({ label, icon }) => (
            <button
              title={label}
              key={label}
              onClick={() => setMenuOption(label)}
              className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-colors ${
                menuOption === label
                  ? "bg-indigo-100 dark:bg-indigo-600 text-indigo-700 dark:text-white font-semibold"
                  : "hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              {icon}
              {menuMinimize == false && <span className="max-[700px]:hidden">{label}</span>}
            </button>
          ))}
          <button
            onClick={logout}
            title="Log out"
            className="flex items-center gap-3 px-4 py-3 mx-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-600 text-red-600 dark:text-red-300"
          >
            <MdLogout size={25} />
            {menuMinimize == false && <span>Log Out</span>}
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 px-5 py-2 h-screen overflow-y-auto">
        <div className="min-[700px]:hidden flex justify-center mb-4">
          <h2 className="inline text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              Admin Panel
          </h2>
        </div>
        

        {menuOption === "Dashboard" && (
          <div>
            <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl p-8 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">
                  Welcome back, {userData.userName}! 👋
                </h1>
                <p className="text-blue-100 text-lg">
                Monitor, manage, and lead your platform with confidence.
                </p>
              </div>
              <div className="hidden md:block">
                <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <ShieldCheck className="w-16 h-16 text-white" />
                </div>
              </div>
            </div>
          </div>

            {/* Analytics */}
            <section className="mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsData.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg bg-${stat.color}-100 dark:bg-${stat.color}-900/20`}>
                      <Icon className={`w-6 h-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                    </div>
                  </div>
                  <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-2">
                    {stat.title}
                  </h3>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
              );
            })}
          </div>
            </section>

            {/* Article Requests */}
            <section className="my-5">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    Recent Articles
                  </h2>
                </div>
                <div className="p-6 space-y-4">
                  {articleRequests.length >0? articleRequests.map((article) => {
                    const StatusIcon = getStatusIcon(article.status);
                    return (
                      <div
                        key={article.slug}
                        className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-1">
                            {article.title}
                          </h3>
                          <p className="text-gray-500 dark:text-gray-400 text-sm">
                            by {article.author}
                          </p>
                        </div>
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(article.status)}`}>
                          <StatusIcon className="w-4 h-4" />
                          {article.status.charAt(0).toUpperCase() + article.status.slice(1)}
                        </div>
                      </div>
                    );
                  }):<><div className="text-center py-12">
                          <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                              <XCircle className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                          </div>
                          <p className="text-gray-500 dark:text-gray-400 text-lg">No Articles</p>
                        </div></>}
                </div>
              </div>
            </section>

            {/* Contributor Requests */}
            <section className="my-5">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    Recent Contributors
                  </h2>
                </div>
                <div className="p-6 space-y-4">
                  {contributorRequests.length?contributorRequests.map((cont) => {
                    const StatusIcon = getStatusIcon(cont.status);
                    return (
                      <div
                        key={cont.cont_id}
                        className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-1">
                            {cont.username}
                          </h3>
                          <p className="text-gray-500 dark:text-gray-400 text-sm">
                            {cont.email}
                          </p>
                        </div>
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(cont.status)}`}>
                          <StatusIcon className="w-4 h-4" />
                          {cont.status.charAt(0).toUpperCase() + cont.status.slice(1)}
                        </div>
                      </div>
                    );
                  }): <><div className="text-center py-12">
                          <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                            <XCircle className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                          </div>
                          <p className="text-gray-500 dark:text-gray-400 text-lg">No Contributors</p>
                        </div></>}
                </div>
              </div>
            </section>

          </div>
        )}

        {menuOption === "Article" && <ArticleRequests />}
        {menuOption === "Contributor" && <ContriRequest />}
        {menuOption === "Announcements" && <Announcements />}
        {menuOption === "Comments" && <CommentsManage />}
        {menuOption === "Analytics" && <SiteAnalytics />}
        {menuOption === "Settings" && (
          <ThemeProvider>
            <AdminSettings />
          </ThemeProvider>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
