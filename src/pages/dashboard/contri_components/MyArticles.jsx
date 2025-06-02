import React from 'react';
import { FaCheckCircle, FaTimesCircle, FaEye } from 'react-icons/fa';
import { MdPreview } from "react-icons/md";
import { MdDelete } from "react-icons/md";

const MyArticles = () => {
  const pendingArticles = [
    { id: 1, title: 'Edge Computing in 2025'},
    { id: 2, title: 'Data Lakes vs Data Warehouses'},
  ];

  const rejectedArticles = [
    { id: 3, title: 'Old Trends in AI',reason: 'Plagiarized content' },
  ];

  const approvedArticles = [
    { id: 4, title: 'The Future of Blockchain', category: 'DevOps',date: '2025-05-20' },
    { id: 5, title: 'AI in Healthcare',category:'AI/ML',date: '2025-05-18' },
  ];

  return (
    <>
      <h1 className="text-3xl font-bold text-sky-500 dark:text-sky-400 mb-6">Articles</h1>

      {/* Pending Articles */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">Pending Articles Approval</h2>
        <div className="space-y-4">
          {pendingArticles.length > 0 ? (
            pendingArticles.map((article) => (
              <div key={article.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">{article.title}</h3>
                </div>
                <div className="flex gap-3">
                  <button className='flex items-center gap-2'>
                    <MdPreview size={20} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No pending requests.</p>
          )}
        </div>
      </section>

      {/* Rejected Articles */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">Rejected Articles</h2>
        <div className="space-y-4">
          {rejectedArticles.length > 0 ? (
            rejectedArticles.map((article) => (
              <div key={article.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold">{article.title}</h3>
                <p className="text-sm text-red-400 mt-1">Reason: {article.reason}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No rejected articles.</p>
          )}
        </div>
      </section>

      {/* All Approved and Posted Articles */}
      <section>
        <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">All Approved Articles</h2>
        <div className="overflow-x-auto rounded-lg shadow">
          <table className="min-w-full bg-white dark:bg-gray-800 text-sm">
            <thead className="bg-gray-100 dark:bg-gray-700 text-left">
              <tr>
                <th className="p-3 font-semibold">Title</th>
                <th className="p-3 font-semibold">Category</th>
                <th className="p-3 font-semibold">Posted On</th>
                <th className="p-3 font-semibold">View</th>
                <th className="p-3 font-semibold"> </th>
              </tr>
            </thead>
            <tbody>
              {approvedArticles.length > 0 ? (
                approvedArticles.map((article) => (
                  <tr key={article.id} className="border-b dark:border-gray-700">
                    <td className="p-3">{article.title}</td>
                    <td className="p-3">{article.category}</td>
                    <td className="p-3">{article.date}</td>
                    <td className="flex p-3">
                      <button className="text-blue-500 hover:text-blue-600">
                        <FaEye size={20} />
                      </button>
                    </td>
                    <td className="p-3">
                      <button className="text-red-500 hover:text-red-600">
                        <MdDelete size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="p-3 text-center text-gray-500 dark:text-gray-400">
                    No articles have been posted yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
};

export default MyArticles;
