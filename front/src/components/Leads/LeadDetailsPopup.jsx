import { FaMoneyCheckAlt, FaFileInvoice, FaPhoneAlt, FaTimes } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function LeadDetailsPopup({ onClose }) {
    const [step, setStep] = useState(2);
  return (
    <div className="fixed inset-0 bg-black/50 top-0 left-0 bottom-0 right-0 flex justify-center items-center z-[50]">
      <div className="bg-white rounded-lg p-6 w-3/4 max-w-2xl relative text-black">
        <button onClick={onClose} className="absolute cursor-pointer top-2 right-2 text-gray-600">
          <FaTimes size={20} />
        </button>
        <h2 className="text-center text-2xl font-semibold mb-8">Lead Details</h2>

        <div className="flex items-center justify-between relative">
          {/** Timeline container */}
          <motion.div
            className="absolute top-1/3 left-[10%] right-0 h-1 bg-blue-500 z-10"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: step/3.5 }}
            transition={{ duration: 1, ease: 'easeInOut' }}
            style={{ transformOrigin: 'left' }}
          />
          <motion.div
            className="absolute top-1/3 left-[10%] right-0 h-1 bg-gray-100"
            initial={{ scaleX: 0 }}
            animate={{ scaleX:3/3.5 }}
            transition={{ duration: 0.001, ease: 'easeInOut' }}
            style={{ transformOrigin: 'left' }}
          />

          {/** Timeline items */}
          <div className="flex flex-col items-center relative z-10">
            <div className={`${step>=0?"bg-blue-500 text-white" : "bg-white text-blue-500 border border-blue-500" } p-3 rounded-full `}>
              <FaMoneyCheckAlt size={24} />
            </div>
            <p className="mt-2 text-center">Payment Received</p>
          </div>

          <div className="flex flex-col items-center relative z-10">
            <div className={`${step>=1?"bg-blue-500 text-white" : "bg-white text-blue-500 border border-blue-500" } p-3 rounded-full `}>
              <FaFileInvoice size={24} />
            </div>
            <p className="mt-2 text-center">Quotation Sent</p>
          </div>

          <div className="flex flex-col items-center relative z-10">
            <div className={`${step>=2?"bg-blue-500 text-white" : "bg-white text-blue-500 border border-blue-500" } p-3 rounded-full `}>
              <FaPhoneAlt size={24} />
            </div>
            <p className="mt-2 text-center">Called on 30th, May</p>
            <button className="mt-2 bg-blue-500 text-white px-3 py-1 rounded absolute -bottom-12 hover:bg-blue-600 cursor-pointer">Get Recording</button>
          </div>

          <div className="flex flex-col items-center relative z-10">
            <div className={`${step>=3?"bg-blue-500 text-white" : "bg-white text-blue-500 border border-blue-500" } p-3 rounded-full `}>
              <FaPhoneAlt size={24} />
            </div>
            <p className="mt-2 text-center">Called on 31th, May</p>
            <button className="mt-2 bg-blue-500 text-white px-3 py-1 rounded absolute -bottom-12 hover:bg-blue-600 cursor-pointer">Get Recording</button>
          </div>

        </div>
        <div className='flex justify-end gap-4 mt-4 h-8'>

        </div>
      </div>
    </div>
  );
}
