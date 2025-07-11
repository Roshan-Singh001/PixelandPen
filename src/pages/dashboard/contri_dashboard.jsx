import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
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

const ContributorDashboard = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuMinimize, setMenuMinimize] = useState(false);
  const [menuOption, setMenuOption] = useState("Dashboard");
  const [isAccepted, setAccecpted] = useState(false);
  const [refSlug, setRefslug] = useState("")

  const { loggedIn, logout, userData, loading } = useAuth();
  const AxiosInstance = axios.create({
    baseURL: "http://localhost:3000/",
    timeout: 30000,
    headers: { "X-Custom-Header": "foobar" },
    withCredentials: true,
  });

  if (loading) return <PixelPenLoader/>

  if (!loggedIn) return navigate("/login");

  const articleRequests = [
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
      <main className="flex-1 px-5 py-2 overflow-y-auto">

        {menuOption === "Dashboard" && (
          <div>
            <h1 className="text-3xl font-bold text-sky-600 dark:text-sky-400 mb-6">
              Dashboard
            </h1>
            <div className=" mt-10 mb-5 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg flex flex-col items-center text-center transition duration-300 ease-in-out">
              <h1 className="text-3xl md:text-4xl font-bold text-sky-600 dark:text-sky-400 mb-4">
                Welcome to your dashboard, {userData.userName}. 👋
              </h1>
            </div>

            {/* Analytics */}
            <section>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow text-center">
          <p className="text-gray-500 dark:text-gray-300">Total Posts</p>
          <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">120</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow text-center">
          <p className="text-gray-500 dark:text-gray-300">Total Views</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">85,000</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow text-center">
          <p className="text-gray-500 dark:text-gray-300">Total Likes</p>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">18</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow text-center">
          <p className="text-gray-500 dark:text-gray-300">Total Followers</p>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">708</p>
        </div>
      </div>
            </section>

            {/* Article Requests */}
            <section className="my-5">
              <h2 className="text-2xl font-semibold mb-4">
                All Articles
              </h2>
              <div className="space-y-4">
                {articleRequests.map((article) => (
                  <div
                    key={article.id}
                    className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow flex justify-between items-center"
                  >
                    <div>
                      <h3 className="font-bold text-lg">{article.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        by {article.author}
                      </p>
                    </div>
                    <div className="flex space-x-4">
                      <button className="text-green-500 hover:text-green-600">
                        <div>Accepted</div>
                      </button>
                      <button className="text-red-500 hover:text-red-600">
                        <div>Rejected</div>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Announcements */}
<section className="mb-6">
  <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
    Announcements
  </h2>
  <div className="space-y-4">
    {/* Announcement Card */}
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-5 transition-all duration-300 hover:shadow-lg">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
        ✨ New Feature: Stats Dashboard!
      </h3>
      <p className="text-gray-700 dark:text-gray-300 mt-1">
        Track your post views, likes, and more in the new contributor stats dashboard. Go check it out now!
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
        Posted on May 28, 2025
      </p>
    </div>

    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-5 transition-all duration-300 hover:shadow-lg">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
        📢 Maintenance Notice
      </h3>
      <p className="text-gray-700 dark:text-gray-300 mt-1">
        The site will undergo maintenance on June 2nd, from 12:00 AM to 4:00 AM UTC. Expect temporary downtime.
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
        Posted on May 25, 2025
      </p>
    </div>
  </div>
</section>

          </div>
        )}

        {menuOption === "My Articles" && <MyArticles userdata={userData} setMenuOption={setMenuOption} setRefslug={setRefslug} />}
        {menuOption === "Comments" && <MyComments />}
        {menuOption === "My Stats" && <MyAnalytics />}
        {menuOption === "Profile" && <ContriProfile />}
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