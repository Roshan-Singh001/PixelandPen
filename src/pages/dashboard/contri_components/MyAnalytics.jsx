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
      
      const categoryData = [
        { name: 'AI', value: 400 },
        { name: 'Cloud', value: 300 },
        { name: 'Cybersecurity', value: 300 },
        { name: 'IoT', value: 200 },
      ];
      
      const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7f7f'];
      
      const topContributors = [
        { name: 'Suraj', articles: 10 },
        { name: 'Roshan', articles: 8 },
        { name: 'Javed', articles: 6 },
        { name: 'BCD', articles: 5 },
      ];

  return (
    <>
      <h1 className="text-3xl font-bold text-indigo-500 dark:text-indigo-400 mb-6">Site Analytics</h1>

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
          <p className="text-gray-500 dark:text-gray-300">Total Contributors</p>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">18</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow text-center">
          <p className="text-gray-500 dark:text-gray-300">Total Subscribers</p>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">708</p>
        </div>
      </div>

      {/* Charts Section */}
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

        {/* Pie Chart */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200">Views by Category</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart for Top Contributors */}
        <div className="col-span-1 lg:col-span-2 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200">Top Contributors</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topContributors}>
              <XAxis dataKey="name" stroke="#82ca9d" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="articles" fill="#82ca9d" barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
};

export default MyAnalytics;
