import React, { useState } from 'react';
import { FaCheckCircle, FaTimesCircle, FaUserPlus, FaBars } from 'react-icons/fa';
import { BiSolidDashboard } from "react-icons/bi";
import { MdArticle, MdAnalytics, MdLogout } from "react-icons/md";
import { IoPersonAdd, IoSettingsSharp } from "react-icons/io5";

import ArticleRequests from './admin_components/ArticleRequests';
import ContriRequest from './admin_components/ContriRequest';
import SiteAnalytics from './admin_components/SiteAnalytics';
import AdminSettings from './admin_components/AdminSettings';

const AdminDashboard = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuOption, setMenuOption] = useState("Dashboard");

  const articleRequests = [
    { id: 1, title: 'AI/ML', author: 'Suraj Singh Bhoj' },
    { id: 2, title: 'Cloud Computing', author: 'Md Javed' },
  ];

  const contributorRequests = [
    { id: 1, name: 'ABC', email: 'abc@example.com' },
    { id: 2, name: 'DEF', email: 'def@example.com' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-300">
      {/* Sidebar */}
      <aside className={`w-64 bg-white dark:bg-gray-800 shadow-md py-6 space-y-6 ${menuOpen ? 'block' : 'hidden'} sm:block`}>
        <h2 className="text-2xl text-center font-bold text-indigo-600 dark:text-indigo-400">Admin Panel</h2>
        <nav className="flex flex-col mt-4">
          {[
            { label: "Dashboard", icon: <BiSolidDashboard size={25} /> },
            { label: "Article", icon: <MdArticle size={25} /> },
            { label: "Contributor", icon: <IoPersonAdd size={25} /> },
            { label: "Analytics", icon: <MdAnalytics size={25} /> },
            { label: "Settings", icon: <IoSettingsSharp size={25} /> },
          ].map(({ label, icon }) => (
            <button
              key={label}
              onClick={() => setMenuOption(label)}
              className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-colors ${
                menuOption === label
                  ? "bg-indigo-100 dark:bg-indigo-600 text-indigo-700 dark:text-white font-semibold"
                  : "hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              {icon}
              <span>{label}</span>
            </button>
          ))}
          <button className="flex items-center gap-3 px-4 py-3 mx-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-600 text-red-600 dark:text-red-300">
            <MdLogout size={25} />
            <span>Log Out</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <button className="sm:hidden text-2xl mb-4 text-indigo-600 dark:text-indigo-400" onClick={() => setMenuOpen(!menuOpen)}>
          <FaBars />
        </button>

        {menuOption === "Dashboard" && (
          <div>
            <h1 className="text-3xl font-bold text-sky-600 dark:text-sky-400 mb-6">Dashboard</h1>

            {/* Article Requests */}
            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">Pending Article Approvals</h2>
              <div className="space-y-4">
                {articleRequests.map(article => (
                  <div key={article.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-lg">{article.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">by {article.author}</p>
                    </div>
                    <div className="flex space-x-4">
                      <button className="text-green-500 hover:text-green-600"><FaCheckCircle size={20} /></button>
                      <button className="text-red-500 hover:text-red-600"><FaTimesCircle size={20} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Contributor Requests */}
            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">Contributor Access Requests</h2>
              <div className="space-y-4">
                {contributorRequests.map(user => (
                  <div key={user.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-lg">{user.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                    </div>
                    <div className="flex space-x-4">
                      <button className="text-green-500 hover:text-green-600"><FaUserPlus size={20} /></button>
                      <button className="text-red-500 hover:text-red-600"><FaTimesCircle size={20} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Analytics */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Site Analytics</h2>
              <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-6 text-center text-gray-600 dark:text-gray-300">
                Small Analytics dashboard
              </div>
            </section>
          </div>
        )}

        
        {menuOption === "Article" && <ArticleRequests />}
        {menuOption === "Contributor" && <ContriRequest />}
        {menuOption === "Analytics" && <SiteAnalytics />}
        {menuOption === "Settings" && <AdminSettings />}
      </main>
    </div>
  );
};

export default AdminDashboard;
