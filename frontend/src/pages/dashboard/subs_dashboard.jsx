import React, { useState, useEffect } from "react";

import { LayoutDashboard, FileText, MessageCircle, BarChart3, UserCog, Settings, Plus, LogOut, ChevronLeft,
  ChevronRight,
  Menu,
  Ban,
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
import { FaBookBookmark } from "react-icons/fa6";
import { FaBookReader } from "react-icons/fa";

import Grainient from "../../components/Grainient";
import PixelPenLoader from "../../components/PixelPenLoader";
import Likes from "./subs_components/Likes";
import Bookmarks from "./subs_components/Bookmarks";
import Comments from "./subs_components/comments";
import SubsProfile from "./subs_components/SubsProfile";
import SubsSettings from "./subs_components/SubsSettings";

import { useAuth } from "../../contexts/AuthContext";
import { ThemeProvider } from "../../contexts/ThemeContext";

const AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30000,
  headers: { "X-Custom-Header": "foobar" },
  withCredentials: true,
});

const ReaderDashboard = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const { loggedIn, logout, userData, loading } = useAuth();
  const [menuMinimize, setMenuMinimize] = useState(false);
  const [menuOption, setMenuOption] = useState("Dashboard");
  const [isAccepted, setAccecpted] = useState(false);
  const [isBlock, setBlock] = useState(false);
  const [status, setStatus] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [isRender, setIsRender] = useState(1);
  const [refSlug, setRefslug] = useState("");
  const [statsData,setStatsData] = useState([]);

  const [recentArticles, setRecentArticles] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    const fetchStats = async()=>{
    try {
      const response = await AxiosInstance.get('/dashboard/contri/status', {
        headers: {
          user_id: userData.user_id,
        }
      });

      const status = response.data[0].status;
      const reject = response.data[0].reject_reason?response.data[0].reject_reason:'';

      setStatus(status);
      setRejectReason(reject);

      if (status == 'Approved') {
        setAccecpted(true);
        setBlock(false);
      }
      else if(status == 'Block'){
        setBlock(true);
        setAccecpted(true);
      } 
      
      
      const response1 = await AxiosInstance.get('/dashboard/contri/stat/posts', {
        headers: {
          user_id: userData.user_id,
        }
      });
      setStatsData((prev)=>([...prev, {title: "Total Posts", value: response1.data.total_p || 0, color: "blue", icon: FileText} ]));

      const response2 = await AxiosInstance.get('/dashboard/contri/stat/views', {
        headers: {
          user_id: userData.user_id,
        }
      });
      setStatsData((prev)=>([...prev, {title: "Total Views", value: response2.data.total_v || 0, color: "green", icon: Eye} ]))

      const response3 = await AxiosInstance.get('/dashboard/contri/stat/likes', {
        headers: {
          user_id: userData.user_id,
        }
      });

      setStatsData((prev)=>([...prev, {title: "Total Likes", value: response3.data.total_l || 0, color: "red", icon: Heart} ]));

      const response4 = await AxiosInstance.get('/dashboard/contri/stat/followers', {
        headers: {
          user_id: userData.user_id,
        }
      });
      setStatsData((prev)=>([...prev, {title: "Followers", value: response4.data.total_f || 0, color: "purple", icon: Users} ]));
    } catch (error) {
      console.log(error);
      
    }
  }

  const fetchRecent = async ()=>{
    try {
      const response = await AxiosInstance.get('/dashboard/contri/recent', {
        headers: {
          user_id: userData.user_id,
        }
      });
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

  const handleReject = async()=>{
    try {
      await AxiosInstance.post('/dashboard/contri/resend',{
        cont_id: userData.user_id,
      });
      setIsRender(isRender+1);
      
    } catch (error) {
      console.log(error);
      
    }
  }

  if (loading) return <PixelPenLoader/>

  if (!loggedIn) return navigate("/login");

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
        Reader Panel
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
      { label: "Dashboard", icon: <BiSolidDashboard size={25} />},
      { label: "Likes", icon: <MdArticle size={25} />},
      { label: "Comments", icon: <FaComments size={25} />},
      { label: "Bookmarks", icon: <FaBookBookmark  size={25} />},
      { label: "Profile", icon: <FaUserCog size={25} />},
      { label: "Settings", icon: <IoSettingsSharp size={25} />},
    ].map(({ label, icon}) => (
      <button
        title={label}
        key={label}
        onClick={() => setMenuOption(label)}
        className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-colors disabled:opacity-50 ${
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
          <div className="relative overflow-hidden rounded-2xl  text-white shadow-xl">
            <div style={{ width: '100%', height: '60vh', position: 'absolute' }}>
            <Grainient
              color1="#0080ff"
              color2="#5227FF"
              color3="#B19EEF"
              timeSpeed={0.8}
              colorBalance={0}
              warpStrength={1}
              warpFrequency={5}
              warpSpeed={2}
              warpAmplitude={50}
              blendAngle={0}
              blendSoftness={0.05}
              rotationAmount={500}
              noiseScale={2}
              grainAmount={0.1}
              grainScale={2}
              grainAnimated={false}
              contrast={1.5}
              gamma={1}
              saturation={1}
              centerX={0}
              centerY={0}
              zoom={0.9}
            />
          </div>
            <div className="relative z-10 p-8 flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">
                  Welcome back, {userData.userName}! 👋
                </h1>
                <p className="text-blue-100 text-lg">
                  Ready to read amazing content today?
                </p>
              </div>
              <div className="hidden md:block">
                <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <FaBookReader className="w-16 h-16 text-white" />
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
              {recentArticles.length > 0 ? (recentArticles.map((article) => {
                return (
                  <div
                    key={article.title}
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-1">
                        {article.title}
                      </h3>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium `}>
                      {article}
                    </div>
                  </div>
                );
              })): (
              <>
                <div className="text-center py-12">
                  <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                    <XCircle className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-lg">No Articles Read</p>
                </div>
              
              </>)}
            </div>
          </div>
        </div>
        )}

        {menuOption === "Likes" && <Likes />}
        {menuOption === "Comments" && <Comments />}
        {menuOption === "Bookmarks" && <Bookmarks />}
        {menuOption === "Stats" && <Bookmarks />}
        {menuOption === "Profile" && <SubsProfile userdata={userData} />}
        {menuOption === "Settings" && (
          <ThemeProvider>
            <SubsSettings />
          </ThemeProvider>
        )}
      </main>
    </div>
  );
}

export default ReaderDashboard;