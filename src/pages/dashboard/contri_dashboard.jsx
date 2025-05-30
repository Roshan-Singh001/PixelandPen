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
} from "react-icons/fa";
import { BiSolidDashboard } from "react-icons/bi";
import { MdArticle, MdAnalytics, MdLogout } from "react-icons/md";
import { IoPersonAdd, IoSettingsSharp } from "react-icons/io5";
import { FaAnglesRight } from "react-icons/fa6";
import { FaAnglesLeft } from "react-icons/fa6";

import MyArticles from "./contri_components/MyArticles";
import MyComments from "./contri_components/MyComments";
import MyAnalytics from "./contri_components/MyAnalytics";
import ContriSettings from "./contri_components/ContriSettings";
import { useAuth } from "../../contexts/AuthContext";
import { ThemeProvider } from "../../contexts/ThemeContext";

const ContributorDashboard = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuMinimize, setMenuMinimize] = useState(false);
  const [menuOption, setMenuOption] = useState("Dashboard");
  const [isAccepted, setAccecpted] = useState(false);

  const [userData, setUserData] = useState({});
  const { loggedIn, logout } = useAuth();
  const AxiosInstance = axios.create({
    baseURL: "http://localhost:3000/",
    timeout: 30000,
    headers: { "X-Custom-Header": "foobar" },
    withCredentials: true,
  });

  if (!loggedIn) return navigate("/login");

  const fetchUserData = async () => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      console.error("No token found");
      return;
    }

    try {
      const response = await AxiosInstance.get("/auth/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const { username, role } = response.data;
      setUserData({ userName: username, userRole: role });
      if (role != "Contributor") {
        navigate("/");
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const trafficData = [
    { month: "Jan", views: 400 },
    { month: "Feb", views: 800 },
    { month: "Mar", views: 650 },
    { month: "Apr", views: 900 },
    { month: "May", views: 1100 },
  ];

  const articleRequests = [
    { id: 1, title: "AI/ML", author: "Suraj Singh Bhoj" },
    { id: 2, title: "Cloud Computing", author: "Md Javed" },
  ];

  const contributorRequests = [
    { id: 1, name: "ABC", email: "abc@example.com" },
    { id: 2, name: "DEF", email: "def@example.com" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-300">
      {/* Sidebar */}
      <aside
        className={`${
          menuMinimize ? "" : "w-64"
        } bg-white dark:bg-gray-800 shadow-md py-6 space-y-6 ${
          menuOpen ? "block" : "hidden"
        } sm:block`}
      >
        <div className="flex justify-evenly gap-2">
          {menuMinimize == false && (
            <h2 className="inline text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              Contributor Panel
            </h2>
          )}
          {menuMinimize ? (
            <button
              onClick={(e) => setMenuMinimize(false)}
              className="p-2 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-600"
            >
              <FaAnglesRight size={20} className="text-black dark:text-white" />
            </button>
          ) : (
            <button
              onClick={(e) => setMenuMinimize(true)}
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
      <main className="flex-1 p-6">
        <button
          className="sm:hidden text-2xl mb-4 text-indigo-600 dark:text-indigo-400"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <FaBars />
        </button>

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
              <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-6 text-center text-gray-600 dark:text-gray-300">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                  <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200">
                    Monthly Views
                  </h2>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={trafficData}>
                      <XAxis dataKey="month" stroke="#8884d8" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="views"
                        stroke="#8884d8"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </section>

            {/* Article Requests */}
            <section className="my-5">
              <h2 className="text-2xl font-semibold mb-4">
                Pending Article Approvals
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
                        <FaCheckCircle size={20} />
                      </button>
                      <button className="text-red-500 hover:text-red-600">
                        <FaTimesCircle size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Contributor Requests */}
            <section className="mb-1">
              <h2 className="text-2xl font-semibold mb-4">
                Contributor Access Requests
              </h2>
              <div className="space-y-4">
                {contributorRequests.map((user) => (
                  <div
                    key={user.id}
                    className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow flex justify-between items-center"
                  >
                    <div>
                      <h3 className="font-bold text-lg">{user.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {user.email}
                      </p>
                    </div>
                    <div className="flex space-x-4">
                      <button className="text-green-500 hover:text-green-600">
                        <FaUserPlus size={20} />
                      </button>
                      <button className="text-red-500 hover:text-red-600">
                        <FaTimesCircle size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {menuOption === "My Articles" && <MyArticles />}
        {menuOption === "Comments" && <MyComments />}
        {menuOption === "My Stats" && <MyAnalytics />}
        {menuOption === "Settings" && (
          <ThemeProvider>
            <ContriSettings />
          </ThemeProvider>
        )}
      </main>
    </div>
  );
}

export default ContributorDashboard;