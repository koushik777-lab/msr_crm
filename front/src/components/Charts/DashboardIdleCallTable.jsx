import React, { useState, useEffect } from "react";
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
  FormControl,
  Select,
  MenuItem,
} from "@mui/material";
import { FiEye } from "react-icons/fi";
import { AGENT_IDLE_TIME } from "../../constants/constant";
import moment from "moment";
import axios from "axios";
import { API_URI } from "../../utils/constants";
import { getHeaders } from "../../utils/helpers";

const DashboardIdleCallTable = ({ dashboardData }) => {
  const [tableHeaders] = useState(AGENT_IDLE_TIME);
  const [tableBody, setTableBody] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    if (dashboardData?.agentIdelTime?.length) {
      const allDates = new Set();

      dashboardData.agentIdelTime.forEach((agent) => {
        if (agent.idleTimeByDay) {
          agent.idleTimeByDay.forEach((day) => {
            if (day.date) {
              allDates.add(day.date);
            }
          });
        }
      });

      const datesList = Array.from(allDates).sort();
      setAvailableDates(datesList.reverse());

      if (datesList.length > 0 && !selectedDate) {
        setSelectedDate(datesList[0]);
      }
    }
  }, [dashboardData]);

  useEffect(() => {
    if (selectedDate && dashboardData?.agentIdelTime?.length) {
      const filteredData = [];

      dashboardData.agentIdelTime.forEach((agent) => {
        const dayData = agent.idleTimeByDay?.find(
          (day) => day.date === selectedDate,
        );
        if (dayData) {
          filteredData.push({
            agent: agent.agent,
            idleTime: dayData.netIdleDuration,
            loginTime: dayData.loginTime,
            logoutTime: dayData.logoutTime,
            breakTime: dayData.breakDuration,
            callTime: dayData.callDuration,
          });
        }
      });

      setTableBody(filteredData);
    }
  }, [selectedDate, dashboardData]);

  async function fetchLoginData(params) {
    try {
      const { data } = await axios.get(
        `${API_URI}/online-time`,
        getHeaders({
          date: "2025-05-29",
        }),
      );
      console.log("LOGIN DATA", data);
    } catch (error) {
      console.error("Error fetching login data:", error.message);
    }
  }

  useEffect(() => {
    fetchLoginData();
  }, []);

  console.log(tableBody);
  return (
    <>
      <div className="flex justify-between items-center">
        <Typography variant="h6" color="black" gutterBottom>
          {"Idle Call Table"}
        </Typography>
        <FormControl variant="outlined" size="small" style={{ minWidth: 150 }}>
          <Select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            displayEmpty
          >
            <MenuItem value="" disabled>
              Select Date
            </MenuItem>
            {availableDates.map((date) => (
              <MenuItem key={date} value={date}>
                {date}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
      <TableContainer component={Paper} className="h-[55vh]">
        <Table stickyHeader aria-label="idle call table">
          <TableHead>
            <TableRow>
              {tableHeaders?.map((header, index) => (
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
            {tableBody.map((row, rowIndex) => (
              <TableRow key={rowIndex} className="hover:bg-gray-100">
                {tableHeaders.map((header, cellIndex) => (
                  <TableCell
                    key={cellIndex}
                    align={header.align || "left"}
                    sx={{ fontSize: "16px" }}
                  >
                    {header.key === "actions" ? (
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
                        title={row[header.key]}
                      >
                        {row[header.key]}
                      </span>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
            {tableBody.length === 0 && (
              <TableRow>
                <TableCell colSpan={tableHeaders.length} align="center">
                  No data available for selected date
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default DashboardIdleCallTable;
