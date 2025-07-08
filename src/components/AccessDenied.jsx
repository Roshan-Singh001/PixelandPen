import React from 'react';
import { Shield, ArrowLeft, RefreshCw } from 'lucide-react';

export default function AccessDenied() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 transition-all duration-300 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-black">
      <div className="max-w-md w-full text-center transition-all duration-300 text-gray-800 dark:text-white">
        {/* Shield Icon */}
        <div className="relative mb-8">
          <div className="relative flex items-center justify-center w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-red-500 to-red-600 shadow-xl shadow-red-500/30 dark:from-red-600 dark:to-red-800 dark:shadow-xl dark:shadow-red-900/50">
            <Shield className="w-12 h-12 text-white" />
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8 rounded-2xl backdrop-blur-sm border transition-all duration-300 bg-white/80 border-white/20 shadow-2xl shadow-black/10 dark:bg-gray-800/50 dark:border-gray-700/50 dark:shadow-2xl dark:shadow-gray-900/50">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-red-500 to-pink-500 dark:from-red-400 dark:to-pink-400 bg-clip-text text-transparent">
            Access Denied
          </h1>
          
          <p className="text-lg mb-8 leading-relaxed text-gray-600 dark:text-gray-300">
            You do not have the necessary permissions to view this page.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white shadow-lg shadow-blue-500/30 dark:from-blue-600 dark:to-blue-700 dark:hover:from-blue-500 dark:hover:to-blue-600 dark:shadow-lg dark:shadow-blue-900/50">
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </button>
            
            <button className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 dark:border dark:border-gray-600">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>

          {/* Additional Help */}
          <div className="mt-8 p-4 rounded-xl bg-gray-50 border border-gray-200 dark:bg-gray-700/50 dark:border dark:border-gray-600/50">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Need help? Contact your administrator or{' '}
              <span className="font-medium text-blue-600 dark:text-blue-400">
                support team
              </span>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}