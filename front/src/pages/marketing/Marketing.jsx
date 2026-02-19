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
    <div>
      <h3 className="text-black text-center flex-1 text-5xl">
        E-mail Marketing
      </h3>

      {/* Main content */}
      <div className="text-black p-4">
        <div className="mb-4">
          <MyInput
            label="To"
            type="text"
            name="to"
            placeholder="Type Single Email"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <Autocomplete
            size="small"
            multiple
            freeSolo
            options={[]} // No predefined options
            value={emails}
            onChange={(event, newValue) => setEmails(newValue)}
            // renderTags={(value, getTagProps) =>
            //   value.map((option, index) => (
            //     <Chip
            //       variant="outlined"
            //       label={option}
            //       {...getTagProps({ index })}
            //     />
            //   ))
            // }
            renderInput={(params) => (
              <MyInput
                {...params}
                variant="outlined"
                label="CC"
                placeholder="Add multiple emails (Press Enter after 1 email)"
              />
            )}
          />
        </div>
        <div className="mb-4">
          <Autocomplete
            size="small"
            multiple
            freeSolo
            options={[]} // No predefined options
            value={bcc}
            onChange={(event, newValue) => {
              newValue.length <= 100 && setBcc(newValue);
            }}
            // renderTags={(value, getTagProps) =>
            //   value.map((option, index) => (
            //     <Chip
            //       variant="outlined"
            //       label={option}
            //       {...getTagProps({ index })}
            //     />
            //   ))
            // }
            renderInput={(params) => (
              <MyInput
                {...params}
                variant="outlined"
                label="BCC"
                placeholder="Add multiple emails (Press Enter after 1 email)"
              />
            )}
          />
        </div>

        <div className="mb-4">
          <MyInput
            label="Subject"
            type="text"
            name="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>

        <div className="my-12">
          <RichTextEditor value={message} setValue={setMessage} />
        </div>

        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="fileAttachment"
          >
            Attach Files
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="fileAttachment"
            type="file"
            multiple
            onChange={handleFileChange}
          />
        </div>

        {attachedFiles.length > 0 && (
          <div className="mb-4">
            <h4 className="text-gray-700 text-sm font-bold mb-2">
              Attached Files:
            </h4>
            <ul className="list-disc pl-5">
              {attachedFiles.map((file, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span>{file.name}</span>
                  <button
                    onClick={() => removeFile(index)}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-4"
            type="button"
            onClick={handleSend}
            // disabled={selectedLeads.length === 0}
          >
            Send
          </button>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-gray-500"
            type="button"
            onClick={() => setShowPopup(true)}
            disabled={to != ""}
          >
            Select Leads
          </button>
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
