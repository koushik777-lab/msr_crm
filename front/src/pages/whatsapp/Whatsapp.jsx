import React from "react";
import BackHeader from "../../components/BackHeader";
import { Box } from "@mui/material";
import WhatsappForm from "./WhatsappForm";
import WhatsappChat from "./WhatsappChat";

export default function Whatsapp() {
  const [reRender, setReRender] = React.useState(1);
  return (
    <div className="w-full h-full flex flex-col bg-gray-50 rounded-xl">
      <div className="flex justify-between items-center p-4 md:p-6 border-b border-gray-100 bg-white rounded-t-xl">
        <h3 className="text-xl font-bold text-gray-800">
          WhatsApp Integration
        </h3>
      </div>

      <div className="flex-1 overflow-auto p-4 md:p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 transition-shadow hover:shadow-md h-full flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/3 min-w-[300px]">
            <WhatsappForm renderFn={() => setReRender(reRender + 1)} />
          </div>
          <div className="flex-1 w-full border-t md:border-t-0 md:border-l border-gray-100 pt-6 md:pt-0 md:pl-6">
            <WhatsappChat
              key={reRender}
              renderFn={() => setReRender(reRender + 1)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
