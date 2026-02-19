import React, { useState, useRef, useEffect, useMemo } from "react";
import BackHeader from "../../components/BackHeader";
import {
  Button,
  Typography,
  Box,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Autocomplete,
  Checkbox,
  Pagination,
  Tooltip,
} from "@mui/material";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";
import axios from "axios";
import { API_URI } from "../../utils/constants";
import { DEBOUNCE, getHeaders } from "../../utils/helpers";
import { FiEye, FiClock, FiDownload, FiUpload, FiFilter } from "react-icons/fi";
import { TbNotes } from "react-icons/tb";
import { useNavigate } from "react-router-dom";
import { HiMiniClipboardDocumentList } from "react-icons/hi2";
import AddLeadPopup from "../../components/Leads/AddLeadPopup";
import AddRenewalPopup from "../../components/Renewal/AddRenewalPopup";
import NotesPopup from "../leads/NotesPopup";
import moment from "moment";
import { useAuth } from "../../context/AuthContext";
import { useAgentContext } from "../../context/AgentContext";
import { LEAD_STATUS, statusColorMap } from "../../constants/constant";
// import sampleRenewal from "../../../public/sampleRenewal.xlsx"

export default function Renewal() {
  const [excelData, setExcelData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(50);
  const [selectedRenewals, setSelectedRenewals] = useState([]);
  const [search, setSearch] = useState("");
  const [filterPopupOpen, setFilterPopupOpen] = useState(false);
  const [yearFilter, setYearFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      setSelectedRenewals(excelData.map((n) => n._id));
    } else {
      setSelectedRenewals([]);
    }
  };

  const handleRowSelect = (event, id) => {
    const selectedIndex = selectedRenewals.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedRenewals, id);
    } else {
      newSelected = newSelected.concat(
        selectedRenewals.slice(0, selectedIndex),
        selectedRenewals.slice(selectedIndex + 1),
      );
    }
    setSelectedRenewals(newSelected);
  };

  const isSelected = (id) => selectedRenewals.indexOf(id) !== -1;

  const handleMultiAgentAssign = async (agentId) => {
    if (selectedRenewals.length === 0) {
      toast.error("Please select renewals to assign");
      return;
    }

    try {
      await Promise.all(
        selectedRenewals.map((renewalId) =>
          axios.put(
            `${API_URI}/renewal/${renewalId}`,
            {
              agent: agentId,
              status: "Not Contacted",
            },
            getHeaders(),
          ),
        ),
      );

      setExcelData((prev) =>
        prev.map((item) =>
          selectedRenewals.includes(item._id)
            ? {
                ...item,
                agent: agentId,
                status: "Not Contacted",
              }
            : item,
        ),
      );

      setSelectedRenewals([]);
      toast.success("Agents assigned successfully");
    } catch (error) {
      console.error("Error updating agents:", error);
      toast.error("Failed to assign agents");
    }
  };
  const tableContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const [selectedRenewal, setSelectedRenewal] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isAddRenewalPopupOpen, setIsAddRenewalPopupOpen] = useState(false);
  const [isEditRenewalPopupOpen, setIsEditRenewalPopupOpen] = useState(false);
  const [editingRenewal, setEditingRenewal] = useState(null);
  const [notesPopupOpen, setNotesPopupOpen] = useState(false);
  const [clickedRenewal, setClickedRenewal] = useState(null);
  const [showUploadPopup, setShowUploadPopup] = useState(false);
  const navigate = useNavigate();
  const { user, isBackend, isAgent, isSalesManager } = useAuth();
  const { agentList } = useAgentContext();
  const [filter, setFilter] = useState({
    type: null,
    label: null,
    status: "",
  });

  async function postRenewal(arr) {
    setLoading(true);

    try {
      const { data } = await axios.post(
        `${API_URI}/renewal`,
        {
          renewal: arr,
        },
        getHeaders(),
      );
      console.log("DATA", data);
      // window.location.reload()
      return data?.updatedRenewals;
    } catch (error) {
      console.log(error.message);
    } finally {
      setLoading(false);
    }
  }

  const avoidHeadersKeys = [
    "__v",
    "_id",
    "createdAt",
    "updatedAt",
    "status",
    "agent",
    "notes",
    "reminderDate",
  ];

  async function fetchAllLeads(pageNum = 1) {
    if (loading) return;
    try {
      setLoading(true);

      // Add filter params to the query
      const queryParams = `page=${pageNum}&limit=${limit}${filter.type ? `&filterType=${filter.type}` : ""}${search ? `&search=${search}` : ""}${yearFilter ? `&year=${yearFilter}` : ""}${monthFilter ? `&month=${monthFilter}` : ""}${filter.status ? `&status=${filter.status}` : ""}`;
      console.log(queryParams);
      // Log the filter being used
      if (filter.type) {
        console.log(`Filtering by: ${filter.label}`);
      }
      if (search) {
        console.log(`Searching for: ${search}`);
      }
      if (yearFilter || monthFilter) {
        console.log(
          `Filtering by date: ${yearFilter || "Any Year"} - ${monthFilter ? new Date(2000, monthFilter - 1, 1).toLocaleString("default", { month: "long" }) : "Any Month"}`,
        );
      }

      let { data } = await axios.get(
        `${API_URI}/renewal?${queryParams}`,
        getHeaders(),
      );
      data = {
        ...data,
        renewals: data?.renewals?.map((v) => ({
          ...v,
          "ISSUE DATE": v["ISSUE DATE"]
            ? moment(v["ISSUE DATE"]).format("DD.MM.YYYY")
            : "",
          "1ST SURV": v["1ST SURV"]
            ? moment(v["1ST SURV"]).format("DD.MM.YYYY")
            : "",
          "2ND SURV": v["2ND SURV"]
            ? moment(v["2ND SURV"]).format("DD.MM.YYYY")
            : "",
          "EXPIRY DATE": v["EXPIRY DATE"]
            ? moment(v["EXPIRY DATE"]).format("DD.MM.YYYY")
            : "",
        })),
      };
      if (data?.renewals?.length < limit) {
        setHasMore(false);
      }
      setTotalPages(Math.ceil(data?.TotalCount / limit));
      setExcelData(data?.renewals);
      // setExcelData((prev) =>
      //   pageNum === 1 ? data?.renewals : [...prev, ...data?.renewals],
      // );
      setHeaders(
        Object.keys(data?.renewals[0] || {}).filter(
          (v) => !avoidHeadersKeys.includes(v),
        ),
      );
    } catch (error) {
      console.log(error.message);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }

  const handleScroll = () => {
    return;
    if (!tableContainerRef.current || loading || filterLoading || !hasMore)
      return;

    const { scrollTop, scrollHeight, clientHeight } = tableContainerRef.current;
    if (scrollHeight - scrollTop <= clientHeight * 1.5) {
      setPage((prev) => prev + 1);
    }
  };

  useEffect(() => {
    // When filter, search, or date filters change, reset to first page and clear existing data
    setExcelData([]);
    setHasMore(true);
    setPage(1);
    fetchAllLeadsWithLoading(1);
  }, [filter.type, filter.status, search, yearFilter, monthFilter]);

  useEffect(() => {
    // Skip the initial load since it's handled by the filter effect
    if (page === 1 && filter.type !== null) {
      return;
    }
    fetchAllLeads(page);
  }, [page]);

  useEffect(() => {
    const tableContainer = tableContainerRef.current;
    if (tableContainer) {
      tableContainer.addEventListener("scroll", handleScroll);
      return () => tableContainer.removeEventListener("scroll", handleScroll);
    }
  }, [loading, hasMore]);

  const handleUploadClick = () => {
    setShowUploadPopup(true);
  };

  const handleActualUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleDownloadSample = () => {
    const link = document.createElement("a");
    link.href = "/sampleRenewal.xlsx";
    link.download = "sampleRenewal.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileTypes = [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/csv",
    ];

    if (!fileTypes.includes(file.type)) {
      toast.error("Please upload a valid Excel file (.xlsx, .xls, or .csv)");
      return;
    }

    setLoading(true);
    const reader = new FileReader();

    reader.onload = async (evt) => {
      try {
        const binaryData = evt.target.result;
        const workbook = XLSX.read(binaryData, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        // Add raw: true option to prevent date parsing
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          raw: false,
        });
        let arr = [];
        // console.log(worksheet);
        jsonData.forEach((val, i) => {
          let obj = {};
          if (i != 0) {
            val.forEach((v, idx) => {
              obj[jsonData[0][idx]] = v || ""; // Handle null/undefined values
            });
            arr.push(obj);
          }
        });

        if (jsonData.length === 0) {
          toast.error("The Excel file is empty");
          setLoading(false);
          return;
        }

        const headerRow = jsonData[0];
        const tableHeaders = headerRow.map((header) => ({
          key: header.replace(/\./g, "_"),
          label: header.replace(/\./g, "_"),
        }));
        console.log(tableHeaders.map((v) => v.key));
        let isValidExcel = true;
        const expectedFields = [
          "S_ NO",
          "STANDARD",
          "BODY",
          "ISSUE DATE",
          "1ST SURV",
          "2ND SURV",
          "EXPIRY DATE",
          "COMPANY NAME",
          "ADDRESS",
          "NATURE OF BUSINESS",
          "CERTIFICATE NO_",
          "E- MAILD ID",
          "CONTACT NO_",
          "CONTACT PERSON",
          "MARKETING EXECUTIVE",
          "CLIENT / CONSULTANT",
          "RECEIVABLE A/C",
          "AMOUNT",
          "AMOUNT RECEIVED DATE",
          "REMARKS",
        ];
        tableHeaders
          .map((v) => v.key)
          .forEach((header, index) => {
            if (header !== expectedFields[index] && isValidExcel) {
              isValidExcel = false;
              toast.error(
                `Invalid Excel format. Expected header: ${expectedFields[index]}`,
              );
            }
          });
        if (!isValidExcel) {
          setLoading(false);
          return;
        }
        // console.log(isValidExcel);
        // return;
        await postRenewal(arr);
        await fetchAllLeads(1);

        // const dataRows = jsonData.slice(1).map((row) => {
        //   const rowData = {};
        //   headerRow.forEach((header, index) => {
        //     rowData[header.replace(/\./g, "_")] = row[index] || "";
        //   });
        //   rowData["agent"] = null;
        //   rowData["status"] = "Unassigned";
        //   rowData["notes"] = "";

        //   return rowData;
        // });
        // console.log("DATA ROWS", dataRows, headerRow);
        // excelData?.length == 0 && setHeaders(tableHeaders);
        // excelData?.length == 0
        //   ? setExcelData(dataRows)
        //   : setExcelData((prev) => [...dataRows, ...prev]);
        toast.success("Excel file uploaded successfully");
      } catch (error) {
        console.error("Error parsing Excel file:", error);
        toast.error(
          "Failed to parse Excel file. Please check the file format.",
        );
      } finally {
        setLoading(false);
      }
    };

    reader.onerror = () => {
      toast.error("Error reading the file");
      setLoading(false);
    };

    reader.readAsBinaryString(file);
    e.target.value = null;
  };

  const handleAssignClick = (renewal) => {
    setSelectedRenewal(renewal);
    setIsPopupOpen(true);
  };

  const handleNotesClick = (renewal) => {
    setClickedRenewal(renewal);
    setNotesPopupOpen(true);
  };

  const handleStatusChange = async (renewalId, newStatus) => {
    try {
      await axios.put(
        `${API_URI}/renewal/${renewalId}`,
        {
          status: newStatus,
          ...(newStatus == "Unassigned" && { agent: null }),
        },
        getHeaders(),
      );
      setExcelData((prev) =>
        prev.map((item) =>
          item._id === renewalId
            ? {
                ...item,
                status: newStatus,
                ...(newStatus == "Unassigned" && { agent: null }),
              }
            : item,
        ),
      );
    } catch (error) {
      console.error("Error updating renewal status:", error);
    }
  };
  const handleNotesChange = async (newNotes) => {
    try {
      await axios.put(
        `${API_URI}/renewal/${clickedRenewal?._id}`,
        { notes: newNotes },
        getHeaders(),
      );
      setExcelData((prev) =>
        prev.map((item) =>
          item._id === clickedRenewal?._id
            ? { ...item, notes: newNotes }
            : item,
        ),
      );
      toast.success("Notes updated successfully");
      setNotesPopupOpen(false);
    } catch (error) {
      console.error("Error updating renewal status:", error);
    }
  };

  const handleReminderDateChange = async (renewalId, date) => {
    if (moment(date).isBefore(moment().format("YYYY-MM-DD"))) {
      toast.error("Reminder date cannot be in the past");
      return;
    }
    try {
      const { data: data } = await axios.put(
        `${API_URI}/renewal/${renewalId}`,
        { reminderDate: moment(date).toDate(), status: "Reminder Set" },
        getHeaders(),
      );
      setExcelData((prev) =>
        prev.map((item) =>
          item._id === renewalId
            ? {
                ...item,
                reminderDate: date,
                status: "Reminder Set",
              }
            : item,
        ),
      );
    } catch (error) {
      console.error("Error updating reminder date:", error);
    }
  };

  const handleAgentUpdate = async (agentId) => {
    console.log(selectedRenewal, agentId);
    // return;
    try {
      const { data } = await axios.put(
        `${API_URI}/renewal/${selectedRenewal?._id}`,
        {
          agent: agentId,
          ...(selectedRenewal?.status == "Unassigned" && {
            status: "Not Contacted",
          }),
        },
        getHeaders(),
      );
      setExcelData((prev) =>
        prev.map((item) =>
          item._id === selectedRenewal?._id
            ? {
                ...item,
                agent: agentId,
                ...(selectedRenewal?.status == "Unassigned" && {
                  status: "Not Contacted",
                }),
              }
            : item,
        ),
      );
      toast.success("Agent updated successfully");
    } catch (error) {
      console.error("Error updating agent:", error);
    }
  };
  const handleQuotationGeneration = (renewal) => {
    console.log(renewal);
    let quotaionObj = {
      company: renewal["Company Name"],
      address: renewal["Address"],
    };
    navigate(`/quotation`, { state: { leadDetails: quotaionObj } });
  };

  const handleEditRenewal = (renewal) => {
    setEditingRenewal(renewal);
    setIsEditRenewalPopupOpen(true);
  };

  const handleRenewalSuccess = () => {
    // Refresh the renewals list
    fetchAllLeads(1);
  };

  const statusOptions = LEAD_STATUS;

  // console.log(headers, excelData);
  const [filterLoading, setFilterLoading] = useState(false);

  // Modified fetchAllLeads to show filter loading state
  async function fetchAllLeadsWithLoading(pageNum = 1) {
    if (loading) return;
    setFilterLoading(true);
    try {
      await fetchAllLeads(pageNum);
    } finally {
      setFilterLoading(false);
    }
  }
  console.log(filter);
  return (
    <div>
      <BackHeader
        onClick={handleUploadClick}
        title="Renewal & Survey"
        showBtn={!isAgent && !isSalesManager}
        addbuttonText={"Upload Excel"}
      >
        <div className="flex items-center gap-2 mr-4">
          {/* Add Renewal Button */}
          {!isAgent && !isSalesManager && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => setIsAddRenewalPopupOpen(true)}
              sx={{ mr: 2 }}
            >
              Add Renewal
            </Button>
          )}

          {[
            // { label: "Issue Date", type: "issue_date" },
            { label: "First Survey", type: "first_survey" },
            { label: "Second Survey", type: "second_survey" },
            { label: "Expiry Date", type: "expiry_date" },
          ].map((item, i) => (
            <Button
              key={i}
              variant={filter.type === item.type ? "contained" : "outlined"}
              size="small"
              onClick={() => {
                setFilterLoading(true);
                if (filter.type === item.type) {
                  setFilter({ type: null, label: null });
                } else {
                  setFilter({ type: item.type, label: item.label });
                  setExcelData([]);
                }
              }}
              disabled={filterLoading}
              startIcon={
                filterLoading && filter.type === item.type ? (
                  <CircularProgress size={14} color="inherit" />
                ) : null
              }
              sx={{
                minWidth: "auto",
                backgroundColor:
                  filter.type === item.type ? "#4CAF50" : "transparent",
                color: filter.type === item.type ? "white" : "primary.main",
                fontWeight: filter.type === item.type ? "bold" : "normal",
                border:
                  filter.type === item.type
                    ? "1px solid #4CAF50"
                    : "1px solid rgba(25, 118, 210, 0.5)",
                "&:hover": {
                  backgroundColor:
                    filter.type === item.type
                      ? "#3e8e41"
                      : "rgba(25, 118, 210, 0.04)",
                  border:
                    filter.type === item.type
                      ? "1px solid #3e8e41"
                      : "1px solid rgba(25, 118, 210, 0.5)",
                },
                transition: "all 0.3s ease",
                boxShadow:
                  filter.type === item.type
                    ? "0 2px 4px rgba(0,0,0,0.2)"
                    : "none",
                padding: "4px 10px",
                marginRight: "4px",
                borderRadius: "4px",
              }}
            >
              {item.label}
            </Button>
          ))}
          {filter.type && (
            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={() => {
                setFilterLoading(true);
                setFilter({ type: null, label: null });
                setExcelData([]);
              }}
              disabled={filterLoading}
              startIcon={
                filterLoading && filter.type === null ? (
                  <CircularProgress size={14} color="inherit" />
                ) : null
              }
              sx={{
                minWidth: "auto",
                padding: "4px 10px",
                marginLeft: "8px",
                border: "1px solid #f44336",
                "&:hover": {
                  backgroundColor: "rgba(244, 67, 54, 0.04)",
                  border: "1px solid #d32f2f",
                },
              }}
            >
              Clear Filter
            </Button>
          )}
          <div>
            <Autocomplete
              id="combo-box-demo"
              options={agentList}
              getOptionLabel={(option) => option.name}
              style={{ minWidth: 200 }}
              onChange={(e, val) => {
                val && handleMultiAgentAssign(val._id);
              }}
              disabled={selectedRenewals.length === 0}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={`Assign Agent${selectedRenewals.length > 0 ? ` (${selectedRenewals.length} selected)` : ""}`}
                  variant="outlined"
                  size="small"
                />
              )}
            />
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <TextField
              label="Search"
              size="small"
              placeholder="Search By Company, Phone number"
              onChange={DEBOUNCE((e) => setSearch(e.target.value), 500)}
            />
            <Button
              variant="outlined"
              onClick={() => setFilterPopupOpen(true)}
              size="small"
              startIcon={<FiFilter />}
              sx={{
                borderColor:
                  yearFilter || monthFilter ? "primary.main" : "grey.300",
                color: yearFilter || monthFilter ? "primary.main" : "grey.700",
                "&:hover": {
                  borderColor:
                    yearFilter || monthFilter ? "primary.dark" : "grey.400",
                },
              }}
            >
              {yearFilter || monthFilter ? "Filters Applied" : "Filter"}
            </Button>

            {/* Filter Popup */}
            <Dialog
              open={filterPopupOpen}
              onClose={() => setFilterPopupOpen(false)}
              maxWidth="xs"
              fullWidth
            >
              <DialogTitle>Filter Renewals</DialogTitle>
              <DialogContent>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12}>
                    <TextField
                      select
                      fullWidth
                      label="Year"
                      value={yearFilter}
                      onChange={(e) => setYearFilter(e.target.value)}
                      size="small"
                    >
                      <MenuItem value="">Any Year</MenuItem>
                      {[2020, 2021, 2022, 2023, 2024, 2025, 2026].map(
                        (year) => (
                          <MenuItem key={year} value={year}>
                            {year}
                          </MenuItem>
                        ),
                      )}
                    </TextField>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      select
                      fullWidth
                      label="Month"
                      value={monthFilter}
                      onChange={(e) => setMonthFilter(e.target.value)}
                      size="small"
                    >
                      <MenuItem value="">Any Month</MenuItem>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(
                        (month) => (
                          <MenuItem key={month} value={month}>
                            {new Date(2000, month - 1, 1).toLocaleString(
                              "default",
                              { month: "long" },
                            )}
                          </MenuItem>
                        ),
                      )}
                    </TextField>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      select
                      fullWidth
                      label="Status"
                      value={filter.status}
                      onChange={(e) =>
                        setFilter((prev) => ({
                          ...prev,
                          status: e.target.value,
                        }))
                      }
                      size="small"
                    >
                      <MenuItem value="">Any Status</MenuItem>
                      {statusOptions.map((status) => (
                        <MenuItem key={status} value={status}>
                          {status}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={() => {
                    setYearFilter("");
                    setMonthFilter("");
                    setFilter((prev) => ({ ...prev, status: "" }));
                  }}
                  color="error"
                >
                  Clear
                </Button>
                <Button onClick={() => setFilterPopupOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => setFilterPopupOpen(false)}
                  variant="contained"
                >
                  Apply
                </Button>
              </DialogActions>
            </Dialog>
          </div>
        </div>
      </BackHeader>

      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
        accept=".xlsx, .xls, .csv"
      />

      {/* Upload Excel Popup */}
      <Dialog
        open={showUploadPopup}
        onClose={() => setShowUploadPopup(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Upload Excel File</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Typography variant="body1" gutterBottom>
                Please download the sample file to see the required format or
                upload your Excel file directly.
              </Typography>
            </Grid>
            <Grid
              item
              xs={12}
              sx={{ display: "flex", justifyContent: "center", gap: 2 }}
            >
              <Button
                variant="outlined"
                color="primary"
                onClick={handleDownloadSample}
                startIcon={<FiDownload />}
              >
                Download Sample
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleActualUploadClick}
                startIcon={<FiUpload />}
              >
                Upload Excel
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowUploadPopup(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Box sx={{ padding: "20px" }}>
        {/* Active Filter Indicator */}
        {filter.type && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              mb: 2,
              p: 1,
              borderRadius: 1,
              bgcolor: "rgba(76, 175, 80, 0.1)",
              border: "1px solid rgba(76, 175, 80, 0.3)",
              width: "fit-content",
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: "#4CAF50",
                fontWeight: "medium",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Box component="span" sx={{ mr: 1 }}>
                🔍
              </Box>
              Filtering by: {filter.label}
            </Typography>
          </Box>
        )}

        {initialLoading ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              height: "calc(100vh - 200px)",
            }}
          >
            <CircularProgress size={40} />
            <Typography variant="body1" sx={{ mt: 2 }}>
              Loading data...
            </Typography>
          </Box>
        ) : excelData.length > 0 ? (
          <Box>
            <Box sx={{ width: "100%", overflowX: "auto" }}>
              <TableContainer
                component={Paper}
                sx={{
                  maxHeight: 600,
                  overflowX: "auto",
                  width: "max-content",
                  minWidth: "100%",
                }}
                ref={tableContainerRef}
              >
                <Table stickyHeader size="small" aria-label="renewal table">
                  <TableHead>
                    <TableRow>
                      <TableCell
                        padding="checkbox"
                        sx={{
                          backgroundColor: "#FFFFFF",
                          borderBottom: "1px solid #E0E0E0",
                        }}
                      >
                        <Checkbox
                          indeterminate={
                            selectedRenewals.length > 0 &&
                            selectedRenewals.length < excelData.length
                          }
                          checked={
                            excelData.length > 0 &&
                            selectedRenewals.length === excelData.length
                          }
                          onChange={handleSelectAllClick}
                        />
                      </TableCell>
                      {/* <TableCell
                      align="left"
                      className="uppercase"
                      sx={{
                        fontWeight: "600",
                        backgroundColor: "#FFFFFF",
                        color: "#555555",
                        fontSize: "14px",
                        whiteSpace: "nowrap",
                        textDecoration: "uppercase",
                        height: "40px",
                        padding: "0 16px",
                        borderBottom: "1px solid #E0E0E0",
                      }}
                    >
                      S.No
                    </TableCell> */}
                      {[
                        ...headers,
                        "Agent",
                        "Status",
                        "Quotation",
                        "Notes",
                        "Reminder",
                        "Actions",
                      ].map((header, index) => (
                        <TableCell
                          key={index}
                          align="left"
                          className="uppercase"
                          sx={{
                            fontWeight: "600",
                            backgroundColor: "#FFFFFF",
                            color: "#555555",
                            fontSize: "14px",
                            whiteSpace: "nowrap",
                            textDecoration: "uppercase",
                            height: "40px",
                            padding: "0 16px",
                            borderBottom: "1px solid #E0E0E0",
                          }}
                        >
                          {(header?.label || header).split("_").join(".")}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {excelData.map((row, rowIndex) => (
                      <TableRow
                        key={rowIndex}
                        sx={{
                          backgroundColor:
                            rowIndex % 2 === 0 ? "#FFFFFF" : "#F9F9F9",
                          height: "42px",
                          "&:hover": { backgroundColor: "#F5F5F5" },
                          borderBottom: "4px solid #f3f3f3",
                        }}
                        selected={isSelected(row._id)}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={isSelected(row._id)}
                            onChange={(event) =>
                              handleRowSelect(event, row._id)
                            }
                          />
                        </TableCell>
                        {/* <TableCell
                        sx={{
                          fontSize: "14px",
                          height: "42px",
                          padding: "8px 16px",
                        }}
                      >
                        {rowIndex + 1}
                      </TableCell> */}
                        {headers.map((header, cellIndex) => (
                          <TableCell
                            key={cellIndex}
                            sx={{
                              fontSize: "14px",
                              height: "42px",
                              padding: "8px 16px",
                              maxWidth: "200px",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            <Tooltip
                              placement="bottom-start"
                              title={row[header?.key || header]}
                            >
                              {row[header?.key || header]}
                            </Tooltip>
                          </TableCell>
                        ))}
                        <TableCell>
                          <div className="flex  items-center justify-end">
                            <span>
                              {" "}
                              {row?.agent
                                ? agentList.find((v) => v?._id == row?.agent)
                                    ?.name
                                : ""}
                            </span>
                            {user?.type === "admin" && (
                              <span
                                className="px-1.5 py-1 text-sm rounded-xl border ml-4 hover:cursor-pointer text-purple-600 border-purple-600 bg-purple-100"
                                onClick={() => handleAssignClick(row)}
                              >
                                {row.agent ? "Reassign" : "Assign"}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={row.status || "Pending"}
                            onChange={(e) =>
                              handleStatusChange(row._id, e.target.value)
                            }
                            className={`${
                              statusColorMap[row?.status]
                            } text-white rounded-xl w-32`}
                            sx={{
                              color: "white",
                              height: "1.75rem",
                              fontSize: "0.75rem",
                              padding: 0,
                              ".MuiOutlinedInput-notchedOutline": {
                                borderColor: "transparent",
                              },
                              "&:hover .MuiOutlinedInput-notchedOutline": {
                                borderColor: "transparent",
                              },
                              "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                {
                                  borderColor: "transparent",
                                },
                              ".MuiSvgIcon-root": {
                                color: "white",
                                fontSize: "1.125rem",
                              },
                              ".MuiSelect-select": {
                                padding: "0.25rem 0.5rem",
                              },
                            }}
                            size="small"
                          >
                            {statusOptions
                              .filter((v) =>
                                isAgent ? v != "Unassigned" : true,
                              )
                              .map((status) => (
                                <MenuItem
                                  key={status}
                                  value={status}
                                  className={`${statusColorMap[status]}`}
                                  size="small"
                                >
                                  {status}
                                </MenuItem>
                              ))}
                          </Select>
                        </TableCell>
                        <TableCell>
                          <div
                            className="w-min text-center mx-auto hover:cursor-pointer"
                            onClick={() => handleQuotationGeneration(row)}
                          >
                            <HiMiniClipboardDocumentList />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div
                            className="w-min text-center mx-auto hover:cursor-pointer"
                            onClick={() => handleNotesClick(row)}
                          >
                            <TbNotes />
                          </div>
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="date"
                            size="small"
                            value={
                              row.reminderDate
                                ? moment(row.reminderDate).format("YYYY-MM-DD")
                                : ""
                            }
                            onChange={(e) =>
                              handleReminderDateChange(row._id, e.target.value)
                            }
                            sx={{ width: "150px" }}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {(user?.type === "admin" ||
                              user?.type === "backend") && (
                              <Button
                                variant="outlined"
                                size="small"
                                onClick={() => handleEditRenewal(row)}
                                sx={{ minWidth: "auto", px: 1 }}
                              >
                                Edit
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {loading && hasMore && (
                      <TableRow>
                        <TableCell
                          colSpan={headers.length + 6}
                          align="center"
                          sx={{ py: 3 }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                          >
                            <CircularProgress size={24} />
                            <Typography
                              color="black"
                              variant="body2"
                              sx={{ ml: 2 }}
                            >
                              Loading more data...
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
            <Box className={"mt-4 flex justify-center w-full "}>
              <Pagination
                count={totalPages}
                onChange={(e, page) => fetchAllLeads(page)}
                variant="outlined"
                color="primary"
              />
            </Box>
          </Box>
        ) : (
          <Box sx={{ textAlign: "center", marginTop: "50px" }}>
            {!isAgent && !isBackend && !isSalesManager && (
              <>
                <Typography variant="h6" color="text.secondary">
                  Upload an Excel file to view data
                </Typography>
                <Button
                  variant="contained"
                  sx={{ marginTop: "20px" }}
                  onClick={handleUploadClick}
                >
                  Upload Excel
                </Button>
              </>
            )}
          </Box>
        )}
      </Box>

      {isPopupOpen && (
        <AddLeadPopup
          isOpen={isPopupOpen}
          onClose={() => setIsPopupOpen(false)}
          agents={agentList} // Pass your agents list here
          editMode={true}
          leadData={selectedRenewal}
          fetchLeads={fetchAllLeads}
          setLeadData={setExcelData}
          isRenewal={true}
          handleAgentUpdate={handleAgentUpdate}
        />
      )}

      {notesPopupOpen && (
        <NotesPopup
          isOpen={notesPopupOpen}
          leadId={clickedRenewal?._id}
          setLeadData={setExcelData}
          prevNotes={clickedRenewal?.notes}
          onClose={() => setNotesPopupOpen(false)}
          isRenewal={true}
          handleNotesChange={handleNotesChange}
        />
      )}

      {/* Add Renewal Popup */}
      <AddRenewalPopup
        isOpen={isAddRenewalPopupOpen}
        onClose={() => setIsAddRenewalPopupOpen(false)}
        editMode={false}
        onSuccess={handleRenewalSuccess}
      />

      {/* Edit Renewal Popup */}
      <AddRenewalPopup
        isOpen={isEditRenewalPopupOpen}
        onClose={() => setIsEditRenewalPopupOpen(false)}
        editMode={true}
        renewalData={editingRenewal}
        onSuccess={handleRenewalSuccess}
      />
    </div>
  );
}
