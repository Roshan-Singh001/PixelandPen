import React from 'react';
import { Link } from 'react-router-dom'; // optional, if using React Router

const Error404 = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 px-4 text-center">
      <h1 className="text-7xl font-extrabold text-sky-600 dark:text-sky-400 animate-bounce mb-4">
        404
      </h1>
      <h2 className="text-3xl md:text-4xl font-semibold mb-2">
        Page Not Found
      </h2>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 max-w-md">
        Oops! The page you're looking for doesn’t exist or has been moved.
      </p>

      <Link
        to="/"
        className="inline-block bg-sky-600 dark:bg-sky-500 text-white dark:text-gray-900 font-medium px-6 py-3 rounded-lg shadow hover:bg-sky-700 dark:hover:bg-sky-400 transition"
      >
        Go Back Home
      </Link>
    </div>
  );
};

export default Error404;
