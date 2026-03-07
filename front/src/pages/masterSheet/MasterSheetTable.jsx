import React, { useState, useEffect, useMemo } from "react";
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    TextField,
    InputAdornment,
    Pagination,
    Button,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from "@mui/material";
import { FiSearch, FiEdit2, FiTrash2, FiEye, FiDownload } from "react-icons/fi";
import axios from "axios";
import toast from "react-hot-toast";
import moment from "moment";
import * as XLSX from "xlsx";
import { API_URI } from "../../utils/constants";
import { getHeaders, DEBOUNCE } from "../../utils/helpers";

const MasterSheetTable = ({ onEdit }) => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const [search, setSearch] = useState("");
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);

    useEffect(() => {
        fetchRecords();
    }, [page, search]);

    const fetchRecords = async () => {
        setLoading(true);
        try {
            const response = await axios.get(
                `${API_URI}/master-sheet?page=${page}&limit=${limit}&search=${search}`,
                getHeaders()
            );
            setRecords(response.data.records);
            setTotalCount(response.data.totalCount);
        } catch (error) {
            toast.error("Failed to fetch records");
        } finally {
            setLoading(false);
        }
    };

    const handleSearchChange = DEBOUNCE((e) => {
        setSearch(e.target.value);
        setPage(1);
    }, 500);

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this record?")) {
            try {
                await axios.delete(`${API_URI}/master-sheet/${id}`, getHeaders());
                toast.success("Record deleted successfully");
                fetchRecords();
            } catch (error) {
                toast.error("Failed to delete record");
            }
        }
    };

    const handleExport = (format) => {
        const dataToExport = records.map((record) => ({
            "S. No.": record["S_ NO"],
            "Accreditation Body": record.accreditationBody === "Others" ? record.accreditationBodyOther : record.accreditationBody,
            "Certification Body": record.certificationBody === "Others" ? record.certificationBodyOther : record.certificationBody,
            "Standard": record.standard === "Others" ? record.standardOther : record.standard,
            "Issue Date": record.issueDate ? moment(record.issueDate).format("DD/MM/YYYY") : "",
            "1st Surv Date": record.firstSurvDate ? moment(record.firstSurvDate).format("DD/MM/YYYY") : "",
            "2nd Surv Date": record.secondSurvDate ? moment(record.secondSurvDate).format("DD/MM/YYYY") : "",
            "Expire Date": record.expireDate ? moment(record.expireDate).format("DD/MM/YYYY") : "",
            "Company Name": record.companyName,
            "Certificate No.": record.certificateNo,
            "Contact Person": record.contactPerson,
            "Amount": record.amount,
            "Account Name": record.accountName === "Others" ? record.accountNameOther : record.accountName,
            "Date Received": record.dateReceived ? moment(record.dateReceived).format("DD/MM/YYYY") : "",
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Master Sheet");

        if (format === "xlsx") {
            XLSX.writeFile(workbook, "MasterSheet.xlsx");
        } else {
            XLSX.writeFile(workbook, "MasterSheet.csv", { bookType: "csv" });
        }
    };

    // Helper to extract nested groups
    const renderDetailSection = (title, fields) => (
        <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, color: 'primary.main', borderBottom: '1px solid #eee', pb: 0.5 }}>
                {title}
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                {fields.map((item, index) => (
                    <Box key={index} sx={item.fullWidth ? { gridColumn: 'span 2' } : {}}>
                        <Typography variant="caption" color="textSecondary">{item.label}</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>{item.value || "N/A"}</Typography>
                    </Box>
                ))}
            </Box>
        </Box>
    );

    const renderViewDialog = () => (
        <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
            <DialogTitle sx={{ fontWeight: 'bold' }}>Record Details (S. No: {selectedRecord?.["S_ NO"]})</DialogTitle>
            <DialogContent dividers>
                {selectedRecord && (
                    <Box>
                        {renderDetailSection("General Information", [
                            { label: "Company Name", value: selectedRecord.companyName, fullWidth: true },
                            { label: "Accreditation Body", value: selectedRecord.accreditationBody === "Others" ? selectedRecord.accreditationBodyOther : selectedRecord.accreditationBody },
                            { label: "Certification Body", value: selectedRecord.certificationBody === "Others" ? selectedRecord.certificationBodyOther : selectedRecord.certificationBody },
                            { label: "Standard", value: selectedRecord.standard === "Others" ? selectedRecord.standardOther : selectedRecord.standard },
                        ])}

                        {renderDetailSection("Dates", [
                            { label: "Issue Date", value: selectedRecord.issueDate ? moment(selectedRecord.issueDate).format("DD/MM/YYYY") : "N/A" },
                            { label: "1st Surveillance Date", value: selectedRecord.firstSurvDate ? moment(selectedRecord.firstSurvDate).format("DD/MM/YYYY") : "N/A" },
                            { label: "2nd Surveillance Date", value: selectedRecord.secondSurvDate ? moment(selectedRecord.secondSurvDate).format("DD/MM/YYYY") : "N/A" },
                            { label: "Expire Date", value: selectedRecord.expireDate ? moment(selectedRecord.expireDate).format("DD/MM/YYYY") : "N/A" },
                            { label: "Courier Date", value: selectedRecord.courierDate ? moment(selectedRecord.courierDate).format("DD/MM/YYYY") : "N/A" },
                        ])}

                        {renderDetailSection("Company Details", [
                            { label: "Certificate No.", value: selectedRecord.certificateNo },
                            { label: "Address", value: selectedRecord.address, fullWidth: true },
                            { label: "Scope", value: selectedRecord.scope, fullWidth: true },
                        ])}

                        {renderDetailSection("Contact Information", [
                            { label: "Contact Person", value: selectedRecord.contactPerson },
                            { label: "Contact Number", value: selectedRecord.contactNumber },
                            { label: "Email ID", value: selectedRecord.emailId },
                            { label: "Marketing Executive", value: selectedRecord.marketingExecutive },
                        ])}

                        {renderDetailSection("Financial & Client Details", [
                            { label: "Client / Consultant", value: selectedRecord.clientConsultant === "Other" ? selectedRecord.clientConsultantOther : selectedRecord.clientConsultant },
                            { label: "Amount", value: selectedRecord.amount },
                            { label: "Account Name", value: selectedRecord.accountName === "Others" ? selectedRecord.accountNameOther : selectedRecord.accountName },
                            { label: "Date Received", value: selectedRecord.dateReceived ? moment(selectedRecord.dateReceived).format("DD/MM/YYYY") : "N/A" },
                        ])}
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
            </DialogActions>
        </Dialog>
    );

    return (
        <Box>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <TextField
                    placeholder="Search Company, Certificate, Person..."
                    variant="outlined"
                    size="small"
                    onChange={handleSearchChange}
                    sx={{ width: { xs: '100%', sm: 300 } }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <FiSearch />
                            </InputAdornment>
                        ),
                    }}
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                        variant="outlined"
                        startIcon={<FiDownload />}
                        size="small"
                        onClick={() => handleExport('xlsx')}
                    >
                        Export Excel
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<FiDownload />}
                        size="small"
                        onClick={() => handleExport('csv')}
                    >
                        Export CSV
                    </Button>
                </Box>
            </Box>

            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'auto' }}>
                <Table sx={{ minWidth: 2800 }} aria-label="master sheet table">
                    <TableHead sx={{ backgroundColor: '#f9fafb' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>S. No.</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Company Name</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Accreditation Body</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Certification Body</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Standard</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Issue Date</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>1st Surv Date</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>2nd Surv Date</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Expire Date</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Certificate No.</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', minWidth: 200 }}>Address</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', minWidth: 250 }}>Scope</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Contact Person</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Contact Number</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Email ID</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Marketing Executive</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Courier Date</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Client / Consultant</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Amount</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Account Name</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Date Received</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold', whiteSpace: 'nowrap', position: 'sticky', right: 0, backgroundColor: '#f9fafb', zIndex: 2, boxShadow: '-2px 0 5px -2px rgba(0,0,0,0.1)' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={22} align="center" sx={{ py: 10 }}>
                                    <CircularProgress size={40} />
                                </TableCell>
                            </TableRow>
                        ) : records.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={22} align="center" sx={{ py: 10 }}>
                                    <Typography variant="body1" color="textSecondary">No records found</Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            records.map((record) => (
                                <TableRow key={record._id} hover>
                                    <TableCell>{record["S_ NO"]}</TableCell>
                                    <TableCell sx={{ fontWeight: 'medium', whiteSpace: 'nowrap' }}>{record.companyName}</TableCell>
                                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{record.accreditationBody === "Others" ? record.accreditationBodyOther : record.accreditationBody}</TableCell>
                                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{record.certificationBody === "Others" ? record.certificationBodyOther : record.certificationBody}</TableCell>
                                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{record.standard === "Others" ? record.standardOther : record.standard}</TableCell>
                                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{record.issueDate ? moment(record.issueDate).format("DD/MM/YYYY") : "-"}</TableCell>
                                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{record.firstSurvDate ? moment(record.firstSurvDate).format("DD/MM/YYYY") : "-"}</TableCell>
                                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{record.secondSurvDate ? moment(record.secondSurvDate).format("DD/MM/YYYY") : "-"}</TableCell>
                                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{record.expireDate ? moment(record.expireDate).format("DD/MM/YYYY") : "-"}</TableCell>
                                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{record.certificateNo || "-"}</TableCell>
                                    <TableCell sx={{ minWidth: 200 }}>{record.address || "-"}</TableCell>
                                    <TableCell sx={{ minWidth: 250 }}>{record.scope || "-"}</TableCell>
                                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{record.contactPerson || "-"}</TableCell>
                                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{record.contactNumber || "-"}</TableCell>
                                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{record.emailId || "-"}</TableCell>
                                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{record.marketingExecutive || "-"}</TableCell>
                                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{record.courierDate ? moment(record.courierDate).format("DD/MM/YYYY") : "-"}</TableCell>
                                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{record.clientConsultant === "Other" ? record.clientConsultantOther : record.clientConsultant}</TableCell>
                                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{record.amount || "-"}</TableCell>
                                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{record.accountName === "Others" ? record.accountNameOther : record.accountName}</TableCell>
                                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{record.dateReceived ? moment(record.dateReceived).format("DD/MM/YYYY") : "-"}</TableCell>
                                    <TableCell sx={{ position: 'sticky', right: 0, backgroundColor: 'white', zIndex: 1, boxShadow: '-2px 0 5px -2px rgba(0,0,0,0.1)' }}>
                                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                                            <IconButton size="small" color="primary" onClick={() => { setSelectedRecord(record); setViewDialogOpen(true); }}>
                                                <FiEye fontSize="small" />
                                            </IconButton>
                                            <IconButton size="small" color="secondary" onClick={() => onEdit && onEdit(record)}>
                                                <FiEdit2 fontSize="small" />
                                            </IconButton>
                                            <IconButton size="small" color="error" onClick={() => handleDelete(record._id)}>
                                                <FiTrash2 fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                <Pagination
                    count={Math.ceil(totalCount / limit)}
                    page={page}
                    onChange={(e, v) => setPage(v)}
                    color="primary"
                    shape="rounded"
                />
            </Box>

            {renderViewDialog()}
        </Box>
    );
};

export default MasterSheetTable;
