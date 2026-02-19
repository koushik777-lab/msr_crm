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
    } catch (error) {}
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
          <div className="flex items-center gap-6 cursor-pointer mt-1">
            {!isAgent && (
              <div className="flex items-center gap-2">
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
                />
                {(startDate || endDate) && (
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={clearDateFilter}
                    sx={{ height: "40px" }}
                  >
                    Clear
                  </Button>
                )}
              </div>
            )}
            {/* {!isAgent && ( */}
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
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
              />
            </div>
            {/* )} */}
            <div>
              <Autocomplete
                id="combo-box-demo"
                options={LEAD_STATUS}
                // getOptionLabel={(option) => option.name}
                style={{ minWidth: 200 }}
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
                <div>
                  <Autocomplete
                    id="combo-box-demo"
                    options={agents}
                    getOptionLabel={(option) => option.name}
                    style={{ minWidth: 200 }}
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
                <div>
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
                    minWidth: "40px",
                    width: "40px",
                    height: "40px",
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
                <div className=" text-[#2e7d32] text-xs mt-1 ">Upload Data</div>
              </div>
            )}
          </div>
        </BackHeader>
        <div className="flex  gap-4 my-6 ">
          <div
            className={`   basis-[15vw] h-[74vh] overflow-y-scroll bg-white  rounded-xl px-2  py-4 border-[var(--color-pri)] border `}
          >
            <h2 className=" text-center sticky font-bold text-lg text-black ">
              Filter By Lead Source
            </h2>
            {/* Sidebar content */}
            <TextField
              slotProps={{
                inputLabel: {
                  // shrink: true,
                  style: { color: "black" },
                },
              }}
              size="small"
              placeholder="Instagram..."
              label="Search Source"
              sx={{
                width: "100%",
                marginTop: "1rem",
                color: "black",
                //     '& .MuiOutlinedInput-root': {
                // '& fieldset': {
                //   borderColor: 'black', // Default border color
                // },
                // '&:hover fieldset': {
                //   borderColor: 'black', // Border color on hover
                // },
                // '&.Mui-focused fieldset': {
                //   borderColor: 'black', // Border color when focused
                // },
                //   }
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
            <div className="flex flex-col gap-3 mt-4">
              {querySource.map((source) => (
                <div
                  key={source}
                  onClick={() => handleSelectedSource(source)}
                  className={`px-2 xl:px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 flex items-center  ${
                    selectedSource === source
                      ? "bg-[var(--color-pri)] text-white shadow-md transform "
                      : "hover:border-black border-[var(--color-sec)] border text-black "
                  }`}
                >
                  {source}
                  <span className="ml-1 text-xs ">
                    ({sourceCount[source] ? sourceCount[source] : 0})
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto  no-scrollbar pt-2">
            {/* <Paper elevation={2} className="mx-4 mb-10 p-4 rounded-lg">
            <div className="text-black text-lg font-semibold mb-4">
              <span className="border-b-2 border-blue-500 pb-1">
                Filter By Lead Source
              </span>
            </div>
            <div className="flex flex-wrap gap-3 ">
              {marketingChannels.map((source) => (
                <div
                  key={source}
                  onClick={() => handleSelectedSource(source)}
                  className={`px-4 py-2 rounded-full text-sm font-medium cursor-pointer transition-all duration-200 flex items-center  ${
                    selectedSource === source
                      ? "bg-blue-500 text-white shadow-md transform scale-105"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {source}
                  <span className="ml-1 text-xs ">
                    ({sourceCount[source] ? sourceCount[source] : 0})
                  </span>
                </div>
              ))}
            </div>
          </Paper> */}

            {loading ? (
              <div className="w-full h-full flex justify-center">
                <Loader />
              </div>
            ) : leadData.length === 0 ? (
              <div className="w-full h-40 flex justify-center items-center">
                <Paper elevation={2} className="p-8 text-center">
                  <div className="text-xl font-medium text-gray-600 mb-2">
                    No leads available
                  </div>
                  <div className="text-gray-500">
                    {selectedSource && selectedStatus
                      ? `No leads found for "${selectedSource}" with status "${selectedStatus}"`
                      : selectedSource
                        ? `No leads found for source "${selectedSource}"`
                        : selectedStatus
                          ? `No leads found with status "${selectedStatus}"`
                          : "No leads available"}
                  </div>
                </Paper>
              </div>
            ) : (
              <>
                <LeadsTable
                  tableHeaders={LeadstableHeading}
                  tableBody={leadData}
                  setLeadData={setLeadData}
                  agents={agents}
                  fetchLeads={fetchLeads}
                  selectedLeads={selectedLeads}
                  setSelectedLeads={setSelectedLeads}
                />

                <Pagination
                  page={currPage}
                  onChange={(e, val) => {
                    setCurrPage(val);
                    val != currPage && fetchLeads(val);
                  }}
                  className=" w-fit mx-auto mt-6"
                  size="large"
                  count={totalPages}
                  showFirstButton
                  showLastButton
                />
              </>
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
