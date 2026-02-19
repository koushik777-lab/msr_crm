import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  TextField,
  Pagination,
} from "@mui/material";
import { FiEye, FiEdit2, FiTrash2 } from "react-icons/fi";
import MyInput from "../../components/MyInput";
import { useAuth } from "../../context/AuthContext";
import moment from "moment";

const truncateText = (text, maxLength = 20) => {
  if (!text || typeof text !== "string") return "";
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

const tableHeadersMsr = [
  "Agent Name",
  "DATE", //getFrom quotaion
  "NAME",
  "NUMBER",
  "EMAIL",
  "COMPANY NAME", //  getFrom quotaion
  "ADDRESS", // getFrom quotaion
  "LOCATION",
  "NATURE OF BUSINESS", //getFrom quotaion
  "LEAD FROM",
  "CLIENT/CONSULTANT",
  "Quotation",
  "REQUIREMENT",
  "ISO SAMPLES CERTIFICATE",
  "REMARKS",
  "FEEDBACK",
  "NET QUOTATION AMOUNT",
  "ACTIONS",
];

const tableHeaderSmb = [
  "COMPANY NAME",
  "CONTACT PERSON NAME",
  "PHONE NO",
  "EMAIL",
  "DATE",
  "GSTIN",
  "DISCOUNT",
  "GST APPLICABLE",
  // "SUB TOTAL",
  // "GRAND TOTAL",
  "NET QUOTATION AMOUNT",
  "ACTIONS",
];

const tableHeadersQcci = [
  "COMPANY NAME",
  "DATE",
  "ADDRESS OF HEAD OFFICE",
  "STANDARD",
  "NO OF SITES",
  "NO OF EMPLOYEES",
  "SCOPE OF REGISTRATION",
  "CERTIFICATION BOARD",
  "CONTACT PERSON NAME",
  "PHONE NO",
  "GST APPLICABLE",
  "NET QUOTATION AMOUNT",
  "ACTIONS",
];

export default function QuotationTable({
  quotations,
  handleViewQuotation,
  handleEditQuotation,
  pagination,
  onPageChange,
  calculateTotalQuotAmt,
  IS_CLIENT_SHEET,
  quotationType,
}) {
  const { isSalesManager, isBackend } = useAuth();

  const getTableHeaders = () => {
    if (quotationType === "msr" || IS_CLIENT_SHEET) {
      return tableHeadersMsr;
    } else if (quotationType === "smb") {
      return tableHeaderSmb;
    } else if (quotationType === "qcci") {
      return tableHeadersQcci;
    }
    return [];
  };

  let TableHeaders = getTableHeaders();

  // if (IS_CLIENT_SHEET) {
  //   let temp = [
  //     "Quoted Price",
  //     "REQUIREMENT", // getFrom quotaion
  //     "ISO SAMPLES CERTIFICATE",
  //     "REMARKS",
  //     "FEEDBACK",
  //     "ACTIONS",
  //   ];
  //   TableHeaders.push(temp);
  //   TableHeaders = TableHeaders.flat();
  // }

  const fToB = {
    "Agent Name": "agentName",
    DATE: "date", //getFrom quotaion
    NAME: "name",
    "COMPANY NAME": IS_CLIENT_SHEET ? "companyName" : "company",
    ADDRESS: "address", // getFrom quotaion
    LOCATION: "location",
    "NATURE OF BUSINESS": "natureOfBusiness", //getFrom quotaion
    "LEAD FROM": "leadFrom",
    "CLIENT/CONSULTANT": "isForClient",
    NUMBER: "number",
    EMAIL: "email",
    ...(IS_CLIENT_SHEET
      ? { "Quoted Price": "orderNumber" }
      : { Quotation: "orderNumber" }),
    REQUIREMENT: "documentsRequired", // getFrom quotaion
    "ISO SAMPLES CERTIFICATE": "isoSample",
    REMARKS: "remarks",
    "NET QUOTATION AMOUNT": "netQuotAmount",
    FEEDBACK: "feedback",
    ACTIONS: "",
  };

  const getCellMaping = () => {
    if (IS_CLIENT_SHEET || quotationType === "msr") {
      return fToB;
    } else if (quotationType === "smb") {
      return {
        "COMPANY NAME": "companyName",
        "CONTACT PERSON NAME": "contactPersonName",
        "PHONE NO": "phoneNo",
        EMAIL: "email",
        DATE: "date",
        GSTIN: "gstin",
        DISCOUNT: "discount",
        "GST APPLICABLE": "gstApplicable",
        // "SUB TOTAL": "subTotal",
        // "GRAND TOTAL": "grandTotal",
        "NET QUOTATION AMOUNT": "netQuotAmount",
        ACTIONS: "",
      };
    } else if (quotationType === "qcci") {
      return {
        "COMPANY NAME": "companyName",
        DATE: "date",
        "ADDRESS OF HEAD OFFICE": "addressOfHeadOffice",
        STANDARD: "standard",
        "NO OF SITES": "noOfSites",
        "NO OF EMPLOYEES": "noOfEmployees",
        "SCOPE OF REGISTRATION": "scopeOfRegistration",
        "CERTIFICATION BOARD": "certificationBoard",
        "CONTACT PERSON NAME": "contactPersonName",
        "PHONE NO": "phoneNo",
        "GST APPLICABLE": "gstApplicable",
        "NET QUOTATION AMOUNT": "netQuotAmount",
        ACTIONS: "",
      };
    }
    return {};
  };
  return (
    <div>
      <TableContainer component={Paper} className="h-[70vh] overflow-x-auto">
        <Table stickyHeader size="small" aria-label="quotations table">
          <TableHead>
            <TableRow>
              {TableHeaders.map((header, index) => (
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
                    ...(header === "ACTIONS" && {
                      position: "sticky",
                      right: 0,
                      backgroundColor: "#FFFFFF",
                      borderLeft: "1px solid #E0E0E0",
                      zIndex: 3,
                    }),
                  }}
                >
                  {header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {quotations
              .filter((v) =>
                isSalesManager
                  ? v.agentName != "admin"
                  : isBackend
                    ? v.agentName == "Backend"
                    : true,
              )
              ?.map((row, rowIndex) => (
                <TableRow
                  key={rowIndex}
                  sx={{
                    backgroundColor: rowIndex % 2 === 0 ? "#FFFFFF" : "#F9F9F9",
                    height: "42px",
                    "&:hover": { backgroundColor: "#F5F5F5" },
                    borderBottom: "4px solid #f3f3f3",
                  }}
                >
                  {TableHeaders.map((header, cellIndex) => (
                    <TableCell
                      key={cellIndex}
                      sx={{
                        fontSize: "14px",
                        height: "42px",
                        padding: "8px 16px",
                        maxWidth: "250px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        ...(header === "ACTIONS" && {
                          position: "sticky",
                          right: 0,
                          backgroundColor:
                            rowIndex % 2 === 0 ? "#FFFFFF" : "#F9F9F9",
                          borderLeft: "1px solid #E0E0E0",
                          zIndex: 1,
                        }),
                      }}
                    >
                      {header == "ACTIONS" ? (
                        <span className="flex gap-3">
                          <>
                            <FiEdit2
                              onClick={() => handleEditQuotation(row)}
                              className="text-green-500 hover:text-green-700 cursor-pointer w-5 h-5"
                            />
                            {!row?.isManuallyCreated && (
                              <FiEye
                                onClick={() => handleViewQuotation(row)}
                                className="text-blue-500 hover:text-blue-700 cursor-pointer w-5 h-5"
                              />
                            )}
                          </>
                        </span>
                      ) : header == "REQUIREMENT" ? (
                        <Tooltip
                          title={row[getCellMaping()[header]]?.join(", ") || ""}
                        >
                          <span className="block truncate">
                            {truncateText(
                              row[getCellMaping()[header]]?.join(", "),
                            )}
                          </span>
                        </Tooltip>
                      ) : header == "CLIENT/CONSULTANT" ? (
                        <span className="block truncate">
                          {row[getCellMaping()[header]] == true
                            ? "Client"
                            : row[getCellMaping()[header]] == false
                              ? "Consultant"
                              : ""}
                        </span>
                      ) : header == "NET QUOTATION AMOUNT" ? (
                        <span className="block truncate">
                          {row?.currencyType === "USD" ? "$" : "₹"}{" "}
                          {calculateTotalQuotAmt(row)}
                        </span>
                      ) : (
                        <Tooltip title={row[getCellMaping()[header]] || ""}>
                          <span className="block truncate">
                            {truncateText(
                              header == "DATE"
                                ? moment(row[getCellMaping()[header]]).format(
                                    "DD-MM-YYYY",
                                  )
                                : row[getCellMaping()[header]]?.toString(),
                            )}
                          </span>
                        </Tooltip>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {pagination && pagination.total > 0 && (
        <div className="flex justify-center items-center py-4">
          <Pagination
            count={Math.ceil(pagination.total / pagination.limit)}
            page={pagination.page}
            onChange={(event, page) => onPageChange(page)}
            variant="outlined"
            shape="rounded"
            color="primary"
          />
        </div>
      )}
    </div>
  );
}
