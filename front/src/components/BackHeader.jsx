import React from "react";
import { useNavigate } from "react-router-dom";

const BackHeader = ({
  title = "dashboard",
  showBtn = false,
  addbuttonText,
  onClick,
  children,
}) => {
  const navigate = useNavigate();

  return (
    <div className="border rounded-[15px]  border-gray-300 p-3 flex items-center gap-3    z-40 bg-white mx-4">
      <span
        className="text-xl cursor-pointer w-8 h-8 flex items-center justify-center text-black hover:text-[var(--color-pri)]"
        onClick={() => navigate(-1)}
      >
        ←
      </span>
      <h2 className="text-lg font-bold text-[var(--color-pri)] text-nowrap">
        {title.toUpperCase()}
      </h2>
      <div className="mx-auto text-black">{children}</div>
      {showBtn && (
        <button
          onClick={onClick}
          className="w-fit h-[44px] ml-auto border-1 border-blue-500 text-blue-500 px-3 py-1 rounded-md shadow-md hover:bg-blue-500 hover:text-white transition-colors duration-200"
        >
          {` ${addbuttonText || ""}`}
        </button>
      )}
    </div>
  );
};

export default BackHeader;
