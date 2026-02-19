import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
} from "@mui/material";
import { FiEye } from "react-icons/fi";
import {
  PAYMENT_HISTORY_TABLE_HEADERS,
  PAYMENT_HISTORY_TOTAL_TABLE_HEADERS,
} from "../../constants/constant";
import PaymentLinkPopup from "../Popups/PaymentLinkPopup";
import axios from "axios";
import { API_URI } from "../../utils/constants";
import { getHeaders } from "../../utils/helpers";
import { useAuth } from "../../context/AuthContext";

const PaymentHistoryTotal = () => {
  const [tableHeaders] = useState(PAYMENT_HISTORY_TOTAL_TABLE_HEADERS);
  const [selectedLink, setSelectedLink] = useState({});
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filter, setFilter] = useState({
    year: "",
    month: "",
  });
  const { isAgent, user, isSalesManager, isBackend } = useAuth();
  // const [tableBody, setTableBody] = useState(dashboardData || []);
  const [showPopup, setShowPopup] = useState(false);

  const handleLinkClick = (link) => {
    console.log("Link clicked", link);
    setSelectedLink(link);
    setShowPopup(true);
  };

  // Helper function to truncate text
  const truncateText = (text, maxLength = 20) => {
    if (!text || typeof text !== "string") return "";
    return text.length > maxLength
      ? `${text.substring(0, maxLength)}...`
      : text;
  };

  const [loading, setLoading] = useState(false);

  async function fetchdata() {
    setLoading(true);
    try {
      // Build query parameters for filtering
      const queryParams = new URLSearchParams();

      if (filter.year) {
        queryParams.append("year", filter.year);
      }

      if (filter.month) {
        queryParams.append("month", filter.month);
      }

      const queryString = queryParams.toString();
      const url = queryString
        ? `${API_URI}/payment-history-dashboard?${queryString}`
        : `${API_URI}/payment-history-dashboard`;

      const { data } = await axios.get(url, getHeaders());
      let temp = [...data?.data];

      if (isAgent) {
        temp = temp.filter((item) => item?.agent == user?.name);
      } else if (isSalesManager) {
        temp = temp.filter((item) => item?.agent != "admin");
      }
      let total = 0,
        count = 0,
        month = 0;
      for (let i = 0; i < temp.length; i++) {
        total += Number(temp[i]?.today?.split("(₹")?.[1]?.split(")")[0]);
        count += Number(temp[i]?.count?.split("(₹")?.[1]?.split(")")[0]);
        month += Number(temp[i]?.month?.split("(₹")?.[1]?.split(")")[0]);
      }

      temp.push({
        agent: "TOTAL",
        today: "₹" + total.toLocaleString(),
        count: "₹" + count.toLocaleString(),
        month: "₹" + month.toLocaleString(),
      });

      setData(temp);
      setFilteredData(temp);
    } catch (error) {
      console.error("Error fetching Payment Received data:", error);
    } finally {
      setLoading(false);
    }
  }

  // Clear all filters and fetch fresh data
  const clearFilters = () => {
    setFilter({ year: "", month: "" });
    // The useEffect will trigger a new API call when filter state changes
  };

  // Fetch data when component mounts or filters change
  useEffect(() => {
    fetchdata();
  }, [filter.year, filter.month]);
  return (
    <>
      <Typography variant="h6" align="center" color="black" gutterBottom>
        {"Payment Recieved"}
      </Typography>

      <TableContainer component={Paper} className="h-[55vh] max-w-[30vw]">
        <Table stickyHeader aria-label="payment links table">
          <TableHead>
            <TableRow>
              {PAYMENT_HISTORY_TOTAL_TABLE_HEADERS.map((header, index) => (
                <TableCell
                  key={index}
                  align={header.align || "left"}
                  className="uppercase"
                  sx={{
                    fontWeight: "bold",
                    backgroundColor: "#e3f2fd",
                    color: "#1976d2",
                    fontSize: "16px",
                    whiteSpace: "nowrap",
                    textDecoration: "uppercase",
                  }}
                >
                  {header.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={tableHeaders.length}
                  align="center"
                  sx={{ py: 5 }}
                >
                  <div className="flex flex-col items-center justify-center">
                    <svg
                      className="animate-spin h-10 w-10 text-blue-500 mb-3"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <div className="text-gray-600">Loading payment data...</div>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredData.length > 0 ? (
              filteredData.map((row, rowIndex) => (
                <TableRow key={rowIndex} className="hover:bg-gray-100">
                  {PAYMENT_HISTORY_TOTAL_TABLE_HEADERS.map(
                    (header, cellIndex) => (
                      <TableCell
                        key={cellIndex}
                        align={header.align || "left"}
                        sx={{ fontSize: "16px" }}
                      >
                        {header.label === "actions" ? (
                          <div className="flex justify-center gap-2">
                            <IconButton
                              size="small"
                              onClick={() => handleLinkClick(row)}
                            >
                              <FiEye className="text-green-500" />
                            </IconButton>
                          </div>
                        ) : (
                          <span
                            className="truncate block max-w-[150px] "
                            title={row[header.label]}
                          >
                            {row[header.label]}
                          </span>
                        )}
                      </TableCell>
                    ),
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={tableHeaders.length}
                  align="center"
                  sx={{ py: 3 }}
                >
                  No data matching the selected filters
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {showPopup && (
          <PaymentLinkPopup
            linkId={selectedLink._id}
            isOpen={showPopup}
            onClose={() => setShowPopup(false)}
          />
        )}
      </TableContainer>
    </>
  );
};

export default PaymentHistoryTotal;
