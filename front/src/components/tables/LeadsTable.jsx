import axios from "axios";
import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  Select,
  MenuItem,
  Tooltip,
  TextField,
} from "@mui/material";
import { FiEye, FiClock } from "react-icons/fi";
import { TbNotes } from "react-icons/tb";
import { useNavigate } from "react-router-dom";
import { API_URI } from "../../utils/constants";
import { getErrToast, getHeaders } from "../../utils/helpers";
import AddLeadPopup from "../Leads/AddLeadPopup";
import { useAuth } from "../../context/AuthContext";
import NotesPopup from "../../pages/leads/NotesPopup";
import { HiMiniClipboardDocumentList } from "react-icons/hi2";
import moment from "moment";
import { useAgentContext } from "../../context/AgentContext";
import { statusColorMap } from "../../constants/constant";

const LeadsTable = ({
  tableHeaders = [],
  tableBody = [],
  agents = [],
  fetchLeads,
  setLeadData,
  selectedLeads,
  setSelectedLeads,
}) => {
  // console.log(tableBody);
  tableBody = tableBody.map((v) => ({
    ...v,
    receivedDate: moment(v.createdAt).format("DD/MM/YYYY"),
  }));

  const navigate = useNavigate();
  const [clickedLead, setClickedLead] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [notesPopupOpen, setNotesPopupOpen] = useState(false);
  const [statusChanges, setStatusChanges] = useState({});
  const { user, isBackend, isAgent } = useAuth();
  const { agentList } = useAgentContext();

  const handleAssignClick = (lead) => {
    setSelectedLead(lead);
    setIsPopupOpen(true);
  };

  const handleNotesClick = (lead) => {
    setClickedLead(lead);
    setNotesPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setSelectedLead(null);
  };

  const handleCheckboxToggle = (lead) => {
    setSelectedLeads((prevSelected) => {
      if (prevSelected.some((item) => item._id === lead._id)) {
        return prevSelected.filter((item) => item._id !== lead._id);
      } else {
        return [...prevSelected, lead];
      }
    });
  };

  const isSelected = (lead) => {
    return selectedLeads.some((item) => item._id === lead._id);
  };

  const handleQuotationGeneration = (lead) => {
    navigate(`/quotation`, {
      state: { leadDetails: lead, isNewQuotation: true },
    });
  };

  const handleStatusChange = async (leadId, newStatus) => {
    // console.log(leadId, newStatus);
    try {
      await axios.put(
        `${API_URI}/lead/${leadId}`,
        { status: newStatus },
        getHeaders(),
      );
      setLeadData((prev) => {
        const updatedLeads = prev?.map((lead) => {
          if (lead._id === leadId) {
            return {
              ...lead,
              status: newStatus,
            };
          }
          return lead;
        });
        return updatedLeads;
      });
      // setStatusChanges((prev) => ({
      //   ...prev,
      //   [leadId]: newStatus,
      // }));
    } catch (error) {
      console.error("Error updating lead status: ", error);
      getErrToast("Error updating lead status");
    }
  };

  const handleReminderDateChange = async (leadId, date) => {
    if (moment(date).isBefore(moment().format("YYYY-MM-DD"))) {
      getErrToast("Reminder date cannot be in the past");
      return;
    }
    try {
      const { data } = await axios.put(
        `${API_URI}/lead/${leadId}`,
        { reminderDate: moment(date).toDate(), status: "Reminder Set" },
        getHeaders(),
      );
      setLeadData((prev) => {
        const updatedLeads = prev?.map((lead) => {
          if (lead._id === leadId) {
            return {
              ...lead,
              reminderDate: data?.updatedLead?.reminderDate,
              status: data?.updatedLead?.status,
            };
          }
          return lead;
        });
        return updatedLeads;
      });
      // setReminderDates((prev) => ({
      //   ...prev,
      //   [leadId]: date,
      // }));
    } catch (error) {
      console.error("Error updating reminder date: ", error);
      getErrToast("Error updating reminder date");
    }
  };

  const onlyAllowedAgents = [
    "Not Contactable",
    "Switch Off",
    "Call Back",
    "Follow Up",
  ];

  let statusOptions = Object.keys(statusColorMap);
  //   if(!isAgent){
  // statusOptions = statusOptions.filter(
  //     (status) =>
  //       !["Not Contactable", "Switch Off", "Call Back", "Follow Up"].includes(
  //         status,
  //       ),
  //   );
  //   }

  // Helper function to truncate text
  const truncateText = (text, maxLength = 20) => {
    if (!text || typeof text !== "string") return "";
    return text.length > maxLength
      ? `${text.substring(0, maxLength)}...`
      : text;
  };

  // Function to truncate specific fields (name, company, address) to fewer characters
  const truncateSpecificFields = (text, fieldName) => {
    if (!text || typeof text !== "string") return "";
    const shorterLength = 9; // 6-7 characters for name, company, address

    if (["name", "company", "address"].includes(fieldName)) {
      return text.length > shorterLength
        ? `${text.substring(0, shorterLength)}...`
        : text;
    }

    // For other fields, use standard truncation (20 chars)
    return text.length > 20 ? `${text.substring(0, 20)}...` : text;
  };
  console.log("tableBody", tableBody);
  return (
    <>
      <TableContainer component={Paper} className="h-[65vh]  overflow-x-auto">
        <Table stickyHeader size="small" aria-label="leads table">
          <TableHead>
            <TableRow>
              <TableCell
                padding="checkbox"
                sx={{
                  fontWeight: "bold",
                  backgroundColor: "#FFFFFF",
                  width: "48px",
                  height: "40px",
                  borderBottom: "1px solid #E0E0E0",
                  position: "sticky",
                  left: 0,
                  zIndex: 3,
                  boxShadow: "2px 0px 3px rgba(0,0,0,0.05)",
                }}
              >
                <Checkbox
                  indeterminate={
                    selectedLeads.length > 0 &&
                    selectedLeads.length < tableBody.length
                  }
                  checked={
                    selectedLeads.length > 0 &&
                    selectedLeads.length === tableBody.length
                  }
                  onChange={() => {
                    if (selectedLeads.length === tableBody.length) {
                      setSelectedLeads([]);
                    } else {
                      setSelectedLeads([...tableBody]);
                    }
                  }}
                />
              </TableCell>
              {tableHeaders.map((header, index) => (
                <TableCell
                  key={index}
                  align={header.align || "left"}
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
                  {header.label == "address" ? "State" : header.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {tableBody.map((row, rowIndex) => (
              <TableRow
                key={rowIndex}
                selected={isSelected(row)}
                sx={{
                  backgroundColor: rowIndex % 2 === 0 ? "#FFFFFF" : "#F9F9F9",
                  height: "42px", // Increased height from 36px to 42px
                  "&:hover": { backgroundColor: "#F5F5F5" },
                  borderBottom: "4px solid #f3f3f3", // Add a bottom border for spacing
                }}
              >
                <TableCell
                  padding="checkbox"
                  sx={{
                    height: "42px", // Match the increased row height
                    padding: "0 8px",
                    position: "sticky",
                    left: 0,
                    zIndex: 2,
                    backgroundColor: rowIndex % 2 === 0 ? "#FFFFFF" : "#F9F9F9",
                    "&:hover": { backgroundColor: "#F5F5F5" },
                    // boxShadow: "2px 0px 3px rgba(0,0,0,0.05)",
                  }}
                >
                  <Checkbox
                    checked={isSelected(row)}
                    onChange={() => handleCheckboxToggle(row)}
                    size="small"
                  />
                </TableCell>
                {tableHeaders.map(
                  (header, cellIndex) =>
                    header.label != "actions" && (
                      <TableCell
                        key={cellIndex}
                        align={header.align || "left"}
                        sx={{
                          fontSize: "14px",
                          height: "42px", // Match the increased row height
                          padding: "8px 16px", // Increased vertical padding from 4px to 8px
                          maxWidth:
                            header.label === "email" ||
                            header.label === "address"
                              ? "200px"
                              : header.label === "name" ||
                                  header.label === "company"
                                ? "200px"
                                : "auto",
                          whiteSpace:
                            header.label === "status" ? "nowrap" : "normal",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {header.label === "notes" && (
                          <div
                            className="w-min text-center mx-auto hover:cursor-pointer"
                            onClick={() => handleNotesClick(row)}
                          >
                            <TbNotes
                              color={row?.notes && row?.notes != "" && "red"}
                            />
                          </div>
                        )}
                        {header.label === "quotation" && (
                          <div
                            className="w-min text-center mx-auto hover:cursor-pointer"
                            onClick={() => handleQuotationGeneration(row)}
                          >
                            <HiMiniClipboardDocumentList />
                          </div>
                        )}
                        {header.label === "reminder" && (
                          <div className="flex items-center justify-center">
                            <TextField
                              type="date"
                              size="small"
                              value={
                                row.reminderDate
                                  ? moment(row.reminderDate).format(
                                      "YYYY-MM-DD",
                                    )
                                  : ""
                              }
                              onChange={(e) =>
                                handleReminderDateChange(
                                  row._id,
                                  e.target.value,
                                )
                              }
                              slotProps={{
                                input: {
                                  // InputProps={{
                                  startAdornment: (
                                    <FiClock className="mr-2 text-gray-500" />
                                  ),
                                  sx: {
                                    padding: "2px 8px",
                                    fontSize: "0.75rem",
                                    height: "28px",
                                  },
                                  // }}
                                },
                              }}
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  "& fieldset": {
                                    borderColor: "rgba(0, 0, 0, 0.15)",
                                  },
                                  "&:hover fieldset": {
                                    borderColor: "rgba(0, 0, 0, 0.3)",
                                  },
                                },
                                width: "150px",
                              }}
                            />
                          </div>
                        )}
                        {header.label !== "notes" &&
                          header.label !== "quotation" &&
                          header.label !== "reminder" && (
                            <Tooltip
                              title={
                                header.label === "status"
                                  ? ""
                                  : header.label === "agent"
                                    ? row[header.label]?.name
                                    : row[header.label]?.toString() || ""
                              }
                            >
                              {header.label === "status" ? (
                                <Select
                                  value={row[header.label]}
                                  onChange={(e) => {
                                    // if(!isAgent){
                                    // !onlyAllowedAgents.includes(e.target.value) &&
                                    handleStatusChange(row._id, e.target.value);
                                  }}
                                  // }
                                  className={`${
                                    statusColorMap[row[header.label]]
                                  } text-white rounded-xl w-32`}
                                  sx={{
                                    color: "white",
                                    height: "1.75rem",
                                    fontSize: "0.75rem",
                                    padding: 0,
                                    ".MuiOutlinedInput-notchedOutline": {
                                      borderColor: "transparent",
                                    },
                                    "&:hover .MuiOutlinedInput-notchedOutline":
                                      {
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
                                  disabled={isBackend}
                                >
                                  {statusOptions.map((status) => (
                                    <MenuItem
                                      key={status}
                                      value={status}
                                      // disabled={
                                      //   !isAgent &&
                                      //   onlyAllowedAgents.includes(status)
                                      // }
                                      className={`${statusColorMap[status]}  `}
                                    >
                                      {status}
                                    </MenuItem>
                                  ))}
                                </Select>
                              ) : (
                                <span
                                  className={`${
                                    header.label === "status"
                                      ? `${statusColorMap[row[header.label]]} text-white p-2  rounded-xl text-nowrap`
                                      : "text-ellipsis overflow-hidden"
                                  } `}
                                >
                                  {header.label === "agent"
                                    ? row[header.label]?.name || ""
                                    : typeof row[header.label] === "string"
                                      ? truncateSpecificFields(
                                          row[header.label],
                                          header.label,
                                        )
                                      : row[header.label]}{" "}
                                  {user?.type === "admin" &&
                                    header.label === "agent" &&
                                    row[header.label] !== "" && (
                                      <span
                                        className={`px-1.5 py-1 text-sm rounded-xl border ml-4 hover:cursor-pointer ${
                                          row.agent
                                            ? "text-purple-600 border-purple-600 bg-purple-100"
                                            : "text-green-600 border-green-600 bg-green-100"
                                        }`}
                                        onClick={() => handleAssignClick(row)}
                                      >
                                        {row.agent ? "Reassign" : "Assign"}
                                      </span>
                                    )}
                                </span>
                              )}
                            </Tooltip>
                          )}
                      </TableCell>
                    ),
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {isPopupOpen && (
        <AddLeadPopup
          isOpen={isPopupOpen}
          onClose={handleClosePopup}
          agents={agents || []}
          editMode={true}
          leadData={selectedLead}
          fetchLeads={fetchLeads}
          setLeadData={setLeadData}
        />
      )}
      {notesPopupOpen && (
        <NotesPopup
          isOpen={notesPopupOpen}
          leadId={clickedLead?._id}
          setLeadData={setLeadData}
          prevNotes={clickedLead?.notes}
          onClose={() => setNotesPopupOpen(false)}
        />
      )}
    </>
  );
};

export default LeadsTable;
