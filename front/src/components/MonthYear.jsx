import React from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Box,
} from "@mui/material";
import { useFetchLeads } from "../hooks/useFetchLeads";

const months = [
  { value: 0, label: "January" },
  { value: 1, label: "February" },
  { value: 2, label: "March" },
  { value: 3, label: "April" },
  { value: 4, label: "May" },
  { value: 5, label: "June" },
  { value: 6, label: "July" },
  { value: 7, label: "August" },
  { value: 8, label: "September" },
  { value: 9, label: "October" },
  { value: 10, label: "November" },
  { value: 11, label: "December" },
];

// For years, you might want to generate a range
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 20 }, (_, i) => currentYear - 10 + i);

const MonthYear = ({ month, year, setMonth, setYear }) => {
  // const { month, year, setMonth, setYear } = useFetchLeads();
  return (
    <Box
      display={"flex"}
      justifyContent="space-between"
      alignItems="center"
      gap={2}
    >
      <Box flexGrow={1}>
        <FormControl variant="outlined" size="small" fullWidth>
          <InputLabel id="month-label">Month</InputLabel>
          <Select
            labelId="month-label"
            id="month-select"
            value={month}
            size="small"
            onChange={(e) => setMonth(e.target.value)}
            label="Month"
          >
            {months.map((m) => (
              <MenuItem key={m.value} value={m.value}>
                {m.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <Box flexGrow={1} item>
        <FormControl variant="outlined" size="small" fullWidth>
          <InputLabel id="year-label">Year</InputLabel>
          <Select
            labelId="year-label"
            id="year-select"
            value={year}
            size="small"
            onChange={(e) => setYear(e.target.value)}
            label="Year"
          >
            {years.map((y) => (
              <MenuItem key={y} value={y}>
                {y}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </Box>
  );
};

export default MonthYear;
