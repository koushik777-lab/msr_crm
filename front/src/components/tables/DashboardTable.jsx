import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";

const DashboardTable = ({ tableHeaders = [], tableBody = [] }) => {
  return (
    <TableContainer component={Paper} sx={{ maxHeight: 440 }}>
      <Table stickyHeader aria-label="custom table">
        <TableHead>
          <TableRow>
            {tableHeaders.map((header, index) => (
              <TableCell
                key={index}
                align={header.align || "left"}
                sx={{
                  fontWeight: "bold",
                  backgroundColor: "#f5f5f5",
                  color: "#333",
                  fontSize: "16px",
                }}
              >
                {header.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {tableBody.map((row, rowIndex) => (
            <TableRow
              key={rowIndex}
              sx={{
                "&:last-child td, &:last-child th": { border: 0 },
                backgroundColor: rowIndex % 2 === 0 ? "#ffffff" : "#fafafa",
              }}
            >
              {tableHeaders.map((header, cellIndex) => (
                <TableCell
                  key={cellIndex}
                  align={header.align || "left"}
                  sx={{ fontSize: "16px" }}
                >
                  {row[header.key]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default DashboardTable;
