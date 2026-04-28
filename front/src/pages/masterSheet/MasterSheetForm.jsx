import React, { useEffect } from "react";
import { Box, Grid, TextField, Button, Typography, MenuItem, Autocomplete, Paper, Divider } from "@mui/material";
import { useFormik } from "formik";
import * as yup from "yup";
import axios from "axios";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { API_URI } from "../../utils/constants";
import { getHeaders } from "../../utils/helpers";
import { ACCREDITATION_BODIES, CERTIFICATION_BODIES, STANDARDS, CLIENT_CONSULTANT_OPTIONS, ACCOUNT_NAMES } from "./constants";

const validationSchema = yup.object({
    companyName: yup.string().required("Company Name is required"),
    emailId: yup.string().email("Enter a valid email"),
    contactNumber: yup.string(),
    amount: yup.number().typeError("Amount must be a number"),
});

const MasterSheetForm = ({ onSuccess, editRecord, onCancelEdit, isPublic = false }) => {
    const formik = useFormik({
        initialValues: {
            accreditationBody: "", accreditationBodyOther: "",
            certificationBody: "", certificationBodyOther: "",
            standard: "", standardOther: "",
            issueDate: new Date().toISOString().split('T')[0], firstSurvDate: "", secondSurvDate: "", expireDate: "",
            companyName: "", address: "", scope: "", certificateNo: "", courierDate: "",
            emailId: "", contactNumber: "", contactPerson: "", marketingExecutive: "",
            clientConsultant: "", clientConsultantOther: "",
            amount: "", accountName: "", accountNameOther: "", dateReceived: "",
        },
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            const loadingToast = toast.loading(editRecord ? "Updating record..." : "Saving record...");
            try {
                if (editRecord) {
                    await axios.put(`${API_URI}/master-sheet/${editRecord._id}`, values, getHeaders());
                } else {
                    // Call the public route if generated via link, otherwise the protected route
                    await axios.post(`${API_URI}/master-sheet${isPublic ? '/public' : ''}`, values, isPublic ? undefined : getHeaders());
                }
                toast.dismiss(loadingToast);
                toast.success(editRecord ? "Record updated successfully!" : "Record added successfully!");
                formik.resetForm();
                if (onCancelEdit) onCancelEdit();
                if (onSuccess) onSuccess();
            } catch (error) {
                toast.dismiss(loadingToast);
                toast.error(error.response?.data?.message || `Failed to ${editRecord ? "update" : "add"} record`);
            }
        },
    });

    useEffect(() => {
        if (editRecord) {
            const formatData = { ...editRecord };
            ['issueDate', 'firstSurvDate', 'secondSurvDate', 'expireDate', 'courierDate', 'dateReceived'].forEach(dateField => {
                if (formatData[dateField]) {
                    formatData[dateField] = new Date(formatData[dateField]).toISOString().split('T')[0];
                } else {
                    formatData[dateField] = "";
                }
            });
            Object.keys(formik.initialValues).forEach(key => {
                if (formatData[key] === null || formatData[key] === undefined) formatData[key] = "";
            });
            formik.setValues(formatData);
        } else {
            formik.resetForm();
        }
    }, [editRecord]);

    // Automatic Date Calculation Logic
    useEffect(() => {
        if (formik.values.issueDate && !editRecord) {
            const issueDate = new Date(formik.values.issueDate);
            
            // Helper function to format date as YYYY-MM-DD
            const formatDate = (date) => date.toISOString().split('T')[0];

            // 1st Surv Date: Issue Date + 1 Year - 1 Day
            const firstSurv = new Date(issueDate);
            firstSurv.setFullYear(firstSurv.getFullYear() + 1);
            firstSurv.setDate(firstSurv.getDate() - 1);
            
            // 2nd Surv Date: Issue Date + 2 Years - 1 Day
            const secondSurv = new Date(issueDate);
            secondSurv.setFullYear(secondSurv.getFullYear() + 2);
            secondSurv.setDate(secondSurv.getDate() - 1);
            
            // Expire Date: Issue Date + 3 Years - 1 Day
            const expire = new Date(issueDate);
            expire.setFullYear(expire.getFullYear() + 3);
            expire.setDate(expire.getDate() - 1);

            formik.setFieldValue("firstSurvDate", formatDate(firstSurv));
            formik.setFieldValue("secondSurvDate", formatDate(secondSurv));
            formik.setFieldValue("expireDate", formatDate(expire));
        }
    }, [formik.values.issueDate, editRecord]);

    // This renders the dynamic "Other" box
    const renderConditionalField = (fieldName, label, conditionValue = "Others") => {
        const isVisible = Array.isArray(conditionValue)
            ? conditionValue.includes(formik.values[fieldName])
            : formik.values[fieldName] === conditionValue;

        const otherFieldName = `${fieldName}Other`;
        const dynamicLabel = fieldName === 'clientConsultant'
            ? `${formik.values.clientConsultant} Name (optional)`
            : `Enter ${label} Name`;

        return (
            <AnimatePresence>
                {isVisible && (
                    <Grid item xs={12} component={motion.div} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}>
                        <TextField
                            fullWidth id={otherFieldName} name={otherFieldName}
                            label={dynamicLabel}
                            value={formik.values[otherFieldName]}
                            onChange={formik.handleChange}
                            variant="outlined" size="small"
                        />
                    </Grid>
                )}
            </AnimatePresence>
        );
    };

    return (
        <Paper elevation={0} sx={{ p: 4, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
            <form onSubmit={formik.handleSubmit}>
                <Grid container spacing={3}>
                    {!isPublic && (
                        <>
                            <Grid item xs={12} md={6}>
                                <TextField fullWidth select id="accreditationBody" name="accreditationBody" label="Accreditation Body" value={formik.values.accreditationBody} onChange={formik.handleChange} variant="outlined" size="small">
                                    {ACCREDITATION_BODIES.map((option) => (<MenuItem key={option} value={option}>{option}</MenuItem>))}
                                </TextField>
                            </Grid>
                            {renderConditionalField("accreditationBody", "Accreditation Body")}

                            <Grid item xs={12} md={6}>
                                <TextField fullWidth select id="certificationBody" name="certificationBody" label="Certification Body" value={formik.values.certificationBody} onChange={formik.handleChange} variant="outlined" size="small">
                                    {CERTIFICATION_BODIES.map((option) => (<MenuItem key={option} value={option}>{option}</MenuItem>))}
                                </TextField>
                            </Grid>
                            {renderConditionalField("certificationBody", "Certification Body")}
                        </>
                    )}

                    {/* SEARCHABLE DROPDOWN MENU */}
                    <Grid item xs={12} md={6}>
                        <Autocomplete
                            options={STANDARDS}
                            getOptionLabel={(option) => option}
                            renderInput={(params) => (<TextField {...params} label="STANDARD" variant="outlined" size="small" />)}
                            value={formik.values.standard}
                            onChange={(event, newValue) => { formik.setFieldValue("standard", newValue || ""); }}
                        />
                    </Grid>
                    {renderConditionalField("standard", "Standard")}

                    {!isPublic && (
                        <>
                            <Grid item xs={12}><Divider sx={{ my: 1 }}>Dates</Divider></Grid>
                            <Grid item xs={12} md={3}><TextField fullWidth type="date" id="issueDate" name="issueDate" label="Issue Date" InputLabelProps={{ shrink: true }} value={formik.values.issueDate} onChange={formik.handleChange} size="small" /></Grid>
                            <Grid item xs={12} md={3}><TextField fullWidth type="date" id="firstSurvDate" name="firstSurvDate" label="1st Surveillance Date" InputLabelProps={{ shrink: true }} value={formik.values.firstSurvDate} onChange={formik.handleChange} size="small" /></Grid>
                            <Grid item xs={12} md={3}><TextField fullWidth type="date" id="secondSurvDate" name="secondSurvDate" label="2nd Surveillance Date" InputLabelProps={{ shrink: true }} value={formik.values.secondSurvDate} onChange={formik.handleChange} size="small" /></Grid>
                            <Grid item xs={12} md={3}><TextField fullWidth type="date" id="expireDate" name="expireDate" label="Expire Date" InputLabelProps={{ shrink: true }} value={formik.values.expireDate} onChange={formik.handleChange} size="small" /></Grid>
                        </>
                    )}

                    {/* COMPANY SECTION */}
                    <Grid item xs={12}><Divider sx={{ my: 1 }}>Company Details</Divider></Grid>
                    <Grid item xs={12} md={6}><TextField fullWidth id="companyName" name="companyName" label="Company Name" value={formik.values.companyName} onChange={formik.handleChange} error={formik.touched.companyName && Boolean(formik.errors.companyName)} helperText={formik.touched.companyName && formik.errors.companyName} size="small" /></Grid>
                    {!isPublic && (
                        <Grid item xs={12} md={6}><TextField fullWidth id="certificateNo" name="certificateNo" label="Certificate No." value={formik.values.certificateNo} onChange={formik.handleChange} size="small" /></Grid>
                    )}
                    <Grid item xs={12} md={6}><TextField fullWidth multiline rows={2} id="address" name="address" label="Address" value={formik.values.address} onChange={formik.handleChange} size="small" /></Grid>
                    <Grid item xs={12} md={6}><TextField fullWidth multiline rows={2} id="scope" name="scope" label="Scope" value={formik.values.scope} onChange={formik.handleChange} size="small" /></Grid>

                    {/* CONTACT SECTION */}
                    <Grid item xs={12}><Divider sx={{ my: 1 }}>Contact Information</Divider></Grid>
                    <Grid item xs={12} md={4}><TextField fullWidth id="contactNumber" name="contactNumber" label="Contact Number" value={formik.values.contactNumber} onChange={formik.handleChange} size="small" /></Grid>
                    <Grid item xs={12} md={4}><TextField fullWidth id="emailId" name="emailId" label="Email ID" value={formik.values.emailId} onChange={formik.handleChange} error={formik.touched.emailId && Boolean(formik.errors.emailId)} helperText={formik.touched.emailId && formik.errors.emailId} size="small" /></Grid>
                    {!isPublic && (
                        <>
                            <Grid item xs={12} md={4}><TextField fullWidth id="contactPerson" name="contactPerson" label="Contact Person" value={formik.values.contactPerson} onChange={formik.handleChange} size="small" /></Grid>
                            <Grid item xs={12} md={4}><TextField fullWidth id="marketingExecutive" name="marketingExecutive" label="Marketing Executive" value={formik.values.marketingExecutive} onChange={formik.handleChange} size="small" /></Grid>
                            <Grid item xs={12} md={4}><TextField fullWidth type="date" id="courierDate" name="courierDate" label="Courier Date" InputLabelProps={{ shrink: true }} value={formik.values.courierDate} onChange={formik.handleChange} size="small" /></Grid>
                        </>
                    )}

                    {!isPublic && (
                        <>
                            <Grid item xs={12}><Divider sx={{ my: 1 }}>Financial & Client Details</Divider></Grid>
                            <Grid item xs={12} md={4}>
                                <TextField fullWidth select id="clientConsultant" name="clientConsultant" label="Client / Consultant" value={formik.values.clientConsultant} onChange={formik.handleChange} size="small">
                                    {CLIENT_CONSULTANT_OPTIONS.map((option) => (<MenuItem key={option} value={option}>{option}</MenuItem>))}
                                </TextField>
                            </Grid>
                            {renderConditionalField("clientConsultant", "Name", ["Client", "Consultant"])}

                            <Grid item xs={12} md={4}><TextField fullWidth id="amount" name="amount" label="Amount" type="number" value={formik.values.amount} onChange={formik.handleChange} error={formik.touched.amount && Boolean(formik.errors.amount)} helperText={formik.touched.amount && formik.errors.amount} size="small" /></Grid>
                            
                            <Grid item xs={12} md={4}>
                                <TextField fullWidth select id="accountName" name="accountName" label="Account Name" value={formik.values.accountName} onChange={formik.handleChange} size="small">
                                    {ACCOUNT_NAMES.map((option) => (<MenuItem key={option} value={option}>{option}</MenuItem>))}
                                </TextField>
                            </Grid>
                            {renderConditionalField("accountName", "Account Name")}

                            <Grid item xs={12} md={4}><TextField fullWidth type="date" id="dateReceived" name="dateReceived" label="Date Received" InputLabelProps={{ shrink: true }} value={formik.values.dateReceived} onChange={formik.handleChange} size="small" /></Grid>
                        </>
                    )}

                    {/* SUBMIT, RESET & COPY LINK BUTTONS */}
                    <Grid item xs={12} sx={{ mt: 3, display: 'flex', gap: 2 }}>
                        <Button color="primary" variant="contained" type="submit" sx={{ px: 4, py: 1, borderRadius: 2, fontWeight: 'bold' }}>
                            {editRecord ? "Update Record" : "Submit"}
                        </Button>

                        {editRecord ? (
                            <Button color="inherit" variant="outlined" onClick={() => { formik.resetForm(); if (onCancelEdit) onCancelEdit(); }} sx={{ px: 4, py: 1, borderRadius: 2, fontWeight: 'bold' }}>Cancel Edit</Button>
                        ) : (
                            <Button color="inherit" variant="outlined" onClick={() => formik.resetForm()} sx={{ px: 4, py: 1, borderRadius: 2, fontWeight: 'bold' }}>Reset</Button>
                        )}

                        {/* COPY LINK FEATURE */}
                        {!editRecord && !isPublic && (
                            <Button color="secondary" variant="outlined"
                                onClick={() => {
                                    const link = `${window.location.origin}/public/master-sheet/form`;
                                    navigator.clipboard.writeText(link);
                                    toast.success("Link copied to clipboard!");
                                }}
                                sx={{ px: 4, py: 1, borderRadius: 2, fontWeight: 'bold', ml: 'auto' }}
                            >
                                Copy Link
                            </Button>
                        )}
                    </Grid>
                </Grid>
            </form>
        </Paper>
    );
};

export default MasterSheetForm;
