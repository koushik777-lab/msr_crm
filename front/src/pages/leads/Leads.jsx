import React, { useEffect, useRef, useState } from "react";
import { RiFileExcel2Fill } from "react-icons/ri";
import BackHeader from "../../components/BackHeader";
import LeadsTable from "../../components/tables/LeadsTable";
import {
  DAILY_LEADS_OVERVIEW_BODY,
  DAILY_LEADS_OVERVIEW_HEADERS,
  LEAD_STATUS,
  LeadstableData,
  LeadstableHeading,
  PRIMARY,
} from "../../constants/constant";
import AddLeadModal from "../../components/Leads/AddLeadPopup";
import LeadDetailsPopup from "../../components/Leads/LeadDetailsPopup";
import AssignAgentPopup from "../../components/Leads/AssignAgentPopup";
import axios from "axios";
import { API_URI } from "../../utils/constants";
import { getHeaders, marketingChannels } from "../../utils/helpers";
import Loader from "../../components/Loader";
import { div } from "framer-motion/client";
import toast from "react-hot-toast";
import { getErrToast, getSuccessToast } from "../../utils/helpers";
import {
  Autocomplete,
  Button,
  Pagination,
  Paper,
  TextField,
  Box,
  InputLabel,
  FormControl,
  CircularProgress,
} from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import LoginOverlay from "../../components/LoginOverlay";
import AssignByStatePopup from "../../components/Leads/AssignByStatePopup";
import UploadExcelPopup from "../../components/Leads/UploadExcelPopup";

