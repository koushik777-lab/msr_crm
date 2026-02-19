import { useState, useEffect } from "react";
import { API_URI } from "../../utils/constants";
import { getHeaders, getErrToast, getSuccessToast } from "../../utils/helpers";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { Autocomplete, TextareaAutosize, TextField } from "@mui/material";
import { source } from "framer-motion/client";

export default function AddLeadModal({
  isOpen,
  onClose,
  agents,
  editMode = false,
  leadData = {},
  fetchLeads,
  setLeadData,
  isRenewal = false,
  handleAgentUpdate,
}) {
  const { user, isBackend, isAgent } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    number: "",
    source: "",
    email: "",
    company: "",
    industry: "",
    agent: user?.type === "agent" ? user._id : "",
    notes: "",
  });
  const [err, setErr] = useState({
    name: null,
    company: null,
    number: null,
    source: null,
  });

  useEffect(() => {
    if (editMode && leadData) {
      // console.log("UPDATE LEAD", leadData, formData);
      let tempLeadData = { ...leadData, agent: leadData.agent?._id };
      setFormData(tempLeadData);
    }
  }, [editMode, leadData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErr({ ...err, [name]: null });
  };

  function checkErrors() {
    if (formData.name === "") {
      setErr({ ...err, name: "Name is required" });
      return false;
    }
    if (formData.company === "") {
      setErr({ ...err, company: "Company is required" });
      return false;
    }
    if (formData.number === "") {
      setErr({ ...err, number: "Number is required" });
      return false;
    }
    if (formData.source === "") {
      setErr({ ...err, source: "Source is required" });
      return false;
    }
    return true;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(formData);
    try {
      if (!checkErrors()) {
        return;
      }
      const newFormData = {};
      for (let key in formData) {
        if (formData[key] !== "") {
          newFormData[key] = formData[key];
        }
      }
      if (newFormData?.agent) {
        newFormData.assignDate = new Date();
        newFormData.status = "Not Contacted";
      }
      const {
        data: { leads },
      } = await axios.post(`${API_URI}/lead`, newFormData, getHeaders());
      getSuccessToast("Lead Added Successfully");
    } catch (error) {
      console.error(error.message);
      getErrToast("Error Adding Lead");
    }
    onClose();
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.put(
        `${API_URI}/lead/${formData._id}`,
        {
          name: formData.name,
          number: formData.number,
          source: formData.source,
          email: formData.email,
          company: formData.company,
          industry: formData.industry,
          agent: formData.agent,
          notes: formData.notes,
          ...(leadData.agent?._id !== formData.agent && {
            assignDate: new Date(),
          }),
        },
        getHeaders(),
      );
      // console.log(data.updatedLead.agent);
      setLeadData((prev) =>
        prev.map((lead) => {
          // console.log(lead._id === data.updatedLead._id && lead );
          return lead._id === data.updatedLead._id
            ? {
                ...lead,
                status: data.updatedLead.status,
                agent: data.updatedLead.agent,
              }
            : lead;
        }),
      );
      // await fetchLeads();
      getSuccessToast("Lead Updated Successfully");
    } catch (error) {
      getErrToast("Error Updating Lead");
      console.error(error.message);
    }
    onClose();
  };

  if (!isOpen) return null;
  // useEffect(() => {
  //   if (isBackend) {
  //     let newData = { ...formData };
  //     delete newData.agent;
  //     setFormData(newData);
  //   }
  // }, []);
  // console.log(
  //   "FORMDATA",
  //   formData,
  //   agents.find((agent) => agent._id === formData.agent)?.name,
  //   editMode,
  //   leadData
  // );

  return (
    <div className="fixed inset-0 top-0 left-0 bottom-0 right-0 bg-black/50 z-[50]  flex justify-center items-center ">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl relative text-gray-500 ">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black text-2xl"
        >
          &times;
        </button>
        <h2 className="text-2xl font-semibold mb-4 text-center">
          {!isRenewal ? (editMode ? "Edit Lead" : "Add Lead") : "Assign Agent"}
        </h2>
        <form
          onSubmit={
            isRenewal
              ? (e) => {
                  e.preventDefault();
                  handleAgentUpdate(formData.agent);
                  onClose();
                }
              : editMode
                ? handleUpdate
                : handleSubmit
          }
          className="grid grid-cols-1 sm:grid-cols-2 gap-6"
        >
          {!isRenewal && (
            <>
              <TextField
                label="Name"
                size="small"
                variant="outlined"
                value={formData.name}
                onChange={handleChange}
                name="name"
                fullWidth
                required
                disabled={editMode}
                error={err.name && true}
                helperText={err.name}
              />

              <TextField
                name="number"
                type="text"
                label="Phone Number"
                size="small"
                value={formData.number}
                onChange={handleChange}
                fullWidth
                required
                disabled={editMode}
                error={err.number && true}
                helperText={err.number}
              />

              <Autocomplete
                options={[
                  "OTHERS",
                  "GOOGLE MANUAL",
                  "FB ADS",
                  "FB MANUAL",
                  "INSTAGRAM",
                  "MCA",
                  "GST",
                  "INDIAMART",
                  "JUST DIAL",
                  "REF",
                  "RENEWAL DATA",
                  "SURVELLIANCE ",
                  "GOOGLE ADS",
                  "WHATSAPP MKT",
                  "EMAIL MKT",
                  "CONSULTANT",
                ]}
                value={formData.source}
                onChange={(e, value) =>
                  setFormData({ ...formData, source: value })
                }
                disabled={editMode}
                renderInput={(params) => {
                  return (
                    <TextField
                      {...params}
                      error={err.source && true}
                      helperText={err.source}
                      required
                      label="Source"
                      size="small"
                      fullWidth
                    />
                  );
                }}
              />

              <TextField
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                label="Email"
                size="small"
                fullWidth
                disabled={editMode}
              />

              <TextField
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                label="Company"
                size="small"
                fullWidth
                required
                disabled={editMode}
                error={err.company && true}
                helperText={err.company}
              />

              <TextField
                type="text"
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                label="Industry"
                size="small"
                fullWidth
                disabled={editMode}
              />
            </>
          )}
          {!isAgent && (
            <Autocomplete
              options={agents} // Pass the whole agent object
              getOptionLabel={(option) => option.name} // Ensure it displays the name
              value={
                agents.find((agent) => agent._id === formData.agent) || null
              } // Find the selected agent object
              onChange={(e, value) => {
                console.log(value, agents);
                const agent = agents.find((agent) => agent._id === value._id);
                setFormData({
                  ...formData,
                  agent: value == null ? null : agent._id,
                });
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Agent"
                  size="small"
                  fullWidth
                />
              )}
            />
          )}

          {!isRenewal && (
            <div className="sm:col-span-2">
              <label className="block text-sm">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="w-full border rounded p-2 border-gray-300 mt-1"
                readOnly={editMode}
              ></textarea>
            </div>
          )}
          <div className="sm:col-span-2 flex justify-center">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
