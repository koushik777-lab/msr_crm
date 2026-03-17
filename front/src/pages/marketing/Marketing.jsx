import axios from "axios";
import React, { useState } from "react";
import MyInput from "../../components/MyInput";
import { API_URI } from "../../utils/constants";
import EmailMarketingPopup from "./EmailMarketingPopup";
import RichTextEditor from "../../components/RichTextEditor";
import { getErrToast, getHeaders, getSuccessToast } from "../../utils/helpers";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Chip from "@mui/material/Chip";

const Marketing = () => {
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("");
  const [to, setTo] = useState("");
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [emails, setEmails] = useState([]);
  const [bcc, setBcc] = useState([]);

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setAttachedFiles([...attachedFiles, ...newFiles]);
    }
  };

  const removeFile = (index) => {
    const updatedFiles = [...attachedFiles];
    updatedFiles.splice(index, 1);
    setAttachedFiles(updatedFiles);
  };

  const handleSend = async () => {
    try {
      const jsonData = {
        subject,
        html: message,
        attachedFiles,
        leads: selectedLeads?.map((lead) => lead?._id),
      };
      const formData = new FormData();
      formData.append("subject", subject);
      formData.append("to", to);
      formData.append("cc[]", emails);
      formData.append("bcc[]", bcc);

      formData.append("html", message);

      attachedFiles.forEach((file, index) => {
        formData.append("attachedFiles", file);
      });

      selectedLeads?.forEach((lead) => {
        if (lead?._id) {
          formData.append("leads", lead._id);
        }
      });

      console.log(formData);

      await axios.post(`${API_URI}/marketing`, formData, getHeaders());
      getSuccessToast("Email sent successfully");
      setShowPopup(false);
      setSubject("");
      setMessage("");
      setEmails([]);
      setTo("");
      setBcc([]);
      setAttachedFiles([]);
    } catch (error) {
      console.error(
        "Error sending email",
        error?.response?.data?.message || error?.message,
      );
      getErrToast(
        error?.response?.data?.message ||
        error?.message ||
        "Error sending email",
      );
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-gray-50 rounded-xl">
      <div className="flex justify-between items-center p-4 md:p-6 border-b border-gray-100 bg-white rounded-t-xl">
        <h3 className="text-xl font-bold text-gray-800">
          E-mail Marketing
        </h3>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto p-4 md:p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 transition-shadow hover:shadow-md max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <MyInput
                label="To"
                type="text"
                name="to"
                placeholder="Type Single Email"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </div>
            <div>
              <MyInput
                label="Subject"
                type="text"
                name="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email Subject"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <Autocomplete
                size="small"
                multiple
                freeSolo
                options={[]} // No predefined options
                value={emails}
                onChange={(event, newValue) => setEmails(newValue)}
                renderInput={(params) => (
                  <MyInput
                    {...params}
                    variant="outlined"
                    label="CC"
                    placeholder="Add multiple emails (Press Enter)"
                  />
                )}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: '8px' } }}
              />
            </div>
            <div>
              <Autocomplete
                size="small"
                multiple
                freeSolo
                options={[]} // No predefined options
                value={bcc}
                onChange={(event, newValue) => {
                  newValue.length <= 100 && setBcc(newValue);
                }}
                renderInput={(params) => (
                  <MyInput
                    {...params}
                    variant="outlined"
                    label="BCC"
                    placeholder="Add multiple emails (Press Enter)"
                  />
                )}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: '8px' } }}
              />
            </div>
          </div>

          <div className="mb-8 border border-gray-200 rounded-xl overflow-hidden">
            <RichTextEditor value={message} setValue={setMessage} />
          </div>

          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-8">
            <label
              className="block text-gray-700 text-sm font-semibold mb-3"
              htmlFor="fileAttachment"
            >
              Attachments
            </label>
            <div className="flex items-center">
              <input
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100 transition-colors"
                id="fileAttachment"
                type="file"
                multiple
                onChange={handleFileChange}
              />
            </div>

            {attachedFiles.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="text-gray-700 text-sm font-semibold mb-3">
                  Attached Files ({attachedFiles.length}):
                </h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {attachedFiles.map((file, index) => (
                    <li key={index} className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-gray-200 shadow-sm">
                      <span className="text-sm text-gray-600 truncate mr-2" title={file.name}>{file.name}</span>
                      <button
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-md transition-colors"
                        title="Remove file"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-4 mt-8 pt-6 border-t border-gray-100">
            <button
              className="bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2.5 px-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2"
              type="button"
              onClick={handleSend}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
              Send Email
            </button>
            <button
              className={`font-semibold py-2.5 px-6 rounded-xl transition-all duration-200 border ${to ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : 'bg-white text-sky-600 border-sky-200 hover:bg-sky-50 hover:border-blue-300 shadow-sm hover:shadow'}`}
              type="button"
              onClick={() => setShowPopup(true)}
              disabled={to != ""}
              title={to ? "Clear 'To' field to select leads instead" : "Select leads from CRM"}
            >
              Select Leads
            </button>
          </div>
        </div>
      </div>

      {showPopup && (
        <EmailMarketingPopup
          onClose={() => setShowPopup(false)}
          selectedLeads={selectedLeads}
          setSelectedLeads={setSelectedLeads}
          handleSend={handleSend}
        />
      )}
    </div>
  );
};

export default Marketing;
