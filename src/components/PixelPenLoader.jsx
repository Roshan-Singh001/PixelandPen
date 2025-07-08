import React from 'react';
import { Pen} from 'lucide-react';

export default function PixelPenLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-black">
      <div className="relative">
        <div className="relative z-10 flex flex-col items-center">
          <div className="relative mb-8">
 
            <div className="absolute inset-0 grid grid-cols-8 gap-1 opacity-30 animate-pulse">
              {Array.from({ length: 64 }).map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 dark:from-blue-500 dark:to-purple-500 rounded-sm"
                  style={{
                    animationDelay: `${i * 0.02}s`,
                    animation: `pixelGlow 2s infinite ease-in-out ${i * 0.02}s`
                  }}
                />
              ))}
            </div>
            
            <div className="relative z-10 flex items-center justify-center w-24 h-24 mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-400 dark:to-purple-500 rounded-full animate-spin opacity-20" 
                   style={{ animationDuration: '3s' }}></div>
              <div className="relative bg-white dark:bg-gray-800 rounded-full p-4 shadow-2xl shadow-purple-500/30 dark:shadow-purple-400/30">
                <Pen className="w-8 h-8 text-purple-600 dark:text-purple-400 animate-bounce" />
              </div>
            </div>
          </div>

          <div className="text-center mb-8">
            <p className="text-gray-600 dark:text-gray-400 text-lg font-medium animate-pulse">
              Loading...
            </p>
          </div>

        </div>

        {/* Floating Creative Elements */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Floating Pixels */}
          <div className="absolute top-10 left-10 w-3 h-3 bg-blue-400 dark:bg-blue-500 rounded-sm animate-bounce opacity-70" style={{ animationDelay: '0s' }}></div>
          <div className="absolute top-20 right-16 w-2 h-2 bg-purple-400 dark:bg-purple-500 rounded-sm animate-bounce opacity-70" style={{ animationDelay: '0.2s' }}></div>
          <div className="absolute bottom-32 left-20 w-4 h-4 bg-pink-400 dark:bg-pink-500 rounded-sm animate-bounce opacity-70" style={{ animationDelay: '0.4s' }}></div>
          <div className="absolute bottom-20 right-10 w-3 h-3 bg-indigo-400 dark:bg-indigo-500 rounded-sm animate-bounce opacity-70" style={{ animationDelay: '0.6s' }}></div>
          
          {/* Floating Circles */}
          <div className="absolute top-16 right-32 w-8 h-8 border-2 border-purple-300 dark:border-purple-600 rounded-full animate-ping opacity-60"></div>
          <div className="absolute bottom-40 left-32 w-6 h-6 border-2 border-pink-300 dark:border-pink-600 rounded-full animate-ping opacity-60" style={{ animationDelay: '1s' }}></div>
          
          {/* Floating Brush Strokes */}
          <div className="absolute top-32 left-1/4 w-12 h-1 bg-gradient-to-r from-blue-400 to-transparent dark:from-blue-500 dark:to-transparent rounded-full animate-pulse opacity-50"></div>
          <div className="absolute bottom-28 right-1/4 w-16 h-1 bg-gradient-to-l from-purple-400 to-transparent dark:from-purple-500 dark:to-transparent rounded-full animate-pulse opacity-50" style={{ animationDelay: '0.5s' }}></div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes pixelGlow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.1); }
        }
        
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .animate-loading {
          animation: loading 2s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}