import React, { useState, useEffect } from "react";
import axios from "axios";
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
  TextField,
  Box,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Dialog,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { FiEye, FiEdit, FiTrash2 } from "react-icons/fi";
import BackHeader from "../../components/BackHeader";
import { API_URI } from "../../utils/constants";
import {
  DEBOUNCE,
  getErrToast,
  getHeaders,
  getSuccessToast,
} from "../../utils/helpers";
import Loader from "../../components/Loader";
import { useAuth } from "../../context/AuthContext";
import * as XLSX from "xlsx";
import { useAgentContext } from "../../context/AgentContext";
import { GoTrash } from "react-icons/go";
import { DateRangePicker } from "react-date-range";
import moment from "moment";

// import { Label } from "recharts";

const PaymentHistory = () => {
  const { agentList } = useAgentContext();
  // const {isAgent} = useAuth();
  const [isShowAll, setIsShowAll] = useState(true);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const { isAgent, isSalesManager, isBackend, user } = useAuth();
  const [isShowDateFilter, setIsShowDateFilter] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
    key: "selection",
  });
  // const [selectedDate, setSelectedDate] = useState({
  //   startDate: "",
  //   endDate: "",
  // });
  const initialData = {
    date: new Date().toISOString().split("T")[0],
    invoiceNumber: "",
    companyName: "",
    isClient: "false",
    services: "",
    amount: "",
    gst: "",
    bankAccount: "",
    paymentMode: "",
    marketingExecutive: isAgent
      ? user?.name
      : isSalesManager
        ? "Sales Manager"
        : isBackend
          ? "Backend"
          : "admin",
    remarks: "",
    govt: "",
    tds: "",
    body: "",
    refAmount: "",
    totalBenefit: "",
    name: "",
    mobile: "",
    leadSource: "",
  };

  const [formData, setFormData] = useState(initialData);
  const [filter, setFilter] = useState({
    companyName: null,
    services: null,
    isClient: null,
    marketingExecutive: null,
    fromDate: null,
    toDate: null,
  });

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${API_URI}/payment-history`,
        getHeaders({
          ...(filter?.companyName && { companyName: filter.companyName }),
          ...(filter?.fromDate && { fromDate: filter.fromDate }),
          ...(filter?.toDate && { toDate: filter.toDate }),
          ...(filter?.services && { services: filter.services }),
          ...(filter?.isClient && { isClient: filter.isClient }),
          ...(filter?.marketingExecutive && {
            marketingExecutive: filter.marketingExecutive,
          }),
        }),
      );
      console.log("Fetched payments:", data);
      setPayments(data.data || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching payment history:", error);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log("Input change:", name, value);
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editMode) {
        // Update existing payment
        await axios.put(
          `${API_URI}/payment-history/${editId}`,
          isBackend
            ? {
                ...formData,
                totalBenefit:
                  Number(formData.gst) +
                  Number(formData.body) +
                  Number(formData.tds) +
                  Number(formData.refAmount) +
                  Number(formData.govt),
              }
            : formData,
          getHeaders(),
        );
        setEditMode(false);
        setEditId(null);
      } else {
        // Add new payment
        await axios.post(`${API_URI}/payment-history`, formData, getHeaders());
      }
      // Reset form data
      setFormData(initialData);
      fetchPayments();
      setIsShowAll(true);
      getSuccessToast(
        editMode
          ? "Payment updated successfully"
          : "Payment added successfully",
      );
    } catch (error) {
      console.error("Error saving payment:", error);
      getErrToast(
        editMode
          ? error?.response?.data?.message || "Error Updating payment"
          : "Error adding payment",
      );
      setLoading(false);
    }
  };

  const handleEditPayment = (payment) => {
    // Convert data types appropriately
    const formattedPayment = {
      ...payment,
      date: payment.date
        ? new Date(payment.date).toISOString().split("T")[0]
        : "",
      isClient: payment.isClient === true ? "true" : "false",
    };

    setFormData(formattedPayment);
    setEditMode(true);
    setEditId(payment._id);
    setIsShowAll(false);
  };
  const handleExportToExcel = () => {
    try {
      // Filter data for export (decide which fields to include)
      const exportData = payments.map((payment) => {
        const paymentData = {
          Date: new Date(payment.date).toLocaleDateString(),
          "Invoice Number": payment.invoiceNumber,
          "Company Name": payment.companyName,
          "Client/Consultant": payment.isClient ? "Client" : "Consultant",
          Services: payment.services,
          Amount: payment.amount,
          GST: payment.gst,
          "Bank Account": payment.bankAccount,
          "Payment Mode": payment.paymentMode,
          "Marketing Executive": payment.marketingExecutive,
          Remarks: payment.remarks,
          Approved: payment.isApproved
            ? "Approved"
            : payment.isDisApproved
              ? "Disapproved"
              : "N/A",
        };

        // Only add backend fields if user is backend
        if (isBackend || user?.type === "admin") {
          paymentData["Government"] = payment.govt;
          paymentData["TDS"] = payment.tds;
          paymentData["Body"] = payment.body;
          paymentData["Reference Amount"] = payment.refAmount;
          paymentData["Total Benefits"] = payment.totalBenefit;
        }

        // Add name and mobile for consultants
        if (!payment.isClient) {
          paymentData["Name"] = payment.name;
          paymentData["Mobile"] = payment.mobile;
        }

        return paymentData;
      });

      // Create worksheet from data
      const worksheet = XLSX.utils.json_to_sheet(exportData);

      // Create workbook and add the worksheet
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Payment History");

      // Generate Excel file
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });

      // Convert to Blob and create download link
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const fileName = `payment-history-${new Date().toISOString().split("T")[0]}.xlsx`;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();

      // Clean up
      link.remove();
      window.URL.revokeObjectURL(url);

      getSuccessToast("Payment history exported successfully");
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      getErrToast("Failed to export payment history");
    }
  };

  // useEffect(() => {
  //   fetchPayments();
  // }, []);
  useEffect(DEBOUNCE(fetchPayments, 1000), [filter]);

  useEffect(() => {
    console.log(dateRange);
  }, [dateRange]);

  return (
    <div className="w-full h-full flex flex-col">
      <BackHeader
        title="Payment Received"
        showBtn={true}
        addbuttonText={isShowAll ? "Add Payment" : "Show All"}
        onClick={() => {
          if (!isShowAll) {
            // If returning to list view, reset form
            setFormData(initialData);
            setEditMode(false);
            setEditId(null);
          }
          setIsShowAll(!isShowAll);
        }}
      >
        <div className="gap-4 ml-2 inline-flex ">
          {!isSalesManager && !isAgent && (
            <Button
              style={{ backgroundColor: "#4CAF50", textWrap: "nowrap" }}
              onClick={() => {
                handleExportToExcel();
                // add functionality to export table in excel and download it here
              }}
              variant="contained"
              className="text-sm"
            >
              Excel
            </Button>
          )}
          <Button
            variant="contained"
            onClick={() => setIsShowDateFilter(!isShowDateFilter)}
            size="small"
          >
            Date
          </Button>
          <Dialog
            open={isShowDateFilter}
            onClose={() => setIsShowDateFilter(false)}
          >
            <DialogContent>
              <DateRangePicker
                ranges={[dateRange]}
                onChange={(v) => {
                  setDateRange(v.selection);
                }}
              />
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => {
                  setIsShowDateFilter(false);
                }}
              >
                Cancel
              </Button>
              <Button
                disabled={!dateRange.startDate || !dateRange.endDate}
                onClick={() => {
                  setFilter((prev) => ({
                    ...prev,
                    fromDate: moment(dateRange.startDate).format("YYYY-MM-DD"),
                    toDate: moment(dateRange.endDate).format("YYYY-MM-DD"),
                  }));
                  setIsShowDateFilter(false);
                  // setIsShowDate(false);
                  // })
                }}
                variant="contained"
              >
                Apply
              </Button>
            </DialogActions>
          </Dialog>
          <TextField
            fullWidth
            size="small"
            name="companyName"
            label="Filter By Company Name"
            onChange={(e) =>
              setFilter({ ...filter, companyName: e.target.value })
            }
            value={filter.companyName}
          />
          <TextField
            fullWidth
            size="small"
            name="services"
            label="Filter By Services"
            onChange={(e) => setFilter({ ...filter, services: e.target.value })}
            value={filter.services}
          />
          <FormControl size="small" fullWidth>
            <InputLabel>Client / Consultant</InputLabel>
            <Select
              name="isClient"
              value={filter.isClient || ""}
              onChange={(e) =>
                setFilter({ ...filter, isClient: e.target.value })
              }
              label="Client / Consultant"
            >
              {/* <MenuItem value="">All</MenuItem> */}
              <MenuItem value="true">Client</MenuItem>
              <MenuItem value="false">Consultant</MenuItem>
            </Select>
          </FormControl>
          {!isAgent && (
            <FormControl size="small" fullWidth>
              <InputLabel>Filter By Agent</InputLabel>
              <Select
                name="isClient"
                value={filter.marketingExecutive || ""}
                onChange={(e) =>
                  setFilter({ ...filter, marketingExecutive: e.target.value })
                }
                label="Client / Consultant"
              >
                {/* <MenuItem value="">All</MenuItem> */}
                {agentList?.map((agent) => (
                  <MenuItem value={agent?.name}>{agent?.name}</MenuItem>
                ))}
                {/* <MenuItem value="false">Consultant</MenuItem> */}
              </Select>
            </FormControl>
          )}
          <Button
            onClick={() =>
              setFilter({
                companyName: null,
                services: null,
                isClient: null,
                marketingExecutive: null,
              })
            }
            variant="contained"
          >
            Clear
          </Button>
        </div>
      </BackHeader>

      <div className="flex-1 p-4 overflow-auto">
        {loading ? (
          <div className="w-full h-full flex justify-center items-center">
            <Loader />
          </div>
        ) : (
          <>
            {isShowAll ? (
              <PaymentHistoryTable
                payments={payments}
                onEdit={handleEditPayment}
                fetchPayments={fetchPayments}
              />
            ) : (
              <PaymentForm
                formData={formData}
                handleInputChange={handleInputChange}
                handleSubmit={handleSubmit}
                editMode={editMode}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

const PaymentHistoryTable = ({ payments, onEdit, fetchPayments }) => {
  const { isBackend, isAgent, isSalesManager, user } = useAuth();
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };
  const handleApprove = async (id) => {
    console.log(id);
    const confirm = window.confirm(
      "Are you sure you want to approve this payment?",
    );
    if (!confirm) return;
    const { data } = await axios.put(
      `${API_URI}/payment-history/${id}`,
      { isApproved: true, isDisApproved: false },
      getHeaders(),
    );
    console.log(data);
    fetchPayments();
    try {
    } catch (error) {
      console.log(error);
      getErrToast(
        error?.response?.data?.message || "Failed to approve payment",
      );
    }
  };

  const handleDisapprove = async (id) => {
    console.log(id);
    const confirm = window.confirm(
      "Are you sure you want to disapprove this payment?",
    );
    if (!confirm) return;
    const { data } = await axios.put(
      `${API_URI}/payment-history/${id}`,
      { isDisApproved: true, isApproved: false },
      getHeaders(),
    );
    console.log(data);
    fetchPayments();
    try {
    } catch (error) {
      console.log(error);
      getErrToast(
        error?.response?.data?.message || "Failed to approve payment",
      );
    }
  };

  const handleDelete = async (id) => {
    if (
      window.confirm("Are you sure you want to delete this payment history?")
    ) {
      try {
        await axios.delete(`${API_URI}/payment-history/${id}`, getHeaders());
        getSuccessToast("Payment deleted successfully");
        // Refresh payments after deletion
        window.location.reload();
      } catch (error) {
        console.error("Error deleting payment:", error);
        getErrToast("Failed to delete payment");
      }
    }
  };

  const calculateTotalBenefits = (payment) => {
    const { govt = 0, tds = 0, body = 0, refAmount = 0, amount, gst } = payment;
    const benefitAmt =
      Number(amount) -
      (Number(govt) +
        Number(tds) +
        Number(body) +
        Number(refAmount) +
        Number(gst));
    const format = benefitAmt.toLocaleString("en-IN");
    return format || 0;
  };

  return (
    <div className="w-full">
      <TableContainer
        component={Paper}
        sx={{
          maxHeight: "calc(100vh - 180px)",
          overflow: "auto",
        }}
      >
        <Table stickyHeader sx={{ minWidth: 1200 }}>
          <TableHead>
            <TableRow>
              <TableCell
                sx={{ fontWeight: "bold", backgroundColor: "#e3f2fd" }}
              >
                Invoice Number
              </TableCell>
              <TableCell
                sx={{ fontWeight: "bold", backgroundColor: "#e3f2fd" }}
              >
                Company Name
              </TableCell>
              <TableCell
                sx={{ fontWeight: "bold", backgroundColor: "#e3f2fd" }}
              >
                Mobile Number
              </TableCell>
              <TableCell
                sx={{ fontWeight: "bold", backgroundColor: "#e3f2fd" }}
              >
                Name
              </TableCell>
              <TableCell
                sx={{ fontWeight: "bold", backgroundColor: "#e3f2fd" }}
              >
                Client / Consultant
              </TableCell>
              <TableCell
                sx={{ fontWeight: "bold", backgroundColor: "#e3f2fd" }}
              >
                Date
              </TableCell>
              {(user?.type == "admin" || isBackend) && (
                <TableCell
                  sx={{ fontWeight: "bold", backgroundColor: "#e3f2fd" }}
                >
                  Approve / Disapprove
                </TableCell>
              )}

              <TableCell
                sx={{ fontWeight: "bold", backgroundColor: "#e3f2fd" }}
              >
                Services
              </TableCell>
              <TableCell
                sx={{ fontWeight: "bold", backgroundColor: "#e3f2fd" }}
              >
                Amount
              </TableCell>
              <TableCell
                sx={{ fontWeight: "bold", backgroundColor: "#e3f2fd" }}
              >
                GST
              </TableCell>
              <TableCell
                sx={{ fontWeight: "bold", backgroundColor: "#e3f2fd" }}
              >
                Bank Account
              </TableCell>
              <TableCell
                sx={{ fontWeight: "bold", backgroundColor: "#e3f2fd" }}
              >
                Payment Mode
              </TableCell>
              <TableCell
                sx={{ fontWeight: "bold", backgroundColor: "#e3f2fd" }}
              >
                Marketing Executive
              </TableCell>
              <TableCell
                sx={{ fontWeight: "bold", backgroundColor: "#e3f2fd" }}
              >
                Remarks
              </TableCell>
              {(isBackend || user?.type === "admin") && (
                <>
                  {["Govt", "TDS", "Body", "Ref Amount", "Total benefits"].map(
                    (v, i) => (
                      <TableCell
                        key={i}
                        sx={{ fontWeight: "bold", backgroundColor: "#e3f2fd" }}
                      >
                        {v}
                      </TableCell>
                    ),
                  )}
                </>
              )}

              {/* {!isAgent && ( */}
              <TableCell
                sx={{
                  fontWeight: "bold",
                  backgroundColor: "#e3f2fd",
                  position: "sticky",
                  right: 0,
                  zIndex: 3,
                }}
              >
                Actions
              </TableCell>
              {/* )} */}
            </TableRow>
          </TableHead>
          <TableBody>
            {payments && payments.length > 0 ? (
              payments.map((payment) => (
                <TableRow
                  className={`${payment?.isApproved ? "bg-green-50" : payment?.isDisApproved ? "bg-red-50" : ""}`}
                  key={payment._id}
                  hover
                >
                  <TableCell>{payment.invoiceNumber}</TableCell>
                  <TableCell>{payment.companyName}</TableCell>
                  <TableCell>{payment.mobile}</TableCell>
                  <TableCell>{payment.name}</TableCell>
                  <TableCell>
                    {payment.isClient === true ? "Client" : "Consultant"}
                  </TableCell>
                  <TableCell className="text-nowrap">
                    {formatDate(payment.date)}
                  </TableCell>
                  {(user?.type == "admin" || isBackend) && (
                    <TableCell>
                      {payment?.isApproved && !payment?.isDisApproved ? (
                        <Button
                          onClick={() => handleDisapprove(payment._id)}
                          color="error"
                          variant="outlined"
                        >
                          Disapprove
                        </Button>
                      ) : !payment.isApproved ? (
                        <Button
                          onClick={() => handleApprove(payment._id)}
                          color="success"
                          variant="outlined"
                        >
                          Approve
                        </Button>
                      ) : (
                        <></>
                      )}
                    </TableCell>
                  )}

                  <TableCell>{payment.services}</TableCell>
                  <TableCell>
                    ₹{Number(payment.amount).toLocaleString()}
                  </TableCell>
                  <TableCell>₹{Number(payment.gst).toLocaleString()}</TableCell>
                  <TableCell>{payment.bankAccount}</TableCell>
                  <TableCell>{payment.paymentMode}</TableCell>
                  <TableCell>{payment.marketingExecutive}</TableCell>
                  <TableCell>{payment.remarks}</TableCell>
                  {(isBackend || user?.type === "admin") && (
                    <>
                      <TableCell>
                        ₹{Number(payment.govt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        ₹{Number(payment.tds).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        ₹{Number(payment.body).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        ₹{Number(payment.refAmount).toLocaleString()}
                      </TableCell>
                      <TableCell>₹{calculateTotalBenefits(payment)}</TableCell>
                    </>
                  )}

                  {/* {!isAgent && ( */}
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      backgroundColor: "#fff",
                      position: "sticky",
                      right: 0,
                      zIndex: 2,
                    }}
                  >
                    <div className="flex gap-2">
                      {/* <IconButton size="small">
                        <FiEye className="text-blue-500" />
                      </IconButton> */}
                      <IconButton size="small" onClick={() => onEdit(payment)}>
                        <FiEdit className="text-green-500" />
                      </IconButton>
                      {!isAgent && !isBackend && !isSalesManager && (
                        <IconButton
                          onClick={() => handleDelete(payment._id)}
                          size="small"
                        >
                          <GoTrash className="text-red-500" />
                        </IconButton>
                      )}
                      {/* <IconButton size="small">
                        <FiTrash2 className="text-red-500" />
                      </IconButton> */}
                    </div>
                  </TableCell>
                  {/* )} */}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={12} align="center">
                  No Payment Received found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

const PaymentForm = ({
  formData,
  handleInputChange,
  handleSubmit,
  editMode,
}) => {
  const { isBackend, user } = useAuth();
  const { agentList } = useAgentContext();

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-lg shadow-md"
    >
      <Typography
        variant="h5"
        component="h2"
        gutterBottom
        className="text-center text-blue-600 border-b pb-3 mb-6"
      >
        {editMode ? "Edit Payment" : "Add New Payment"}
      </Typography>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        <TextField
          fullWidth
          size="small"
          label="Date"
          type="date"
          name="date"
          value={formData.date}
          onChange={handleInputChange}
          InputLabelProps={{ shrink: true }}
          // // required
        />

        <TextField
          fullWidth
          size="small"
          label="Invoice Number"
          name="invoiceNumber"
          value={formData.invoiceNumber}
          onChange={handleInputChange}
          // required
        />

        <TextField
          fullWidth
          size="small"
          label="Company Name"
          name="companyName"
          value={formData.companyName}
          onChange={handleInputChange}
          // required
        />

        <FormControl fullWidth size="small">
          <InputLabel>Client / Consultant</InputLabel>
          <Select
            name="isClient"
            value={formData.isClient}
            onChange={handleInputChange}
            label="Client / Consultant"
          >
            <MenuItem value="true">Client</MenuItem>
            <MenuItem value="false">Consultant</MenuItem>
          </Select>
        </FormControl>

        {/* {formData.isClient === "false" && ( */}
        <>
          <TextField
            fullWidth
            size="small"
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
          />
          <TextField
            fullWidth
            size="small"
            label="Phone Number"
            name="mobile"
            value={formData.mobile}
            onChange={handleInputChange}
          />
        </>

        <TextField
          fullWidth
          size="small"
          label="Services"
          name="services"
          value={formData.services}
          onChange={handleInputChange}
        />

        <TextField
          fullWidth
          size="small"
          label="Amount"
          name="amount"
          type="number"
          value={formData.amount}
          onChange={handleInputChange}
          // required
        />

        <TextField
          fullWidth
          size="small"
          label="GST"
          name="gst"
          type="number"
          value={formData.gst}
          onChange={handleInputChange}
        />

        <FormControl fullWidth size="small">
          <InputLabel>Bank Account</InputLabel>
          <Select
            label="Bank Account"
            name="bankAccount"
            value={formData.bankAccount}
            onChange={handleInputChange}
          >
            {[
              "Axis Bank - Non GST",
              "HDFC Bank - GST",
              "VSIPR - IDFC - GST",
              "QCCI - IDFC - Non GST",
              "Cash",
              "Others",
            ].map((v) => (
              <MenuItem value={v}>{v}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth size="small">
          <InputLabel>Payment Mode</InputLabel>
          <Select
            label="Payment Mode"
            name="paymentMode"
            value={formData.paymentMode}
            onChange={handleInputChange}
          >
            {[
              "UPI - Google Pay",
              "UPI - Phone pay",
              "UPI - Paytm",
              "UPI - Others",
              "NEFT",
              "IMPS",
              "Cheque",
              "Razar Pay",
              "Cash",
              "Others",
            ].map((v) => (
              <MenuItem value={v}>{v}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth size="small">
          <InputLabel>Lead Source</InputLabel>
          <Select
            label="Lead Source"
            name="leadSource"
            value={formData.leadSource}
            onChange={handleInputChange}
          >
            {[
              "OTHERS",
              "GOOGLE MANUAL",
              "FB ADS MSR",
              "FB ADS QCCI",
              "FB MANUAL",
              "INSTAGRAM",
              "MCA",
              "GST",
              "INDIAMART",
              "JUST DAIL",
              "COMPANY",
              "REF",
              "RENEWAL DATA",
              "SURVELLIANCE ",
              "GOOGLE ADS",
              "WHATSAPP MKT",
              "EMAIL MKT",
              "CONSULTANT",
            ].map((v) => (
              <MenuItem value={v}>{v}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {editMode ? (
          <FormControl name="marketingExecutive" fullWidth size="small">
            <InputLabel id="marketingExec">Marketing Executive</InputLabel>
            <Select
              name="marketingExecutive"
              value={formData.marketingExecutive}
              onChange={handleInputChange}
              label="Marketing Executive"
              aria-placeholder="Marketing Executive"
              labelId="marketingExec"
              size="small"
            >
              <MenuItem value={"admin"}> Admin </MenuItem>
              <MenuItem value={"Sales Manager"}> Sales Manager </MenuItem>
              <MenuItem value={"Backend"}> Backend </MenuItem>
              {agentList?.map((agent) => (
                <MenuItem key={agent._id} value={agent.name}>
                  {agent.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ) : (
          <TextField
            fullWidth
            size="small"
            label="Marketing Executive"
            name="marketingExecutive"
            value={formData.marketingExecutive}
            slotProps={{
              input: {
                readOnly: !isBackend && !user?.type === "admin",
              },
            }}
            onChange={handleInputChange}
          />
        )}

        <TextField
          fullWidth
          size="small"
          label="Remarks"
          name="remarks"
          value={formData.remarks}
          onChange={handleInputChange}
          multiline
          rows={2}
        />
        {(isBackend || user?.type == "admin") && (
          <>
            <TextField
              fullWidth
              size="small"
              label="Government"
              name="govt"
              type="number"
              value={formData.govt}
              onChange={handleInputChange}
            />

            <TextField
              fullWidth
              size="small"
              label="TDS"
              name="tds"
              type="number"
              value={formData.tds}
              onChange={handleInputChange}
            />

            <TextField
              fullWidth
              size="small"
              label="Body"
              name="body"
              type="number"
              value={formData.body}
              onChange={handleInputChange}
            />

            <TextField
              fullWidth
              size="small"
              label="Reference Amount"
              name="refAmount"
              type="number"
              value={formData.refAmount}
              onChange={handleInputChange}
            />

            <TextField
              fullWidth
              disabled
              size="small"
              label="Total Benefit"
              name="totalBenefit"
              value={
                (
                  Number(formData.amount) -
                  (Number(formData.gst) +
                    Number(formData.body) +
                    Number(formData.tds) +
                    Number(formData.refAmount) +
                    Number(formData.govt))
                ).toLocaleString("en-IN") || 0
              }
              // onChange={handleInputChange}
            />
          </>
        )}
      </div>

      <Box sx={{ mt: 4, textAlign: "center" }}>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          size="large"
          sx={{ minWidth: "150px" }}
        >
          {editMode ? "Update" : "Submit"}
        </Button>
      </Box>
    </Box>
  );
};

export default PaymentHistory;
