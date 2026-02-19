import axios from "axios";
import React, { useState } from "react";
import { API_URI } from "../../utils/constants";
import { getErrToast, getHeaders, getSuccessToast } from "../../utils/helpers";

export default function NotesPopup({
  onClose,
  prevNotes = "",
  leadId = "",
  setLeadData,
  isRenewal = false,
  handleNotesChange,
}) {
  const [notes, setNotes] = useState(prevNotes);
  const handleSave = async () => {
    try {
      await axios.put(`${API_URI}/lead/${leadId}`, { notes }, getHeaders());
      setLeadData((prev) =>
        prev.map((lead) => (lead._id === leadId ? { ...lead, notes } : lead)),
      );
      getSuccessToast("Notes saved successfully");
      onClose();
    } catch (error) {
      console.error("Error saving notes", error);
      getErrToast("Error saving notes");
    }
  };
  return (
    <div className="fixed inset-0 bg-black/50 top-0 right-0 left-0 bottom-0 z-[50] flex justify-center items-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md relative text-black">
        <button
          className="absolute top-4 right-4 text-gray-600 hover:text-black scale-150"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-2xl font-semibold text-center mb-6">Notes</h2>
        <textarea
          name="notes"
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px] resize-none"
          placeholder="Enter your notes here..."
        ></textarea>
        <div className="col-span-2 flex justify-center mt-4 gap-4">
          <button
            type="submit"
            onClick={onClose}
            className={`bg-blue-600 disabled:bg-gray-700 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition disabled:cursor-not-allowed cursor-pointer`}
          >
            Close
          </button>
          <button
            type="submit"
            onClick={isRenewal ? () => handleNotesChange(notes) : handleSave}
            className={`bg-blue-600 disabled:bg-gray-700 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition disabled:cursor-not-allowed cursor-pointer`}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