const Leads = () => {
  // console.log("COMP MOUNT");
  const { isBackend, isSalesManager, isAgent } = useAuth();
  const [agents, setAgents] = useState([]);
  const [popupType, setPopupType] = useState("null");
  const [leadData, setLeadData] = useState([]);
  const [loading, setLoading] = useState(!isBackend);
  const [currPage, setCurrPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [totalPages, setTotalPages] = useState(10);
  const [selectedSource, setSelectedSource] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [sourceCount, setSourceCount] = useState({});
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [querySource, setQuerySource] = useState(marketingChannels);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [reRender, setReRender] = useState(false);
  const [excelUploading, setExcelUploading] = useState(false);
  // console.log("BAckend", isBackend);
  function handleClick() {
    console.log("clicked");
  }

  const handleSelectedSource = (e) => {
    e == selectedSource ? setSelectedSource(null) : setSelectedSource(e);
    // setCurrPage(1);
  };

  const clearDateFilter = () => {
    setStartDate("");
    setEndDate("");
  };

  // const [isOpen ,setIsOpen] = useState(false);
  const handleAddLead = () => {
    setPopupType("add");
  };
  const onClose = (isRender) => {
    if (isRender) setReRender(!reRender);
    setPopupType(null);
  };
  // const toastSuccess = (string) => toast.success(string);
  // const toastError = () => toast.error("Error");

  async function fetchLeads(page, isSetToPage1 = false) {
    console.log("FETHCING LEADS");
    let finalParams = {
      page: page,
      limit,
      ...(selectedSource && { source: selectedSource }),
      ...(selectedStatus && { status: selectedStatus }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
      ...(phoneNumber != "" && { phoneNumber: phoneNumber.replace("+", "") }),
    };

    try {
      const {
        data: { leads, totalLeads, currentPage },
      } = await axios.get(`${API_URI}/leads`, getHeaders(finalParams));

      setLeadData(leads);
      setLoading(false);
      setTotalPages(Math.ceil(totalLeads / limit));
      isSetToPage1 && setCurrPage(1);
    } catch (error) {
      console.log(error.message);
    }
  }

  async function fetchAgents() {
    try {
      const {
        data: { agents },
      } = await axios.get(`${API_URI}/agents`, getHeaders());
      setAgents(
        agents?.map((agent) => ({
          _id: agent._id,
          name: agent.name,
        })),
      );
      // console.log(agents);
    } catch (error) { }
  }

  async function handleUpdateAgent(val) {
    try {
      const res = await Promise.all(
        selectedLeads.map(async (lead) => {
          console.log(val, lead);
          try {
            const {
              data: { updatedLead },
            } = await axios.put(
              `${API_URI}/lead/${lead._id}`,
              {
                // ...lead,
                agent: val._id,
                ...((!lead?.agent || lead?.agent._id !== val._id) && {
                  assignDate: new Date(),
                }),
              },
              getHeaders(),
            );
            // console.log(data);
            return updatedLead;
          } catch (error) {
            console.log(error.message);
            return error;
          }
        }),
      );
      // console.log(res, leadData);
      setLeadData((prev) =>
        prev.map((lead) => res.find((r) => r._id == lead._id) || lead),
      );
      setSelectedLeads([]);
      toast.success("Agent Assigned Successfully");
    } catch (error) {
      console.log(error.message);
    }
  }

  const fetchSourceCount = async () => {
    try {
      const {
        data: { obj },
      } = await axios.get(
        `${API_URI}/leads`,
        getHeaders({ isSourceCount: true, selectedStatus }),
      );
      // console.log(data);
      setSourceCount(obj);
    } catch (error) {
      console.log(error.message);
    }
  };
  useEffect(() => {
    fetchLeads();
    fetchAgents();
  }, []);
  useEffect(() => {
    fetchSourceCount();
  }, [selectedStatus]);
  useEffect(() => {
    fetchLeads(1, true);

    // console.log(currPage, selectedStatus);
  }, [selectedSource, selectedStatus, startDate, endDate]);
  useEffect(() => {
    fetchLeads(currPage);
  }, [reRender]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchLeads(1, true);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [phoneNumber]);
  // useEffect(()=> {},[reRender])
  // useEffect(()=> {

  //   fetchLeads(true)
  //   setCurrPage(1);
  // },[])
  console.log(popupType);

  const handleExcelUpload = async (event, source) => {
    const file = event.target.files[0];
    if (!file) return;

    setExcelUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("source", source || "Others");

    try {
      const response = await axios.post(
        `${API_URI}/upload-excel`,
        formData,
        getHeaders(null, { "Content-Type": "multipart/form-data" }),
      );
      toast.success("Excel file uploaded successfully");
      fetchLeads(1, true);
      fetchSourceCount();
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload excel file");
    } finally {
      setExcelUploading(false);
      setPopupType(null);
    }
  };

  return (
    <div className="relative">
      <LeadsWrapper className="w-full bg-white ">
        <BackHeader
          onClick={handleAddLead}
          title="leads table"
          showBtn={true}
          addbuttonText={"Add Lead"}
        >
          <div className="flex flex-wrap items-center gap-2">
            {!isAgent && (
              <div className="flex items-center gap-1 shrink-0">
                <TextField
                  label="Start Date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  slotProps={{
                    inputLabel: {
                      shrink: true,
                    },
                    htmlInput: {
                      max: endDate || undefined,
                    },
                  }}
                  size="small"
                  sx={{ width: 130 }}
                />
                <TextField
                  label="End Date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  size="small"
                  slotProps={{
                    inputLabel: {
                      shrink: true,
                    },
                    htmlInput: {
                      min: startDate || undefined,
                    },
                  }}
                  sx={{ width: 130 }}
                />
                {(startDate || endDate) && (
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={clearDateFilter}
                    sx={{ height: "40px", minWidth: "60px" }}
                  >
                    Clear
                  </Button>
                )}
              </div>
            )}
            <div>
              <TextField
                type="text"
                value={phoneNumber}
                label="Phone Number"
                placeholder="Search by Phone Number"
                onChange={(e) => {
                  const inputValue = e.target.value;

                  // Regex: Optional leading +, followed by only digits
                  if (/^\+?[0-9]*$/.test(inputValue)) {
                    setPhoneNumber(inputValue);
                  }
                }}
                size="small"
                sx={{ width: 140 }}
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
              />
            </div>
            <div className="shrink-0">
              <Autocomplete
                id="combo-box-demo"
                options={LEAD_STATUS}
                // getOptionLabel={(option) => option.name}
                style={{ width: 140 }}
                onChange={(e, val) => {
                  // console.log(val)
                  setSelectedStatus(val);
                  // setCurrPage(1);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Lead Status"
                    variant="outlined"
                    size="small"
                    value={selectedStatus}
                  />
                )}
              />
            </div>

            {!isAgent && (
              <>
                <div className="shrink-0">
                  <Autocomplete
                    id="combo-box-demo"
                    options={agents}
                    getOptionLabel={(option) => option.name}
                    style={{ width: 150 }}
                    onChange={(e, val) => {
                      // console.log(val);
                      // setSelectedStatus(val);
                      val && handleUpdateAgent(val);
                    }}
                    disabled={selectedLeads.length == 0}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Assign Agent"
                        variant="outlined"
                        size="small"
                      // value={selectedStatus}
                      />
                    )}
                  />
                </div>
                <div className="shrink-0">
                  <Button
                    variant="contained"
                    onClick={() => setPopupType("State")}
                  >
                    Assign By State
                  </Button>
                </div>
              </>
            )}
            {!isAgent && (
              <div className="flex flex-col items-center justify-center mx-auto">
                {/* <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleExcelUpload}
                    style={{ display: "none" }}
                    id="excel-upload"
                  /> */}
                <Button
                  variant="contained"
                  component="label"
                  onClick={() => setPopupType("uploadExcel")}
                  // htmlFor="excel-upload"
                  size="small"
                  disabled={excelUploading}
                  sx={{
                    minWidth: "36px",
                    width: "36px",
                    height: "36px",
                    backgroundColor: "#2e7d32",
                    "&:hover": {
                      backgroundColor: "#1b5e20",
                    },
                  }}
                >
                  {excelUploading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <>
                      <RiFileExcel2Fill size={20} />
                    </>
                  )}
                </Button>
                <div className=" text-[#2e7d32] text-[10px] mt-0.5 ">Upload Data</div>
              </div>
            )}
          </div>
        </BackHeader>
        <div className="flex gap-6 my-6 h-[calc(100vh-140px)]">
          {/* Left Sidebar Filter */}
          <div className="w-[280px] flex-shrink-0 flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
              <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wider">
                Filter By Source
              </h2>
            </div>

            <div className="p-4 flex-1 flex flex-col overflow-hidden">
              <TextField
                size="small"
                placeholder="Search..."
                sx={{
                  width: "100%",
                  marginBottom: "1rem",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                  }
                }}
                variant="outlined"
                onChange={(e) => {
                  setQuerySource(
                    marketingChannels.filter((source) =>
                      source.toLowerCase().includes(e.target.value.toLowerCase()),
                    ),
                  );
                }}
              />
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-2">
                {querySource.map((source) => (
                  <div
                    key={source}
                    onClick={() => handleSelectedSource(source)}
                    className={`px-3 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-all duration-200 flex items-center justify-between border ${selectedSource === source
                      ? "bg-sky-50 border-sky-200 text-sky-700 shadow-sm"
                      : "bg-white border-transparent hover:border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                  >
                    <span className="truncate mr-2">{source}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${selectedSource === source ? 'bg-sky-100 text-sky-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                      {sourceCount[source] || 0}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto no-scrollbar bg-white rounded-2xl shadow-sm border border-gray-100 relative">
            {loading ? (
              <div className="w-full h-full flex justify-center items-center">
                <Loader />
              </div>
            ) : leadData.length === 0 ? (
              <div className="w-full h-full flex justify-center items-center">
                <div className="text-center p-8 bg-gray-50 rounded-2xl max-w-md">
                  <div className="text-xl font-medium text-gray-800 mb-2">
                    No leads available
                  </div>
                  <div className="text-gray-500 text-sm">
                    {selectedSource && selectedStatus
                      ? `No leads found for "${selectedSource}" with status "${selectedStatus}"`
                      : selectedSource
                        ? `No leads found for source "${selectedSource}"`
                        : selectedStatus
                          ? `No leads found with status "${selectedStatus}"`
                          : "Try adjusting your filters to see more results."}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col h-full bg-white">
                <div className="flex-1 overflow-auto">
                  <LeadsTable
                    tableHeaders={LeadstableHeading}
                    tableBody={leadData}
                    setLeadData={setLeadData}
                    agents={agents}
                    fetchLeads={fetchLeads}
                    selectedLeads={selectedLeads}
                    setSelectedLeads={setSelectedLeads}
                  />
                </div>

                <div className="p-4 border-t border-gray-100 flex justify-center bg-gray-50/50">
                  <Pagination
                    page={currPage}
                    onChange={(e, val) => {
                      setCurrPage(val);
                      val != currPage && fetchLeads(val);
                    }}
                    size="medium"
                    count={totalPages}
                    showFirstButton
                    showLastButton
                    shape="rounded"
                    color="primary"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </LeadsWrapper>

      {popupType == "add" && (
        <AddLeadModal isOpen={true} onClose={onClose} agents={agents} />
      )}
      {popupType == "details" && <LeadDetailsPopup onClose={onClose} />}
      {popupType == "assign" && <AssignAgentPopup onClose={onClose} />}
      {popupType == "State" && (
        <AssignByStatePopup onClose={onClose} agents={agents} />
      )}
      {popupType == "uploadExcel" && (
        <UploadExcelPopup
          handleExcelUpload={handleExcelUpload}
          onClose={onClose}
        />
      )}

      {/* Using a JavaScript variable for background color with inline styles */}
      <LoginOverlay />
    </div>
  );
};

const LeadsWrapper = ({ children, className }) => {
  return (
    <div className={className}>
      <div>{children}</div>
    </div>
  );
};

export default Leads;
