import React, { useEffect, useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  useTheme,
  alpha,
  Autocomplete,
  TextField,
} from "@mui/material";
import axios from "axios";
import { API_URI } from "../../utils/constants";
import { getHeaders } from "../../utils/helpers";
import { useAgentContext } from "../../context/AgentContext";

export default function AgentChart({}) {
  console.log("AGENT CHART");

  const { agentList } = useAgentContext();
  let agents = agentList?.map((v) => ({
    _id: v?._id,
    agent: v?.name,
  }));
  const [option, setOption] = React.useState("Today");
  const [agent, setAgent] = React.useState(() => agents[0]);

  const [allLeads, setAllLeads] = useState([]);
  const theme = useTheme();
  const LEADS = useMemo(() => {
    let filteredLead = allLeads.filter((v) => {
      // v?.agent && v?.assignDate && v?.agent?.name== agent?.agent
      if (v?.agent && v?.assignDate && v?.agent?.name == agent?.agent) {
        const todayDate = new Date();
        const leadDate = new Date(v?.assignDate);
        const todayDay = todayDate.getDate();
        const todayMonth = todayDate.getMonth();
        const todayYear = todayDate.getFullYear();
        const leadDay = leadDate.getDate();
        const leadMonth = leadDate.getMonth();
        const leadYear = leadDate.getFullYear();
        if (option == "Today") {
          return (
            todayDay == leadDay &&
            todayMonth == leadMonth &&
            todayYear == leadYear
          );
        } else if (option == "Month") {
          return todayMonth == leadMonth && todayYear == leadYear;
        }
      } else return false;
    });

    let obj = {
      assigned: filteredLead.length,
      followUp: 0,
      notContactable: 0,
      switchOff: 0,
      callBack: 0,
      notInterested: 0,
      notCalled: 0,
    };
    for (let i = 0; i < filteredLead.length; i++) {
      const lead = filteredLead[i];
      if (lead.status == "Follow Up") {
        obj.followUp++;
      } else if (lead.status == "Not Contactable") {
        obj.notContactable++;
      } else if (lead.status == "Switch Off") {
        obj.switchOff++;
      } else if (lead.status == "Call Back") {
        obj.callBack++;
      } else if (lead.status == "Rejected") {
        obj.notInterested++;
      } else if (lead.status == "Not Contacted") {
        obj.notCalled++;
      }
    }
    return obj;
  }, [agent, option, allLeads]);
  // let date = new Date(LEADS[0]);

  // Calculate totals for each column

  const headerStyles = {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    fontWeight: "bold",
    fontSize: "0.9rem",
    textAlign: "center",
    padding: "12px",
  };

  const subHeaderStyles = {
    backgroundColor: alpha(theme.palette.primary.main, 0.8),
    color: theme.palette.primary.contrastText,
    fontWeight: "bold",
    padding: "10px",
    textAlign: "center",
  };

  const callFeedbackStyle = {
    borderLeft: `1px solid ${theme.palette.divider}`,
    borderRight: `1px solid ${theme.palette.divider}`,
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
  };

  async function fetchMonthLeads() {
    // console.log("+++++FETCHING MONTH LEADS++++++", agents, agentList);
    try {
      const {
        data: { leads },
      } = await axios.get(
        `${API_URI}/leads?isAnalytics=true&isMonthly=true`,

        getHeaders(),
      );
      // console.log("++++++++++++++++MONTHLY LEADS +++++++++++++++++++ " , leads);
      setAllLeads(leads);
    } catch (error) {
      console.log(error?.response?.data?.message || error.message);
    }
  }
  useEffect(() => {
    fetchMonthLeads();
  }, []);

  return (
    <div className="pb-8 ">
      <div className="mb-4 flex gap-4 ">
        ASDFSADF
        <Autocomplete
          options={agents}
          value={agent}
          onChange={(event, newValue) => {
            setAgent(newValue);
          }}
          getOptionLabel={(option) => option?.agent}
          renderInput={(params) => (
            <TextField
              {...params}
              size="small"
              sx={{
                width: "250px",
              }}
              label="Select Agent"
              variant="outlined"
            />
          )}
        />
        {["Today", "Month"].map((item, index) => (
          <div
            key={index}
            onClick={() => setOption(item)}
            className={`border text-cyan-500  px-4 py-1.5 rounded cursor-pointer ${option == item ? " text-white bg-cyan-500 " : ""}`}
          >
            {item}
          </div>
        ))}
      </div>
      <Box sx={{ boxShadow: 3, borderRadius: 2, overflow: "hidden", mb: 4 }}>
        {/* <Typography
        variant="h6"
        sx={{
          p: 2,
          backgroundColor: theme.palette.primary.dark,
          color: "white",
          fontWeight: "bold",
        }}
      >
        Executive Performance Dashboard
      </Typography> */}

        <TableContainer component={Paper} sx={{ maxHeight: 450 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                {/* <TableCell
                rowSpan={2}
                sx={{
                  ...headerStyles,
                  minWidth: 150,
                  position: "sticky",
                  left: 0,
                  zIndex: 3,
                }}
              >
                Executive Name
              </TableCell> */}
                <TableCell
                  rowSpan={2}
                  sx={{
                    ...headerStyles,
                    backgroundColor: alpha(theme.palette.success.main, 0.8),
                  }}
                >
                  Data Assigned
                </TableCell>
                <TableCell
                  colSpan={5}
                  align="center"
                  sx={{
                    ...headerStyles,
                    backgroundColor: alpha(theme.palette.info.main, 0.9),
                  }}
                >
                  Calling Feedback
                </TableCell>
                <TableCell
                  rowSpan={2}
                  sx={{
                    ...headerStyles,
                    backgroundColor: alpha(theme.palette.warning.main, 0.7),
                  }}
                >
                  Data Not Called
                </TableCell>
                {/* <TableCell
                rowSpan={2}
                sx={{
                  ...headerStyles,
                  backgroundColor: alpha(theme.palette.info.dark, 0.7),
                }}
              >
                E-Mail Marketing
              </TableCell>
              <TableCell
                rowSpan={2}
                sx={{
                  ...headerStyles,
                  backgroundColor: alpha(theme.palette.error.main, 0.6),
                }}
              >
                Non Use Data
              </TableCell> */}
              </TableRow>
              <TableRow>
                <TableCell sx={subHeaderStyles}>Follow Up</TableCell>
                <TableCell sx={subHeaderStyles}>Not Contactable</TableCell>
                <TableCell sx={subHeaderStyles}>Switch Off</TableCell>
                <TableCell sx={subHeaderStyles}>Call Back</TableCell>
                <TableCell sx={subHeaderStyles}>Not Interested</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* {dummyData.map((row, index) => ( */}
              <TableRow
                // key={index}
                sx={{
                  "&:nth-of-type(odd)": {
                    backgroundColor: alpha(theme.palette.primary.light, 0.05),
                  },
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.primary.light, 0.1),
                  },
                }}
              >
                <TableCell align="center" sx={{ fontWeight: "medium" }}>
                  {LEADS?.assigned}
                </TableCell>
                <TableCell align="center" sx={callFeedbackStyle}>
                  {LEADS?.followUp}
                </TableCell>
                <TableCell align="center" sx={callFeedbackStyle}>
                  {LEADS?.notContactable}
                </TableCell>
                <TableCell align="center" sx={callFeedbackStyle}>
                  {LEADS?.switchOff}
                </TableCell>
                <TableCell align="center" sx={callFeedbackStyle}>
                  {LEADS?.callBack}
                </TableCell>
                <TableCell align="center" sx={callFeedbackStyle}>
                  {LEADS?.notInterested}
                </TableCell>
                <TableCell align="center">{LEADS.notCalled}</TableCell>
              </TableRow>
              {/* ))} */}
              <TableRow
                sx={{
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  fontWeight: "bold",
                }}
              ></TableRow>
            </TableBody>
          </Table>
        </TableContainer>
        {/* <Box
        sx={{
          p: 2,
          backgroundColor: alpha(theme.palette.background.paper, 0.9),
          borderTop: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          * This table shows the performance metrics for all executives in the
          system.
        </Typography>
      </Box> */}
      </Box>
    </div>
  );
}
