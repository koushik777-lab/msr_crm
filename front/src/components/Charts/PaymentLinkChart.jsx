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
} from "@mui/material";
import { FiEye } from "react-icons/fi";
import { PAYMENT_LINK_TABLE_HEADERS } from "../../constants/constant";
import PaymentLinkPopup from "../Popups/PaymentLinkPopup";

const PaymentLinkChart = ({ dashboardData }) => {
  console.log("PaymentLinkChart", dashboardData);
  const [tableHeaders] = useState(PAYMENT_LINK_TABLE_HEADERS);
  const [selectedLink, setSelectedLink] = useState({});
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

  return (
    <>
      <Typography variant="h6" align="center" color="black" gutterBottom>
        {"Payment Links"}
      </Typography>
      <TableContainer component={Paper} className="h-[55vh] max-w-[25vw]">
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
            {dashboardData.map((row, rowIndex) => (
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

export default PaymentLinkChart;
