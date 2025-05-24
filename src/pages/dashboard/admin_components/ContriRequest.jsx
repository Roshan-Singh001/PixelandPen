import React from 'react';
import { FaUserPlus, FaTimesCircle, FaCheckCircle, FaEye } from 'react-icons/fa';
import { MdBlock } from "react-icons/md";
import { CgUnblock } from "react-icons/cg";

const ContriRequest = () => {
  const pendingContributors = [
    { id: 1, name: 'Roshan Singh', email: 'roshan@example.com' },
    { id: 2, name: 'Suraj', email: 'suraj@example.com' },
  ];

  const approvedContributors = [
    { id: 3, name: 'ABC', email: 'abc@example.com', joined: '2025-04-10', articles: 45},
    { id: 4, name: 'ZCV', email: 'acv@example.com', joined: '2025-03-21', articles: 67 },
  ];

  const rejectedContributors = [
    { id: 5, name: 'DOL', email: 'dol@example.com', reason: 'Incomplete profile' },
  ];

  return (
    <>
      <h1 className="text-3xl font-bold text-purple-500 dark:text-purple-400 mb-6">Contributors</h1>

      {/* Pending Requests */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">Pending Contributor Requests</h2>
        <div className="space-y-4">
          {pendingContributors.length > 0 ? (
            pendingContributors.map((user) => (
              <div key={user.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">{user.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                </div>
                <div className="flex gap-3">
                  <button className="text-green-500 hover:text-green-600">
                    <FaUserPlus size={20} />
                  </button>
                  <button className="text-red-500 hover:text-red-600">
                    <FaTimesCircle size={20} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No pending requests.</p>
          )}
        </div>
      </section>

      {/* Rejected Requests */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">Rejected Requests</h2>
        <div className="space-y-4">
          {rejectedContributors.length > 0 ? (
            rejectedContributors.map((user) => (
              <div key={user.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold">{user.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                <p className="text-sm text-red-400 mt-1">Reason: {user.reason}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No rejected contributors.</p>
          )}
        </div>
      </section>

      {/* Approved Contributors */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">Approved Contributors</h2>
        <div className="overflow-x-auto rounded-lg shadow">
          <table className="min-w-full bg-white dark:bg-gray-800 text-sm">
            <thead className="bg-gray-100 dark:bg-gray-700 text-left">
              <tr>
                <th className="p-3 font-semibold">Name</th>
                <th className="p-3 font-semibold">Email</th>
                <th className="p-3 font-semibold">Joined</th>
                <th className="p-3 font-semibold">Articles</th>
                <th className="p-3 font-semibold">Block/Unblock</th>
              </tr>
            </thead>
            <tbody>
              {approvedContributors.map((user) => (
                <tr key={user.id} className="border-b dark:border-gray-700">
                  <td className="p-3">{user.name}</td>
                  <td className="p-3">{user.email}</td>
                  <td className="p-3">{user.joined}</td>
                  <td className="p-3">{user.articles}</td>
                  <td className="p-3">
                    {<><button className="text-red-500 hover:text-red-600">
                        <MdBlock size={20} />
                    </button>
                    <button className="text-green-500 hover:text-green-600">
                        <CgUnblock size={20} />
                    </button></>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      
    </>
  );
};

export default ContriRequest;
