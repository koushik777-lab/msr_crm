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
import { MdOutlineDelete } from "react-icons/md";
import { GoPencil } from "react-icons/go";
import {
  camelToNormal,
  getErrToast,
  getHeaders,
  getSuccessToast,
} from "../../utils/helpers";
import axios from "axios";
import { API_URI } from "../../utils/constants";
import { FiEye } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";

const AgentsTable = ({
  tableHeaders = [],
  tableBody = [],
  logPopup,
  fetchData,
  editPopup,
}) => {
  async function handleDelete(id) {
    const confirm = window.confirm(
      "Are you sure you want to delete this agent?",
    );
    if (!confirm) return;
    try {
      const { data } = await axios.delete(
        `${API_URI}/agent/${id}`,
        getHeaders(),
      );
      getSuccessToast("Agent Deleted Successfully");
      fetchData();
    } catch (error) {
      getErrToast(error.response.data.message);
    }
  }
  const { isSalesManager } = useAuth();
  return (
    <TableContainer component={Paper}>
      <Table stickyHeader aria-label="agents table ">
        <TableHead>
          <TableRow className="uppercase">
            {tableHeaders.map((header, index) => (
              <TableCell
                key={index}
                align={header.align || "left"}
                sx={{
                  fontWeight: "bold",
                  backgroundColor: "#eee",
                  // color: "#7b1fa2",
                  // border: "1px solid #111",
                  fontSize: "16px",
                }}
              >
                {camelToNormal(header.label)}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody className="text-black">
          {tableBody.map((row, rowIndex) => (
            <TableRow
              key={rowIndex}
              // sx={{
              //   color: "#7b1fa2",
              //   "&:last-child td, &:last-child th": { border: 0 },
              //   backgroundColor: rowIndex % 2 === 0 ? "#ffffff" : "#faf2fc",
              //   "&:hover": { backgroundColor: "#f3e5f5" },
              // }}
            >
              {/* index  */}
              <TableCell
                key={rowIndex + 1}
                align={"left"}
                sx={{ fontSize: "16px" }}
              >
                {rowIndex + 1}
              </TableCell>

              {tableHeaders.map((header, cellIndex) => {
                // console.log(header, row[header.label], row)

                return (
                  row[header.label] != null && (
                    <TableCell
                      // className="border-2"
                      // key={cellIndex}
                      align={header.align || "left"}
                      sx={{ fontSize: "16px" }}
                    >
                      {row[header.label]}
                    </TableCell>
                  )
                );
              })}

              {/* actions */}
              <TableCell
                key={rowIndex + 1}
                align={"center"}
                sx={{ fontSize: "16px" }}
              >
                <span className="flex items-center justify-center gap-3 ">
                  {" "}
                  <FiEye
                    onClick={() => logPopup(row._id)}
                    color="#1976D2"
                    className="cursor-pointer"
                  />
                  {!isSalesManager && (
                    <GoPencil
                      onClick={() => editPopup(row._id)}
                      className="cursor-pointer"
                    />
                  )}
                  {!isSalesManager && (
                    <MdOutlineDelete
                      onClick={() => handleDelete(row._id)}
                      className="cursor-pointer"
                      color="red"
                      size={"20px"}
                    />
                  )}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default AgentsTable;
