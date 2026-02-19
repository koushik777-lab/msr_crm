import React, { useEffect, useState } from "react";
import BackHeader from "../../components/BackHeader";
import {
  AgenttableData,
  AgenttableHeading,
  DAILY_LEADS_OVERVIEW_BODY,
  DAILY_LEADS_OVERVIEW_HEADERS,
} from "../../constants/constant";
import AgentsTable from "../../components/tables/AgentsTable";
import AddAgentPopup from "../../components/agents/AgentPopup";
import axios from "axios";
import { API_URI } from "../../utils/constants";
import { getErrToast, getHeaders, getSuccessToast } from "../../utils/helpers";
import AgentCallPopup from "../../components/agents/AgentCallPopup";
import Loader from "../../components/Loader";
import { useAuth } from "../../context/AuthContext";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import MyInput from "../../components/MyInput";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Agents = () => {
  const { isSalesManager, isAgent } = useAuth();
  const [showPopup, setShowPopup] = React.useState(false);
  const [data, setData] = useState([]);
  const [agentId, setAgentId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isShowAdmin, setISShowAdmin] = useState(false);

  async function handleSave(formData, actions) {
    console.log(showPopup, formData);
    // return;

    try {
      if (showPopup == "edit") {
        const { data } = await axios.put(
          `${API_URI}/agent/${agentId}`,
          formData,
          getHeaders(),
        );

        // console.log(data);

        fetchData();
        setShowPopup(false);
      } else {
        const { data } = await axios.post(
          `${API_URI}/agent`,
          formData,
          getHeaders(),
        );

        // console.log(data);
        fetchData();
        setShowPopup(false);
      }
      fetchData();
      getSuccessToast("Agent Updated Successfully");
    } catch (error) {
      getErrToast(error.response.data.message);
      // console.log(error.response.data.message);
    }
  }

  async function fetchData() {
    try {
      const {
        data: { agents },
      } = await axios.get(`${API_URI}/agents`, getHeaders());
      setData(agents);
      setLoading(false);
      console.log(agents);
    } catch (error) {}
  }
  useEffect(() => {
    fetchData();
  }, []);

  // console.log(showPopup);
  return (
    <>
      {(showPopup == "add" || showPopup == "edit") && (
        <AddAgentPopup
          onSave={handleSave}
          onClose={() => {
            setShowPopup(false);
            setAgentId(null);
          }}
          isEdit={showPopup == "edit"}
          agentData={data.filter((v) => v._id == agentId)[0]}
        />
      )}
      {showPopup == "callLog" && (
        <AgentCallPopup agentId={agentId} onClose={() => setShowPopup(false)} />
      )}

      <div className="w-full flex flex-col">
        <BackHeader
          title={"Agents"}
          showBtn={!isSalesManager}
          addbuttonText={isShowAdmin ? "View Agents" : "Add Agent"}
          onClick={() =>
            isShowAdmin ? setISShowAdmin(false) : setShowPopup("add")
          }
        >
          {!isShowAdmin && !isAgent && (
            <Button
              variant="contained"
              size="small"
              onClick={() => setISShowAdmin(true)}
              // fullWidth ={true}
            >
              View Admins
            </Button>
          )}
        </BackHeader>
        <div className="flex-1 overflow-y-auto  my-6 no-scrollbar">
          {loading ? (
            <div className="w-full h-full flex justify-center">
              <Loader />
            </div>
          ) : (
            <>
              {isShowAdmin ? (
                <AdminsTable />
              ) : (
                <AgentsTable
                  logPopup={(agentId) => {
                    setAgentId(agentId);
                    setShowPopup("callLog");
                  }}
                  editPopup={(agentId) => {
                    setAgentId(agentId);
                    setShowPopup("edit");
                  }}
                  fetchData={fetchData}
                  tableHeaders={AgenttableHeading}
                  tableBody={data}
                />
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

const AdminsTable = () => {
  const [adminData, setAdminData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [password, setPassword] = useState({
    // oldPassword: ["", false],
    newPassword: ["", false],
    confirmPassword: ["", false],
  });
  const { isSalesManager } = useAuth();

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_URI}/login/admins`, getHeaders());
      console.log(data);
      setAdminData(data.admins || []);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    try {
      if (password.newPassword[0] != password.confirmPassword[0]) {
        getErrToast("New Password and Confirm Password do not match");
        return;
      }
      const { data } = await axios.post(
        `${API_URI}/change-password`,
        {
          email: password.email,
          // oldPassword: password.oldPassword[0],
          newPassword: password.newPassword[0],
        },
        getHeaders(),
      );

      // console.log(data);
      getSuccessToast("Password Updated Successfully");
      setIsOpen(false);
      setPassword({
        email: "",
        // oldPassword: ["", false],
        newPassword: ["", false],
        confirmPassword: ["", false],
      });
    } catch (error) {
      getErrToast(error?.response?.data?.message || error?.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = (admin) => {
    // Implement edit functionality here
    console.log("Editing admin:", admin);
    setIsOpen(admin);
    setPassword((prev) => ({ ...prev, email: admin?.email }));
    // console.log("Editing admin with ID:", adminId);
  };
  console.log(isOpen);
  return (
    <>
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Admin Users</h2>
        {loading ? (
          <div className="w-full flex justify-center">
            <Loader />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-96 mx-auto bg-white border border-gray-200 rounded-lg shadow">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  {!isSalesManager && (
                    <th className="py-3 px-6 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {adminData && adminData.length > 0 ? (
                  adminData.map((admin) => (
                    <tr key={admin._id} className="hover:bg-gray-50">
                      <td className="py-4 px-6 text-sm font-medium text-gray-900">
                        {admin.email}
                      </td>
                      {!isSalesManager && (
                        <td className="py-4 px-6 text-sm text-right">
                          <button
                            // disabled={!isSalesManager}
                            onClick={() => handleEdit(admin)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            Edit
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={2}
                      className="py-4 px-6 text-center text-sm text-gray-500"
                    >
                      No admin users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Dialog open={isOpen} onClose={() => setIsOpen(false)}>
        <DialogTitle>Edit Admin</DialogTitle>
        <DialogContent className="">
          <Box display={"grid"} gridTemplateColumns={"1fr 1fr"} gap={2}>
            <Box p={2}>
              <MyInput
                label={"Email"}
                value={isOpen?.email}
                // inputProps= {{
                //   readonly : true
                // }}
              />
            </Box>
            {/* <Box p={2}>
              <Password
                label={"Old Password"}
                value={password?.oldPassword?.[0]}
                onChange={(value) =>
                  setPassword((prev) => ({
                    ...prev,
                    oldPassword: [value, prev?.oldPassword?.[1]],
                  }))
                }
                isOn={password?.oldPassword?.[1]}
                setIsOn={(val) =>
                  setPassword((prev) => ({
                    ...prev,
                    oldPassword: [prev?.oldPassword?.[0], val],
                  }))
                }
              />
            </Box> */}
            <Box p={2}>
              <Password
                label={"New Password"}
                value={password?.newPassword?.[0]}
                onChange={(value) =>
                  setPassword((prev) => ({
                    ...prev,
                    newPassword: [value, prev?.newPassword?.[1]],
                  }))
                }
                isOn={password?.newPassword?.[1]}
                setIsOn={(val) =>
                  setPassword((prev) => ({
                    ...prev,
                    newPassword: [prev?.newPassword?.[0], val],
                  }))
                }
              />
            </Box>
            <Box p={2}>
              <Password
                label={"Confirm New Password"}
                value={password?.confirmPassword?.[0]}
                onChange={(value) =>
                  setPassword((prev) => ({
                    ...prev,
                    confirmPassword: [value, prev?.confirmPassword?.[1]],
                  }))
                }
                isOn={password?.confirmPassword?.[1]}
                setIsOn={(val) =>
                  setPassword((prev) => ({
                    ...prev,
                    confirmPassword: [
                      prev?.confirmPassword?.[0],
                      !prev?.confirmPassword?.[1],
                    ],
                  }))
                }
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setIsOpen(false);
              setPassword({
                email: "",
                // oldPassword: ["", false],
                newPassword: ["", false],
                confirmPassword: ["", false],
              });
            }}
            type="button"
            color="primary"
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdatePassword}
            type="button"
            color="primary"
            variant="contained"
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const Password = ({ label, onChange, value, isOn, setIsOn }) => {
  console.log({ label, onChange, value, isOn, setIsOn });
  return (
    <div className="relative">
      <input
        type={isOn ? "text" : "password"}
        // name="password"
        placeholder={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 text-gray-900"
      />
      <button
        type="button"
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
        onClick={() => setIsOn(!isOn)}
      >
        {!isOn ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
      </button>
    </div>
  );
};

export default Agents;
