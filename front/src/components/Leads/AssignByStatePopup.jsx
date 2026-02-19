import React, { useState, useEffect } from "react";
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControl,
  Select,
  MenuItem,
  IconButton,
  Autocomplete,
  TextField,
} from "@mui/material";
import { API_URI } from "../../utils/constants";
import axios from "axios";
import { getHeaders } from "../../utils/helpers";
import Loader from "../Loader";
import toast from "react-hot-toast";
// import CloseIcon from "@mui/icons-material";

export default function AssignByStatePopup({
  onClose,

  //   stateList = ["HARYANA"],
  agents = [],
}) {
  const [stateAgentMapping, setStateAgentMapping] = useState({});
  const [stateList, setStateList] = useState({});
  const [Loading, setLoading] = useState(true);
  const [isBtnDisabled, setIsBtnDisabled] = useState(true);

  // Initialize mapping when stateList changes

  async function fetchLeads(page, isSetToPage1 = false) {
    // console.log("FETHCING LEADS");
    let finalParams = {
      status: "Unassigned",
    };

    try {
      const {
        data: { leads, totalLeads, currentPage },
      } = await axios.get(`${API_URI}/leads`, getHeaders(finalParams));

      let state = {};
      leads.forEach((lead) => {
        if (state[lead.address]) {
          state[lead.address].leads.push(lead);
        } else {
          state[lead.address] = {
            leads: [lead],
            agent: null,
          };
        }
      });
      // console.log("LEADS", state);
      let sortArr = [];
      for (let key in state) {
        sortArr.push([key, state[key]]);
      }
      sortArr.sort((a, b) => b[1].leads.length - a[1].leads.length);
      state = Object.fromEntries(sortArr);
      // console.log("SORTED", state);

      setStateList(state);
    } catch (error) {
      console.log(error.message);
    } finally {
      setLoading(false);
    }
  }

  //   console.log(agents);
  useEffect(() => {
    fetchLeads();
  }, []);

  // Handle agent selection change for a state

  // Handle save button click
  const handleSave = async () => {
    const bData = [];
    for (let key in stateList) {
      if (stateList[key].agent != null) {
        let obj = {
          address: key,
          agent: stateList[key].agent,
        };
        bData.push(obj);
      }
    }

    // return console.log(bData);
    try {
      await axios.post(`${API_URI}/multiLeads`, { leads: bData }, getHeaders());
      toast.success("Agents assigned successfully");
      onClose(true);
    } catch (error) {
      console.log(error.message);
      toast.error("Failed to assign agents");
    }

    console.log(bData);

    // You can implement API call here to save the state-agent mapping
    // onClose(stateAgentMapping);
  };

  //  console.log(stateList)
  useEffect(() => {
    let isDisabled = true;
    for (let key in stateList) {
      if (stateList[key].agent != null) {
        // console.log("-----",stateList[key]);
        isDisabled = false;
      }
    }

    // console.log(isDisabled, isBtnDisabled);
    setIsBtnDisabled(isDisabled);
  }, [stateList]);

  return (
    <Dialog
      open={true}
      onClose={() => onClose(null)}
      fullWidth
      maxWidth="md"
      sx={{ height: "80vh" }}
    >
      <DialogTitle>
        Assign Agents by State
        <IconButton
          aria-label="close"
          onClick={() => onClose(null)}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          X
        </IconButton>
      </DialogTitle>

      {Loading ? (
        <Loader className={"flex justify-center items-center w-full my-12"} />
      ) : (
        <DialogContent dividers>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableCell sx={{ fontWeight: "bold", width: "50%" }}>
                    State
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", width: "50%" }}>
                    Number Of Leads
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", width: "50%" }}>
                    Agent
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.keys(stateList).map((state) => (
                  <TableRow key={state} hover>
                    <TableCell>{state}</TableCell>
                    <TableCell>{stateList[state]?.leads?.length}</TableCell>
                    <TableCell>
                      <Autocomplete
                        id="combo-box-demo"
                        options={agents}
                        getOptionLabel={(option) => option.name}
                        style={{ minWidth: 200 }}
                        onChange={(e, val) => {
                          // console.log(val);
                          // setSelectedStatus(val);
                          // val && handleUpdateAgent(val);
                          let tempS = { ...stateList };
                          tempS[state].agent = val;
                          setStateList(tempS);
                          // setStateList(p=> ({...p, tempS: {...stateList[state], agent: val}}));
                        }}
                        //   disabled={selectedLeads.length == 0}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Assign Agent"
                            variant="outlined"
                            size="small"
                            // value={selectedStatus}
                          />
                        )}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
      )}

      <DialogActions>
        <Button onClick={() => onClose(null)} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          color="primary"
          disabled={isBtnDisabled}
        >
          Assign
        </Button>
      </DialogActions>
    </Dialog>
  );
}
