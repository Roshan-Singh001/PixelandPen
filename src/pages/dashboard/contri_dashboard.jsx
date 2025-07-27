import React, { useState, useEffect } from "react";

import { 
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
import MyArticles from "./contri_components/MyArticles";
import MyComments from "./contri_components/MyComments";
import MyAnalytics from "./contri_components/MyAnalytics";
import ContriSettings from "./contri_components/ContriSettings";
import ContriProfile from "./contri_components/ContriProfile";
import ArticleEditor from "./ArticleEditor";
import { useAuth } from "../../contexts/AuthContext";
import { ThemeProvider } from "../../contexts/ThemeContext";

const AxiosInstance = axios.create({
  baseURL: "http://localhost:3000/",
  timeout: 30000,
  headers: { "X-Custom-Header": "foobar" },
  withCredentials: true,
});

const ContributorDashboard = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const { loggedIn, logout, userData, loading } = useAuth();
  const [menuMinimize, setMenuMinimize] = useState(false);
  const [menuOption, setMenuOption] = useState("Dashboard");
  const [isAccepted, setAccecpted] = useState(false);
  const [refSlug, setRefslug] = useState("");
  const [statsData,setStatsData] = useState([]);

  // { title: "Total Posts", value: "120", color: "blue", icon: FileText },
  //   { title: "Total Views", value: "85,000", color: "green", icon: Eye },
  //   { title: "Total Likes", value: "1,834", color: "red", icon: Heart },
  //   { title: "Followers", value: "708", color: "purple", icon: Users },

  useEffect(() => {
    const fetchStats = async()=>{
    try {
      const response = await AxiosInstance.get('/dashboard/contri/stat/posts', {
        headers: {
          user_id: userData.user_id,
        }
      });

      setStatsData((prev)=>([...prev, {title: "Total Posts", value: response.data.total_p, color: "blue", icon: FileText} ]))
      console.log(statsData);
    } catch (error) {
      console.log(error);
      
    }
  }

  fetchStats();

  }, [])
  

  
  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
      case 'pending': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20';
      case 'rejected': return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return CheckCircle;
      case 'pending': return Clock;
      case 'rejected': return XCircle;
      default: return FileText;
    }
  };

  const announcements = [
    {
      id: 1,
      title: "New Feature: Stats Dashboard!",
      content: "Track your post views, likes, and more in the new contributor stats dashboard. Go check it out now!",
      date: "May 28, 2025",
      icon: Sparkles,
      type: "feature"
    },
    {
      id: 2,
      title: "Maintenance Notice",
      content: "The site will undergo maintenance on June 2nd, from 12:00 AM to 4:00 AM UTC. Expect temporary downtime.",
      date: "May 25, 2025",
      icon: Wrench,
      type: "maintenance"
    }
  ];

  

  


  if (loading) return <PixelPenLoader/>

  if (!loggedIn) return navigate("/login");

  const recentArticles = [
    { id: 1, title: "AI/ML", author: "Suraj Singh Bhoj" },
    { id: 2, title: "Cloud Computing", author: "Md Javed" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-300">
      <button
        className="fixed top-4 left-4 sm:hidden text-2xl text-indigo-600 dark:text-indigo-400 z-[60]"
        onClick={() => setMenuOpen(!menuOpen)}
        >
        <FaBars />
      </button>

      {/* Mobile Sidebar Backdrop (recommended) */}
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
        Contributor Panel
      </h2>
    )}
    {menuMinimize ? (
      <button
        onClick={() => setMenuMinimize(false)}
        className="p-2 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-600"
      >
        <FaAnglesRight size={20} className="text-black dark:text-white" />
      </button>
    ) : (
      <button
        onClick={() => setMenuMinimize(true)}
        className="p-2 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-600"
      >
        <FaAnglesLeft size={20} className="text-black dark:text-white" />
      </button>
    )}
  </div>
  <nav className="flex flex-col mt-4">
    {[
      { label: "Dashboard", icon: <BiSolidDashboard size={25} /> },
      { label: "My Articles", icon: <MdArticle size={25} /> },
      { label: "Comments", icon: <FaComments size={25} /> },
      { label: "My Stats", icon: <MdAnalytics size={25} /> },
      { label: "Profile", icon: <FaUserCog size={25} /> },
      { label: "Settings", icon: <IoSettingsSharp size={25} /> },
      { label: "Add Article", icon: <IoIosAddCircle size={25} /> },
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
        {menuMinimize == false && <span>{label}</span>}
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

        {menuOption === "Dashboard" && (
          <div className="space-y-8">
          {/* Welcome Section */}
          <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl p-8 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">
                  Welcome back, {userData.userName}! 👋
                </h1>
                <p className="text-blue-100 text-lg">
                  Ready to create amazing content today?
                </p>
              </div>
              <div className="hidden md:block">
                <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <TrendingUp className="w-16 h-16 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
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

          {/* Articles Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                Recent Articles
              </h2>
            </div>
            <div className="p-6 space-y-4">
              {recentArticles.map((article) => {
                const StatusIcon = getStatusIcon(article.status);
                return (
                  <div
                    key={article.id}
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
                      {/* {article.status + article.status.slice(1)} */}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Announcements */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Megaphone className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                Announcements
              </h2>
            </div>
            <div className="p-6 space-y-4">
              {announcements.map((announcement) => {
                const Icon = announcement.icon;
                return (
                  <div
                    key={announcement.id}
                    className="p-5 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg ${
                        announcement.type === 'feature' 
                          ? 'bg-blue-100 dark:bg-blue-900/20' 
                          : 'bg-orange-100 dark:bg-orange-900/20'
                      }`}>
                        <Icon className={`w-5 h-5 ${
                          announcement.type === 'feature'
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-orange-600 dark:text-orange-400'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">
                          {announcement.title}
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300 mb-3">
                          {announcement.content}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                          <Calendar className="w-4 h-4" />
                          Posted on {announcement.date}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        )}

        {menuOption === "My Articles" && <MyArticles userdata={userData} setMenuOption={setMenuOption} setRefslug={setRefslug} />}
        {menuOption === "Comments" && <MyComments />}
        {menuOption === "My Stats" && <MyAnalytics />}
        {menuOption === "Profile" && <ContriProfile userdata={userData} />}
        {menuOption === "Settings" && (
          <ThemeProvider>
            <ContriSettings />
          </ThemeProvider>
        )}
        {menuOption === "Add Article" && <ArticleEditor userdata={userData} refSlug={refSlug} />}
      </main>
    </div>
  );
}

export default ContributorDashboard;