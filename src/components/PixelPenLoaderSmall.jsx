import React from 'react';

const PixelPenLoaderSmall = () => {
  return (
    <div className="flex flex-col items-center justify-center">
      {/* Main spinner container */}
      <div className="relative">
        {/* Outer ring */}
        <div className="w-8 h-8 border-[0.1rem] border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
        
        {/* Inner ring */}
        <div className="absolute top-2 left-2 w-4 h-4 border-[0.1rem] border-gray-100 border-b-purple-500 rounded-full animate-spin animation-delay-150"></div>
      </div>
      
      <style jsx>{`
        .animation-delay-150 {
          animation-delay: 0.15s;
        }
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        .animation-delay-400 {
          animation-delay: 0.4s;
        }
      `}</style>
    </div>
  );
};

export default PixelPenLoaderSmall;