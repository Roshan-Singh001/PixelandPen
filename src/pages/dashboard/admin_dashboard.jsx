import React, { useState } from 'react';
import { FaCheckCircle, FaTimesCircle, FaUserPlus, FaEdit, FaBars } from 'react-icons/fa';
import { BiSolidDashboard } from "react-icons/bi";
import { MdArticle } from "react-icons/md";
import { IoPersonAdd } from "react-icons/io5";
import { MdAnalytics } from "react-icons/md";
import { IoSettingsSharp } from "react-icons/io5";
import { MdLogout } from "react-icons/md";

const AdminDashboard = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuOption,setMenuOption] = useState("Dashboard");
  const changeMenuOption = (e)=>{
    var opt = e.target.value;
    setMenuOption(opt);
    console.log(opt)
  }

  // Article Requests
  const articleRequests = [
    { id: 1, title: 'AI/ML', author: 'Suraj Singh Bhoj' },
    { id: 2, title: 'Cloud Computing', author: 'Md Javed' },
  ];

  // Contributor Requests
  const contributorRequests = [
    { id: 1, name: 'ABC', email: 'abc@example.com' },
    { id: 2, name: 'ABC', email: 'abc@example.com' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
      {/* Sidebar */}
      <aside className={`w-64 bg-white dark:bg-gray-800 shadow-md py-6 space-y-6 ${menuOpen ? 'block' : 'hidden'} sm:block`}>
        <h2 className="text-2xl text-center font-bold text-indigo-600 dark:text-indigo-400">Admin Panel</h2>
        <nav className="flex flex-col justify-start mt-4">
          <button value={"Dashboard"} onClick={(e)=>{changeMenuOption(e)}} className={`flex items-center gap-2 px-2 py-4 m-0 ${(menuOption == "Dashboard")? "dark:bg-slate-500 font-semibold":"dark:hover:bg-slate-300"}  `}>
            <BiSolidDashboard size={25} />
            <span>Dashboard</span>
          </button>
          <button value={"Article"} onClick={(e)=>{changeMenuOption(e)}}  className={`flex items-center gap-2 px-2 py-4 ${(menuOption == "Article") && "dark:bg-slate-500 font-semibold"} dark:hover:bg-slate-700`}>
            <MdArticle size={25} />
            <span>Articles</span>
          </button>
          <button value={"Contributor"} onClick={(e)=>{changeMenuOption(e)}} className={`flex items-center gap-2 px-2 py-4 ${(menuOption == "Contributor") && "dark:bg-slate-500 font-semibold"} dark:hover:bg-slate-700`}>
            <IoPersonAdd size={25} />
            <span>Contributor</span>
          </button>
          <button value={"Analytics"} onClick={(e)=>{changeMenuOption(e)}} className={`flex items-center gap-2 px-2 py-4 ${(menuOption == "Analytics") && "dark:bg-slate-500 font-semibold"} dark:hover:bg-slate-700`}>
            <MdAnalytics size={25} />
            <span>Site Analytics</span>
          </button>
          <button value={"Settings"} onClick={(e)=>{changeMenuOption(e)}} className={`flex items-center gap-2 px-2 py-4 ${(menuOption == "Settings") && "dark:bg-slate-500 font-semibold"} dark:hover:bg-slate-700`}>
            <IoSettingsSharp size={25} />
            <span>Settings</span>
          </button>
          <button className="flex items-center gap-2 px-2 py-4  dark:hover:bg-slate-700">
            <MdLogout  size={25} />
            <span>Log Out</span>
          </button>
        </nav>
      </aside>

      <main className="flex-1 p-6">
        <button className="sm:hidden text-2xl mb-4 text-indigo-600 dark:text-indigo-400" onClick={() => setMenuOpen(!menuOpen)}>
          <FaBars />
        </button>
        {/* Dashboard */}
        {(menuOption == "Dashboard") && (<div>
        <div className='text-2xl text-sky-400 font-bold mb-4'>Dashboard</div>
        <section id="articles" className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Pending Article Approvals</h2>
          <div className="space-y-4">
            {articleRequests.map(article => (
              <div key={article.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow flex justify-between items-center">
                <div>
                  <h3 className="font-bold">{article.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">by {article.author}</p>
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

        <section id="contributors" className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Contributor Access Requests</h2>
          <div className="space-y-4">
            {contributorRequests.map(user => (
              <div key={user.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow flex justify-between items-center">
                <div>
                  <h3 className="font-bold">{user.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
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

        <section id="analytics" className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Site Analytics</h2>
          <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-6 text-center text-gray-500 dark:text-gray-300">
            Small Analytics dashboard
          </div>
        </section>
        </div>)}

        {/* Articles */}
        {(menuOption == "Article") && (<div>Articles</div>)}

        {/* Contributor */}
        {(menuOption == "Contributor") && (<div>Contributor</div>)}

        {/* Analytics */}
        {(menuOption == "Analytics") && (<div>Analytics</div>)}

        {/* Settings */}
        {(menuOption == "Settings") && (<div>Settings</div>)}

      </main>
    </div>
  );
};

export default AdminDashboard;
