import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';



const MyAnalytics = () => {
    const trafficData = [
        { month: 'Jan', views: 400 },
        { month: 'Feb', views: 800 },
        { month: 'Mar', views: 650 },
        { month: 'Apr', views: 900 },
        { month: 'May', views: 1100 },
      ];

  return (
    <>
      <h1 className="text-3xl font-bold text-indigo-500 dark:text-indigo-400 mb-6">Stats</h1>

      {/* Summary Cards */}
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
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Line Chart */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200">Monthly Views</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trafficData}>
              <XAxis dataKey="month" stroke="#8884d8" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="views" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
      </div>
    </>
  );
};

export default MyAnalytics;
