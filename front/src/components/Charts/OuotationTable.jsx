import React, { useState } from "react";
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
  Button,
} from "@mui/material";
import { FiEye } from "react-icons/fi";
import { PAYMENT_LINK_TABLE_HEADERS } from "../../constants/constant";
import {
  FiUser,
  FiPhone,
  FiHome,
  FiFileText,
  FiBriefcase,
} from "react-icons/fi";
import { pdf } from "@react-pdf/renderer";
import { QuotationDocument } from "../../pages/quotation/pdfGeneration";
import { useAuth } from "../../context/AuthContext";

const OuotationTable = ({ dashboardData, quotations }) => {
  const [tableHeaders] = useState(PAYMENT_LINK_TABLE_HEADERS);
  const [selectedLink, setSelectedLink] = useState([]);
  // const [tableBody, setTableBody] = useState(dashboardData || []);
  const [showPopup, setShowPopup] = useState(false);
  const { isAgent, isSalesManager } = useAuth();

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
  let newTB = !isAgent
    ? isSalesManager
      ? [
          {
            agent: "Sales Manager",
            count: "0",
            _id: "12345",
          },
          ...dashboardData,
        ]
      : [
          {
            agent: "admin",
            count: "0",
            _id: "1234",
          },
          {
            agent: "Sales Manager",
            count: "0",
            _id: "12345",
          },
          ...dashboardData,
        ]
    : [...dashboardData];
  // console.log(dashboardData, quotations , newTB);
  return (
    <>
      <div className="basis-1/3">
        <Typography variant="h6" align="center" color="black" gutterBottom>
          {"Quotation Generated"}
        </Typography>
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
              {newTB.map((row, rowIndex) => (
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
                            onClick={() =>
                              handleLinkClick(quotations[row.agent])
                            }
                          >
                            <FiEye className="text-green-500" />
                          </IconButton>
                        </div>
                      ) : header.label === "count" ? (
                        <span
                          className="truncate block max-w-[150px]"
                          title={row[header.label]}
                        >
                          {quotations[row.agent]
                            ? quotations[row.agent].length
                            : 0}
                        </span>
                      ) : header.label === "today" ? (
                        <span
                          className="truncate block max-w-[150px]"
                          title={row[header.label]}
                        >
                          {quotations[row.agent]
                            ? quotations[row.agent].filter((quote) => {
                                const quoteDate = new Date(quote.createdAt);
                                const today = new Date();
                                return (
                                  quoteDate.setHours(0, 0, 0, 0) ===
                                  today.setHours(0, 0, 0, 0)
                                );
                              }).length
                            : 0}
                        </span>
                      ) : header.label === "month" ? (
                        <span
                          className="truncate block max-w-[150px]"
                          title={row[header.label]}
                        >
                          {quotations[row.agent]
                            ? quotations[row.agent].filter((quote) => {
                                const quoteDate = new Date(quote.createdAt);
                                const today = new Date();
                                return (
                                  quoteDate.getMonth() === today.getMonth() &&
                                  quoteDate.getFullYear() ===
                                    today.getFullYear()
                                );
                              }).length
                            : 0}
                        </span>
                      ) : (
                        <span
                          className="truncate block max-w-[150px]"
                          title={row[header.label]}
                        >
                          {truncateText(row[header.label])}
                        </span>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {showPopup && (
            <OuotationPopUp
              isOpen={showPopup}
              onClose={() => setShowPopup(false)}
              data={selectedLink}
            />
          )}
        </TableContainer>
      </div>
    </>
  );
};

function OuotationPopUp({ isOpen, onClose, data }) {
  return (
    <div
      className={`fixed inset-0  bg-black/60  z-50 flex items-center justify-center transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div
        className="bg-white rounded-lg p-6 w-full max-w-3xl mx-4 shadow-2xl transform transition-transform duration-300 ease-in-out"
        style={{
          maxHeight: "85vh",
          overflowY: "auto",
          animation: isOpen ? "popup-in 0.3s ease-out forwards" : "none",
        }}
      >
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h2 className="text-2xl font-bold text-blue-700">
            Quotation Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-600 transition-colors bg-gray-100 hover:bg-gray-200 rounded-full p-2"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {data && data.length > 0 ? (
            data.map((item, index) => (
              <QuotationCard key={item._id || index} data={item} />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No quotation details available</p>
            </div>
          )}
        </div>

        <div className="mt-8 flex justify-end pt-4 border-t">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

const QuotationCard = ({ data }) => {
  if (!data) return null;
  console.log(data);

  return (
    <div className="bg-white rounded-lg p-5 mb-4 shadow-md border-l-4 border-blue-600 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-start space-x-3">
          <div className="text-blue-600 mt-1">
            <FiFileText size={18} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Quotation ID</p>
            <p className="font-semibold text-lg">{data.orderNumber}</p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <div className="text-blue-600 mt-1">
            <FiBriefcase size={18} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Company</p>
            <p className="font-semibold">{data.companyName}</p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <div className="text-blue-600 mt-1">
            <FiUser size={18} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Agent</p>
            <p className="font-semibold capitalize">{data.agentName}</p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <div className="text-blue-600 mt-1">
            <FiUser size={18} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Contact Person</p>
            <p className="font-semibold">{data.personDetails?.name || "N/A"}</p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <div className="text-blue-600 mt-1">
            <FiPhone size={18} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Contact Number</p>
            <p className="font-semibold">
              {data.personDetails?.phoneNumber || "N/A"}
            </p>
          </div>
        </div>
        {!data?.isManuallyCreated && (
          <Button
            onClick={async () => {
              const blob = await pdf(
                <QuotationDocument orderNo={data.orderNumber} form={data} />,
              ).toBlob();
              const url = URL.createObjectURL(blob);
              window.open(url, "_blank");
            }}
            variant="contained"
          >
            View Quotation
          </Button>
        )}
      </div>
    </div>
  );
};

export default OuotationTable;
