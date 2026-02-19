import React, { useEffect, useState } from "react";
import moment from "moment";
import QuotationForm from "./quotationForm";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { handleGenerateQuotation } from "./pdfGeneration";
import BackHeader from "../../components/BackHeader";
import QuotationTable from "./QuotationTable";
import axios from "axios";
import { API_URI } from "../../utils/constants";
import { DEBOUNCE, getHeaders } from "../../utils/helpers";
import toast from "react-hot-toast";
import {
  Autocomplete,
  Box,
  Button,
  TextField,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import AddManualQuotation from "./AddManualQuotation";
import Loader from "../../components/Loader";
import { useAgentContext } from "../../context/AgentContext";
import MyInput from "../../components/MyInput";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import * as XLSX from "xlsx";
import { date } from "yup";
import Agents from "../agents/Agents";
import { Calendar, DateRangePicker } from "react-date-range";
import "react-date-range/dist/styles.css"; // main style file
import "react-date-range/dist/theme/default.css"; // theme css file
import { set } from "date-fns";
import QCCIForm from "./QCCIForm";
import ShopBarcodeForm from "./ShopBarcodeForm";
import { pdf } from "@react-pdf/renderer";
import QuotationTwo from "../../utils/MSRPDF/QuotationTwo";
import QuotationOne from "../../utils/MSRPDF/QuotationOne";
// import QT from "../../utils/tempQuotations.json";

const Quotation = () => {
  // console.log("QT", QT.map(item=> {
  //   if(item?.date){
  //     let temp = item?.date.split("-");
  //     if( temp[0]!=="2025" ){
  //       return {
  //         ...item,
  //         date : temp.reverse().join("-")
  //       }
  //     }
  //     else {
  //       return item
  //     }
  //   }
  //   else {
  //     return item
  //   }
  // }).map(i=> ({...i, date : { "$date" : i.date+"T00:00:00.000Z"}})));
  const { pathname, state } = useLocation();
  const { user, isAgent, isBackend, isSalesManager } = useAuth();
  const IS_CLIENT_SHEET = pathname == "/clientSheet";

  const leadDetails = state?.leadDetails;
  // console.log(state);
  const [showAll, setShowAll] = useState(() =>
    state?.isNewQuotation ? false : true,
  );
  // console.log(state?.isNewQuotation, showAll);

  const [allQuotaions, setAllQuotations] = useState([]);
  const [viewMode, setViewMode] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [openManualQuotation, setOpenManualQuotation] = useState(false);
  const [loading, setLoading] = useState(false);
  const { agentList } = useAgentContext();
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [selectedQuotationType, setSelectedQuotationType] = useState({
    name: "MSR",
    key: "msr",
  });
  const [selectedDate, setSelectedDate] = useState({
    fromDate: "",
    toDate: "",
  });
  const [pdfConfig, setPdfConfig] = useState({
    type: "msr",
    show: false,
  });

  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 15,
    total: 0,
  });

  const [openExportPopup, setOpenExportPopup] = useState(false);
  const [exportDates, setExportDates] = useState({
    fromDate: "",
    toDate: moment().format("YYYY-MM-DD"),
    isAllTime: false,
  });
  const [isOpenBulk, setIsOpenBulk] = useState(false);
  const [transfer, setTransfer] = useState({
    transferFrom: "",
    transferTo: "",
  });
  const [dateRange, setDateRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
    key: "selection",
  });
  const [isShowDate, setIsShowDate] = useState(false);
  const [searchQuotation, setSearchQuotations] = useState("");
  // const {agentList} = useAgentContext

  // console.log("AGENT LIST", agentList);

  const DEFAULTDATA = {
    date: moment().format("YYYY-MM-DD"),
    company: leadDetails?.company || "",
    address: leadDetails?.address || "",
    number: leadDetails?.number || "",
    name: leadDetails?.name || "",
    email: leadDetails?.email || "",
    reminder: "",
    quotedBy:
      user?.type === "agent"
        ? user?.name
        : isSalesManager
          ? "Sales Manager"
          : isBackend
            ? "Backend"
            : "admin",
  };

  const getOrderNo = async () => {
    try {
    } catch (error) {
      console.error("Error getting order number", error);
    }
  };

  getOrderNo();

  const [initialQuotationData, setInitialQuotationData] = useState(DEFAULTDATA);

  const handleSubmit = async (values) => {
    try {
      console.log("Quotation form submitted:", values);
      const result = await handleGenerateQuotation(
        values,
        user,
        isAgent,
        isSalesManager,
        isBackend,
        -1,
        false,
        null,
      );

      if (result) {
        // Reset form data to initial state
        setInitialQuotationData({
          date: moment().format("YYYY-MM-DD"),
          company: "",
          address: "",
          number: "",
          name: "",
          email: "",
          quotedBy: user?.type === "agent" ? user?.name : "",
          services: "",
          natureOfBusiness: "",
          namePrefix: "Mr",
          employeeNumber: "",
          locationNumber: "",
          currencyType: "INR",
          licenseRegistrationFees: [],
          feeStructureCompliances: [],
          discount: "",
          isGST: true,
          accountDetails: {
            withGST: "",
            withoutGST: "",
          },
          note: "",
          documentsRequired: [""],
          remarks: "",
          feedback: "",
          isForClient: true,
          leadFrom: "",
          location: "",
          reminder: "",
        });
        setShowAll(true);
      }
    } catch (error) {
      toast.error("Error generating quotation");
      console.error("Error in handleSubmit:", error);
    }
  };

  const handleViewQuotaion = (row) => {
    console.log(row);
    if (selectedQuotationType?.key == "smb") {
      pdf(<QuotationOne values={row} />)
        .toBlob()
        .then((blob) => {
          const url = URL.createObjectURL(blob);
          window.open(url, "_blank");
        });
    } else if (selectedQuotationType?.key == "qcci") {
      pdf(
        <QuotationTwo
          values={{
            ...row,
            quotedBy:
              user?.type === "agent"
                ? user?.name
                : isSalesManager
                  ? "Sales Manager"
                  : isBackend
                    ? "Backend"
                    : "admin",
          }}
        />,
      )
        .toBlob()
        .then((blob) => {
          const url = URL.createObjectURL(blob);
          window.open(url, "_blank");
        });
    } else {
      handleGenerateQuotation(
        row,
        user,
        isAgent,
        isSalesManager,
        isBackend,
        false,
        true,
      );
    }
  };

  const handleEditQuotaion = (row) => {
    if (IS_CLIENT_SHEET) {
      setOpenManualQuotation(true);
      // Transform row data to match manual quotation form structure
      setInitialQuotationData({
        agentName: row.agentName || (isAgent ? user?.name : "admin"),
        date: row.date || moment().format("YYYY-MM-DD"),
        name: row.name || "",
        companyName: row.companyName || "",
        address: row.address || "",
        location: row.location || "",
        natureOfBusiness: row.natureOfBusiness || "",
        leadFrom: row.leadFrom || "",
        isForClient: row.isForClient ?? true,
        number: row.number || "",
        email: row.email || "",
        orderNumber: row.orderNumber || "",
        documentsRequired: row.documentsRequired || [],
        isoSample: row.isoSample || "",
        remarks: row.remarks || "",
        feedback: row.feedback || "",
        reminder: row.reminder || "",
        isManuallyCreated: true,
        _id: row._id, // Preserve the ID for updating
      });
    } else {
      console.log(row);
      setShowAll(false); // Show the form
      setInitialQuotationData(row); // Set the form data with row data
      setEditMode(true); // Set edit mode to true
      setPdfConfig({
        type: selectedQuotationType?.key || "msr",
        show: false,
      });
    }
  };

  const handleUpdateQ = async (values, type) => {
    console.log("Update Quotation", values, type);
    try {
      const {
        data: { updatedQuotation },
      } = await axios.put(
        `${API_URI}/quotation?quotationId=${initialQuotationData._id}&type=${type}`,
        values,
        getHeaders(),
      );
      console.log(updatedQuotation);
      setAllQuotations(
        allQuotaions.map((item) =>
          item?._id === initialQuotationData._id ? updatedQuotation : item,
        ),
      );
      setEditMode(false);
      setShowAll(true);
      // setInitialQuotationData(DEFAULTDATA);
      setOpenManualQuotation(false); // Close popup

      toast.success("Quotation updated successfully");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Error updating quotation");
    }
  };

  const handleUpdateQuotation = async (values) => {
    try {
      const {
        data: { updatedQuotation },
      } = await axios.put(
        `${API_URI}/quotation/${initialQuotationData._id}`,
        values,
        getHeaders(),
      );
      setAllQuotations(
        allQuotaions.map((item) =>
          item?._id === initialQuotationData._id ? updatedQuotation : item,
        ),
      );
      setEditMode(false);
      setShowAll(true);
      setInitialQuotationData(DEFAULTDATA);
      setOpenManualQuotation(false); // Close popup

      toast.success("Quotation updated successfully");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Error updating quotation");
    }
  };

  const handleManualQuotation = async (values) => {
    // console.log(values);
    // return;
    try {
      const { data } = await axios.post(
        `${API_URI}/quotation`,
        values,
        getHeaders(),
      );
      setAllQuotations([data.newQuotation, ...allQuotaions]);
      setInitialQuotationData(DEFAULTDATA); // Reset form data
      setOpenManualQuotation(false); // Close popup
      toast.success("Quotation added successfully");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Error adding quotation");
    }
  };

  const handleExportToExcel = async () => {
    try {
      // Get quotations data for the date range
      const {
        data: { quotations },
      } = await axios.get(
        `${API_URI}/quotations`,
        getHeaders({
          fromDate: exportDates.isAllTime ? "" : exportDates.fromDate,
          toDate: exportDates.isAllTime ? "" : exportDates.toDate,
          onlyManual: IS_CLIENT_SHEET,
          ...(selectedAgent && { agentName: selectedAgent?.name }),
          type: selectedQuotationType?.key || "msr",
        }),
      );

      // Transform data for Excel
      const excelDataMsr = quotations.map((q) => ({
        Date: q.date,
        "Agent Name": q.agentName,
        Name: q.name,
        "Company Name": q.companyName,
        Address: q.address,
        Location: q.location,
        "Nature of Business": q.natureOfBusiness,
        "Lead From": q.leadFrom,
        "Client/Consultant": q.isForClient ? "Client" : "Consultant",
        "Phone Number": q.number,
        Email: q.email,
        "Quotation Number": q.orderNumber,
        Requirements: Array.isArray(q.documentsRequired)
          ? q.documentsRequired.join(", ")
          : q.documentsRequired,
        "ISO Sample Certificate": q.isoSample,
        Remarks: q.remarks,
        Feedback: q.feedback,
      }));

      const excelDataQcci = quotations.map((q) => ({
        "Company Name": q.companyName,
        Date: q.date,
        "Address Of Head Office": q.addressOfHeadOffice,
        Standard: q.standard,
        "No Of Sites": q.noOfSites,
        "No Of Employees": q.noOfEmployees,
        "Scope Of Registration": q.scopeOfRegistration,
        "Certification Board": q.certificationBoard,
        "Contact Person Name": q.contactPersonName,
        "Phone No": q.phoneNo,
        "Gst Applicable": q.gstApplicable,
      }));

      const excelDataSmb = quotations.map((q) => ({
        "Company Name": q.companyName,
        "Contact Person Name": q.contactPersonName,
        "Phone No": q.phoneNo,
        Email: q.email,
        Date: q.date,
        Gstin: q.gstin,
        Discount: q.discount,
        "Gst Applicable": q.gstApplicable,
        "Sub Total": q.subTotal,
        "Grand Total": q.grandTotal,
      }));

      const getExcelData = {
        msr: excelDataMsr,
        qcci: excelDataQcci,
        smb: excelDataSmb,
      };

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(
        getExcelData[selectedQuotationType?.key || "msr"],
      );

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, "Quotations");

      // Generate Excel file
      const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // Download file
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // Create dynamic file name based on export settings
      const fileName = exportDates.isAllTime
        ? `${IS_CLIENT_SHEET ? "ClientSheet " : "quotations"}-all-time-${moment().format("YYYY-MM-DD")}.xlsx`
        : `${IS_CLIENT_SHEET ? "ClientSheet " : "quotations"}-${exportDates.fromDate}-to-${exportDates.toDate}.xlsx`;

      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setOpenExportPopup(false);
      toast.success("Excel file downloaded successfully");
    } catch (error) {
      toast.error("Error exporting to Excel");
      console.error("Error exporting to Excel:", error);
    }
  };

  async function fetchAllQuotations() {
    try {
      setLoading(true);

      const {
        data: { quotations, page, limit, totalDocuments, totalPages },
      } = await axios.get(
        `${API_URI}/quotations`,
        getHeaders({
          onlyManual: IS_CLIENT_SHEET,
          ...(selectedAgent && { agentName: selectedAgent?.name }),
          ...(selectedQuotationType && { type: selectedQuotationType?.key }),
          ...(selectedDate.fromDate != "" && {
            fromDate: selectedDate.fromDate,
          }),
          ...(selectedDate.toDate != "" && { toDate: selectedDate.toDate }),
          ...(searchQuotation != "" && { searchQuery: searchQuotation }),
          page: pagination.page,
          limit: pagination.limit,
        }),
      );
      console.log("Quotations fetched:", quotations);
      setAllQuotations(
        isBackend
          ? quotations.filter((v) => v.agentName == "Backend")
          : quotations,
      );

      // Update pagination state with data from API
      setPagination((prev) => ({
        ...prev,
        page: page || prev.page,
        limit: limit || prev.limit,
        total: totalDocuments || 0,
      }));
    } catch (error) {
      console.log("Error fetching quotations:", error?.response?.data?.message);
    } finally {
      setLoading(false);
    }
  }

  const calculateTotalQuotAmt = (row) => {
    if (selectedQuotationType?.key == "msr") {
      const licenseTotal = row?.licenseRegistrationFees?.reduce(
        (acc, curr) => acc + (Number(curr.total) || 0),
        0,
      );
      const discountedAmount = licenseTotal - (Number(row.discount) || 0);
      const gstAmount = row.isGST ? discountedAmount * 0.18 : 0;
      const final = discountedAmount + gstAmount || 0;
      return final.toLocaleString("en-IN");
    } else if (selectedQuotationType?.key == "qcci") {
      const auditTotal = row?.auditFeeTable?.reduce(
        (acc, curr) => acc + (Number(curr.fee) || 0),
        0,
      );
      const gstApplied = row.gstApplicable ? auditTotal * 0.18 : 0;
      const final = auditTotal + gstApplied || 0;
      return final.toLocaleString("en-IN");
    } else if (selectedQuotationType?.key == "smb") {
      const priceDescTotal = row?.priceDescription?.reduce(
        (acc, curr) => acc + (Number(curr.amount) || 0),
        0,
      );
      const discountedTotal = priceDescTotal - (Number(row.discount) || 0);
      const final = discountedTotal || 0;
      return final.toLocaleString("en-IN");
    }

    return 0;
  };

  const handleBulkTransfer = async () => {
    try {
      await axios.post(
        `${API_URI}/quotations/bulk-transfer`,
        {
          transferFrom: transfer?.transferFrom,
          transferTo: transfer?.transferTo,
          isManuallyCreated: IS_CLIENT_SHEET,
        },
        getHeaders(),
      );
      fetchAllQuotations();
      // console.log("Bulk Transfer Data", data);
      setIsOpenBulk(false);
      setTransfer({
        transferFrom: "",
        transferTo: "",
      });
      toast.success("Bulk Transfer Done");
    } catch (error) {
      console.log("Error in bulk transfer", error);
      toast.error("Error in bulk transfer");
    }
  };

  useEffect(() => {
    showAll && fetchAllQuotations();
  }, [
    showAll,
    IS_CLIENT_SHEET,
    selectedAgent,
    selectedQuotationType,
    selectedDate,
    pagination.page,
    pagination.limit,
    searchQuotation,
  ]);
  useEffect(() => {
    setShowAll(true);
  }, [IS_CLIENT_SHEET]);

  useEffect(() => {
    state?.isNewQuotation && setShowAll(false);
  }, []);

  const getFormBasedOnPdfType = () => {
    if (pdfConfig.type === "smb") {
      return (
        <ShopBarcodeForm
          handleUpdateQuotation={handleUpdateQ}
          editMode={editMode}
          initialData={initialQuotationData}
        />
      );
    } else if (pdfConfig.type === "qcci") {
      return (
        <QCCIForm
          handleUpdateQuotation={handleUpdateQ}
          editMode={editMode}
          initialData={initialQuotationData}
        />
      );
    } else if (pdfConfig.type === "msr") {
      return (
        <QuotationForm
          initialData={initialQuotationData}
          onSubmit={editMode ? handleUpdateQuotation : handleSubmit}
          leadDetails={leadDetails}
          editMode={editMode}
          key={editMode}
        />
      );
    }
    return <ShopBarcodeForm />;
  };

  return (
    <div>
      <h3 className="text-black text-center flex-1 text-5xl"></h3>
      <BackHeader
        showBtn={true}
        title={IS_CLIENT_SHEET ? "Client Sheet" : "Quotation Generation"}
        addbuttonText={
          IS_CLIENT_SHEET
            ? "Add Manual Lead"
            : showAll
              ? "Generate New Quotation"
              : "View All Quotations"
        }
        onClick={() => {
          if (!IS_CLIENT_SHEET) {
            setShowAll(!showAll);
            setInitialQuotationData(DEFAULTDATA);
            setViewMode(false);
            setEditMode(false);
            if (showAll) {
              setPdfConfig({
                type: "",
                show: true,
              });
            }
          } else {
            setOpenManualQuotation(true);
          }
        }}
        key={"quotation"}
      >
        {showAll && !openManualQuotation && (
          <div className="flex gap-4 mt-2 ">
            {!isAgent && !isBackend && (
              <Autocomplete
                options={agentList ? agentList : []}
                getOptionLabel={(option) => option.name}
                sx={{ minWidth: 150 }}
                value={selectedAgent}
                onChange={(e, val) => {
                  setSelectedAgent(val);
                }}
                size="small"
                renderInput={(params) => (
                  <MyInput
                    {...params}
                    label={"Select Agent"}
                    placeholder={"Select Quoted By"}
                    slotProps={{
                      inputLabel: {
                        shrink: true,
                      },
                    }}
                  />
                )}
              />
            )}
            {!isAgent && !isBackend && (
              <Autocomplete
                options={[
                  { name: "MSR", key: "msr" },
                  { name: "QCCI", key: "qcci" },
                  { name: "Shop My Barcode", key: "smb" },
                ]}
                getOptionLabel={(option) => option.name}
                sx={{ minWidth: 150 }}
                value={selectedQuotationType}
                disableClearable
                onChange={(e, val) => {
                  setSelectedQuotationType(val);
                }}
                size="small"
                renderInput={(params) => (
                  <MyInput
                    {...params}
                    label={"Filter By Quotation Type"}
                    placeholder={"Select Type"}
                    slotProps={{
                      inputLabel: {
                        shrink: true,
                      },
                    }}
                  />
                )}
              />
            )}
            <Button
              variant="contained"
              onClick={() => setIsShowDate(!isShowDate)}
              size="small"
            >
              Select date Range
            </Button>
            <Button
              variant="outlined"
              onClick={() =>
                setSelectedDate({
                  fromDate: "",
                  toDate: "",
                })
              }
              size="small"
            >
              Clear Range
            </Button>
            {/* </Button> */}
            {!isAgent && !isBackend && !isSalesManager && (
              <Button
                variant="contained"
                size="small"
                onClick={() => {
                  setIsOpenBulk(true);
                }}
              >
                Bulk Transfer
              </Button>
            )}

            {/*
            <MyInput
              type="date"
              label={"From date"}
              value={selectedDate.fromDate}
              width={"200px"}
              onChange={(e) =>
                setSelectedDate({ ...selectedDate, fromDate: e.target.value })
              }
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
            />
            <MyInput
              type="date"
              label={"To date"}
              value={selectedDate.toDate}
              width={"200px"}
              onChange={(e) =>
                setSelectedDate({ ...selectedDate, toDate: e.target.value })
              }
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
            />
             <Button
              variant="contained"
              size="small"
              onClick={() => {
                setSelectedAgent(null);
                setSelectedDate({
                  fromDate: "",
                  toDate: "",
                });
              }}
            >
              Clear
            </Button>
         {!isAgent && !isBackend && !isSalesManager &&    <Button
              variant="outlined"
              size="small"
              onClick={() => {
                setIsOpenBulk(true);
              }}
            >
              Bulk Transfer
            </Button>}
            */}
            {!isAgent && !isBackend && !isSalesManager && (
              <Button
                variant="contained"
                size="small"
                style={{ backgroundColor: "#4CAF50" }}
                sx={{ textWrap: "nowrap", maxWidth: "300px" }}
                onClick={() => setOpenExportPopup(true)}
              >
                Export to Excel
              </Button>
            )}
            <TextField
              label="Search "
              placeholder="Search by Name, Number, Company Name "
              size="small"
              onChange={DEBOUNCE(
                (e) => setSearchQuotations(e.target.value),
                500,
              )}
            />
          </div>
        )}
      </BackHeader>

      {/* Export to Excel Popup */}
      <Dialog open={openExportPopup} onClose={() => setOpenExportPopup(false)}>
        <DialogTitle>
          Export {IS_CLIENT_SHEET ? "Client Sheet" : "Quotations"} to Excel
        </DialogTitle>
        <DialogContent>
          <div className="flex flex-col gap-4 mt-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="allTime"
                checked={exportDates.isAllTime}
                onChange={(e) =>
                  setExportDates((prev) => ({
                    ...prev,
                    isAllTime: e.target.checked,
                  }))
                }
              />
              <label htmlFor="allTime">Export All Time Data</label>
            </div>
            <MyInput
              type="date"
              label="From Date"
              value={exportDates.fromDate}
              onChange={(e) =>
                setExportDates((prev) => ({
                  ...prev,
                  fromDate: e.target.value,
                }))
              }
              disabled={exportDates.isAllTime}
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
            />
            <MyInput
              type="date"
              label="To Date"
              value={exportDates.toDate}
              onChange={(e) =>
                setExportDates((prev) => ({ ...prev, toDate: e.target.value }))
              }
              disabled={exportDates.isAllTime}
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenExportPopup(false)}>Cancel</Button>
          <Button
            variant="contained"
            style={{ backgroundColor: "#4CAF50", color: "#fff" }}
            onClick={handleExportToExcel}
            disabled={
              !exportDates.isAllTime &&
              !exportDates.fromDate &&
              !exportDates.toDate
            }
          >
            Export
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={isOpenBulk} onClose={() => setIsOpenBulk(false)}>
        <DialogTitle>Bulk Transfer</DialogTitle>
        <DialogContent>
          <Box>
            <Box p={2}>
              {/* <h2>Transfer from</h2> */}
              <Autocomplete
                id="combo-box-demo"
                options={
                  agentList
                    ? [
                        "admin",
                        "Sales Manager",
                        ...agentList.map((item) => item?.name),
                      ]
                    : []
                }
                style={{ minWidth: 200 }}
                value={transfer?.transferFrom}
                onChange={(e, val) => {
                  console.log(val);
                  setTransfer((prev) => ({
                    ...prev,
                    transferFrom: val,
                  }));
                  // setSelectedStatus(val);
                  // val && handleUpdateAgent(val);
                }}
                // disabled={selectedLeads.length == 0}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Transfer from "
                    variant="outlined"
                    size="small"
                    // value={selectedStatus}
                  />
                )}
              />
            </Box>
            <Box p={2}>
              {/* <h2>Transfer from</h2> */}
              <Autocomplete
                id="combo-box-demo"
                options={
                  agentList
                    ? [
                        "admin",
                        "Sales Manager",
                        ...agentList.map((item) => item?.name),
                      ]
                    : []
                }
                // getOptionLabel={(option) => option.name}
                value={transfer?.transferTo}
                style={{ minWidth: 200 }}
                onChange={(e, val) => {
                  console.log(val);
                  setTransfer((prev) => ({
                    ...prev,
                    transferTo: val,
                  }));
                  // setSelectedStatus(val);
                  // val && handleUpdateAgent(val);
                }}
                // disabled={selectedLeads.length == 0}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Transfer To "
                    variant="outlined"
                    size="small"
                    // value={selectedStatus}
                  />
                )}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setIsOpenBulk(false);
              setTransfer({
                transferFrom: "",
                transferTo: "",
              });
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              handleBulkTransfer();
            }}
          >
            Transfer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Select Pdf Type */}
      <Dialog
        open={pdfConfig.show}
        onClose={() => {
          setPdfConfig((prev) => ({ ...prev, show: false }));
          setShowAll(true);
        }}
      >
        <DialogTitle>Select Quotation Type</DialogTitle>
        <DialogContent>
          <Box width={250}>
            <FormControl fullWidth>
              <Select
                size="small"
                labelId="pdf"
                id="pdf-select"
                value={pdfConfig?.type || ""}
                displayEmpty
                onChange={(e) => {
                  console.log(e.target.value);
                  setPdfConfig((prev) => ({
                    show: false,
                    type: e.target.value,
                  }));
                }}
              >
                <MenuItem value="" disabled>
                  Select
                </MenuItem>
                <MenuItem value="smb">Shop My BarCode</MenuItem>
                <MenuItem value="qcci">QCCI Quotation</MenuItem>
                <MenuItem value="msr">MSR</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setPdfConfig((prev) => ({ ...prev, show: false }));
              setShowAll(true);
            }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={isShowDate} onClose={() => setIsShowDate(false)}>
        <DialogContent>
          <DateRangePicker
            ranges={[dateRange]}
            onChange={(v) => {
              setDateRange(v.selection);
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsShowDate(false)}>Cancel</Button>
          <Button
            onClick={() => {
              setSelectedDate({
                fromDate: moment(dateRange.startDate).format("YYYY-MM-DD"),
                toDate: moment(dateRange.endDate).format("YYYY-MM-DD"),
              });
              setIsShowDate(false);
              // setIsShowDate(false);
              // })
            }}
            variant="contained"
          >
            Apply
          </Button>
        </DialogActions>
      </Dialog>

      {loading ? (
        <div className="w-full mt-16 flex items-center justify-center">
          <Loader />
        </div>
      ) : (
        <main className="container mx-auto p-4 md:p-6">
          {!showAll ? (
            <div className="bg-white rounded-lg shadow-lg p-4 md:p-6">
              {getFormBasedOnPdfType()}
            </div>
          ) : (
            <div>
              <QuotationTable
                // tableHeadersprops={tableHeaderSmb}
                quotationType={selectedQuotationType?.key || "msr"}
                quotations={allQuotaions}
                handleEditQuotation={handleEditQuotaion}
                handleViewQuotation={handleViewQuotaion}
                calculateTotalQuotAmt={calculateTotalQuotAmt}
                pagination={pagination}
                onPageChange={(page) =>
                  setPagination((prev) => ({ ...prev, page }))
                }
                IS_CLIENT_SHEET={IS_CLIENT_SHEET}
              />
              {/* <div className="flex justify-center mt-4">
                <Pagination
                  count={Math.ceil(allQuotaions.length / pagination.limit)}
                  page={pagination.page}
                  onChange={(e, value) => {
                    setPagination({ ...pagination, page: value });
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  variant="outlined"
                  shape="rounded"
                />
              </div> */}
            </div>
          )}
        </main>
      )}
      {openManualQuotation && (
        <AddManualQuotation
          open={openManualQuotation}
          handleClose={() => {
            setOpenManualQuotation(false);
            setInitialQuotationData(DEFAULTDATA);
          }}
          onSubmit={
            initialQuotationData?._id
              ? handleUpdateQuotation
              : handleManualQuotation
          }
          initialData={initialQuotationData}
          editMode={initialQuotationData?._id ? true : false}
        />
      )}
    </div>
  );
};

export default Quotation;
