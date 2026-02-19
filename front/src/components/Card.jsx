import React from "react";

export default function StatsCard({ title, value }) {
  return (
    <div className="flex flex-col bg-gradient-to-br from-white to-blue-50 p-4 sm:p-6 rounded-xl mb-4 shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300 border-l-4 border-[#1364FF] w-full sm:w-64 max-w-full h-auto min-h-[10rem]">
      <div className="mb-2">
        <h3 className="text-md sm:text-lg font-semibold text-[#1364FF] line-clamp-2">
          {title}
        </h3>
      </div>
      <div className="flex-grow flex items-center">
        <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 break-words">
          {value}
        </p>
      </div>
      <div className="w-1/4 h-1 bg-[#1364FF] rounded-full opacity-70 mt-2"></div>
    </div>
  );
}
