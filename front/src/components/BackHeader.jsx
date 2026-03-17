import React from "react";

const BackHeader = ({
  title = "dashboard",
  showBtn = false,
  addbuttonText,
  onClick,
  children,
}) => {
  return (
    <div className="border rounded-2xl border-gray-200 p-3 flex flex-wrap items-center justify-between gap-3 shadow-sm z-40 bg-white mx-4">
      <div className="flex items-center gap-3 shrink-0">
        <h2 className="text-lg md:text-xl font-bold text-sky-600 whitespace-nowrap">
          {title.toUpperCase()}
        </h2>
      </div>

      <div className="flex flex-wrap items-center justify-start sm:justify-end gap-2 flex-1 w-full sm:w-auto mt-2 sm:mt-0">
        {children}
        {showBtn && (
          <button
            onClick={onClick}
            className="w-auto h-[40px] border border-sky-500 text-sky-500 px-4 py-2 rounded-lg shadow-sm font-medium whitespace-nowrap hover:bg-sky-500 hover:text-white hover:shadow-md transition-all duration-200 flex items-center justify-center shrink-0"
          >
            {addbuttonText || ""}
          </button>
        )}
      </div>
    </div>
  );
};

export default BackHeader;
