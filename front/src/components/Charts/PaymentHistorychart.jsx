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
// import { DatePickerToolbar } from "@mui/x-date-pickers";

const PaymentHistorychart = () => {
  const [tableHeaders] = useState(PAYMENT_HISTORY_TABLE_HEADERS);
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

  //   console.log("PaymentHistorychart", data);
  return (
    <>
      <Typography variant="h6" align="center" color="black" gutterBottom>
        {"Payment Recieved"}
      </Typography>

      {/* Filter controls */}
      <div className="flex flex-col justify-between gap-2 w-[100%] overflow-x-auto">
        <div>
          <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-md shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center">
                <span className="font-medium text-gray-700 mr-4">
                  Filter by:
                </span>

                <div className="flex items-center gap-2 mr-4">
                  <label
                    htmlFor="year-select"
                    className="text-gray-600 font-medium"
                  >
                    Year:
                  </label>
                  <select
                    id="year-select"
                    value={filter.year}
                    onChange={(e) =>
                      setFilter({ ...filter, year: e.target.value })
                    }
                    className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">All Years</option>
                    {(() => {
                      const years = [];
                      const currentYear = new Date().getFullYear();
                      for (let year = 2024; year <= currentYear; year++) {
                        years.push(
                          <option key={year} value={year.toString()}>
                            {year}
                          </option>,
                        );
                      }
                      return years;
                    })()}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <label
                    htmlFor="month-select"
                    className="text-gray-600 font-medium"
                  >
                    Month:
                  </label>
                  <select
                    id="month-select"
                    value={filter.month}
                    onChange={(e) =>
                      setFilter({ ...filter, month: e.target.value })
                    }
                    className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">All Months</option>
                    <option value="1">January</option>
                    <option value="2">February</option>
                    <option value="3">March</option>
                    <option value="4">April</option>
                    <option value="5">May</option>
                    <option value="6">June</option>
                    <option value="7">July</option>
                    <option value="8">August</option>
                    <option value="9">September</option>
                    <option value="10">October</option>
                    <option value="11">November</option>
                    <option value="12">December</option>
                  </select>
                </div>
              </div>

              {(filter.year || filter.month) && (
                <button
                  onClick={clearFilters}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded text-sm transition-colors duration-200 flex items-center"
                >
                  <span>Clear All Filters</span>
                </button>
              )}
            </div>

            <div className="mt-2 pt-2 border-t border-gray-200 flex flex-wrap justify-between gap-2">
              {(filter.year || filter.month) && (
                <div className="flex gap-2">
                  <span className="text-sm text-gray-600">Active filters:</span>
                  <div className="flex flex-wrap gap-2">
                    {filter.year && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Year: {filter.year}
                      </span>
                    )}
                    {filter.month && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Month:{" "}
                        {new Date(0, parseInt(filter.month) - 1).toLocaleString(
                          "default",
                          { month: "long" },
                        )}
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center text-sm text-gray-600">
                {loading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-500"
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
                    Loading...
                  </span>
                ) : (
                  <>
                    Showing{" "}
                    <span className="font-medium mx-1">
                      {filteredData.length}
                    </span>{" "}
                    records
                  </>
                )}
              </div>
            </div>
          </div>

          <TableContainer component={Paper} className="h-[55vh]">
            <Table stickyHeader aria-label="payment links table">
              <TableHead>
                <TableRow>
                  {tableHeaders.map((header, index) => (
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
                        <div className="text-gray-600">
                          Loading payment data...
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredData.length > 0 ? (
                  filteredData.map((row, rowIndex) => (
                    <TableRow key={rowIndex} className="hover:bg-gray-100">
                      {tableHeaders.map((header, cellIndex) => (
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
                              className="truncate block max-w-[150px] text-center"
                              title={row[header.label]}
                            >
                              {row[header.label]}
                            </span>
                          )}
                        </TableCell>
                      ))}
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
        </div>
        <div></div>
      </div>
    </>
  );
};

export default PaymentHistorychart;
