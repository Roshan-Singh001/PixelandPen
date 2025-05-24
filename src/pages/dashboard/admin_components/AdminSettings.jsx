import React, { useState, useEffect } from 'react';
import { Switch } from '@headlessui/react';

const AdminSettings = () => {
  const [darkMode, setDarkMode] = useState(false);

  // Load theme on first render
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Apply theme on toggle
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  return (
    <>
      <h1 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-6">Admin Settings</h1>

      <div className="space-y-6">

        {/* Dark Mode Toggle */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Dark Mode</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Enable or disable dark mode</p>
          </div>
          <Switch
            checked={darkMode}
            onChange={setDarkMode}
            className={`${
              darkMode ? 'bg-indigo-600' : 'bg-gray-300'
            } relative inline-flex items-center h-6 rounded-full w-11`}
          >
            <span className="sr-only">Toggle Dark Mode</span>
            <span
              className={`${
                darkMode ? 'translate-x-6' : 'translate-x-1'
              } inline-block w-4 h-4 transform bg-white rounded-full transition`}
            />
          </Switch>
        </div>

        {/* Change Password */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Change Password</h2>
          <div className="space-y-4">
            <input
              type="password"
              placeholder="Current Password"
              className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            />
            <input
              type="password"
              placeholder="New Password"
              className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            />
            <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded shadow">
              Update Password
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminSettings;
