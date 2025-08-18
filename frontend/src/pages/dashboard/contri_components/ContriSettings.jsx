import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Switch } from '@headlessui/react';
import { useAuth } from "../../../contexts/AuthContext";
import { useTheme } from '../../../contexts/ThemeContext';
import PixelPenLoaderSmall from '../../../components/PixelPenLoaderSmall';

const AxiosInstance = axios.create({
  baseURL: "http://localhost:3000/",
  timeout: 30000,
  headers: { "X-Custom-Header": "foobar" },
  withCredentials: true,
});

const ContriSettings = () => {
  const { isDarkMode, toggleDark } = useTheme();
  const { setLoggedIn, userData} = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);

  const handle_delete_account = async()=>{
    setIsDeleting(true);
    try {
        const response = await AxiosInstance.get('/dashboard/contri/delete', {
           headers: {
              user_id: userData.user_id,
              username: userData.userName,
           }
        });
        console.log(response.data);
        setLoggedIn(false);
    } 
    catch (error) {
      console.log(error);      
    }
  setIsDeleting(false);
  }

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
            checked={isDarkMode}
            onChange={toggleDark}
            className={`${
              isDarkMode ? 'bg-indigo-600' : 'bg-gray-300'
            } relative inline-flex items-center h-6 rounded-full w-11`}
          >
            <span className="sr-only">Toggle Dark Mode</span>
            <span
              className={`${
                isDarkMode ? 'translate-x-6' : 'translate-x-1'
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

        <button onClick={handle_delete_account} className='px-4 py-2 relative left-[40%] bg-red-600 hover:bg-red-700 text-white rounded shadow'>
          {isDeleting? <PixelPenLoaderSmall/>:<> 
                    <span>Delete Account</span> 
          </>}
          
          </button>

      </div>
    </>
  );
};

export default ContriSettings;
