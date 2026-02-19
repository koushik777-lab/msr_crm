import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
  Box,
  CircularProgress,
  Autocomplete,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import moment from "moment";
import axios from "axios";
import toast from "react-hot-toast";
import { API_URI } from "../../utils/constants";
import { getHeaders } from "../../utils/helpers";
import { useAuth } from "../../context/AuthContext";
import { useAgentContext } from "../../context/AgentContext";

const AddRenewalPopup = ({
  isOpen,
  onClose,
  editMode = false,
  renewalData = null,
  onSuccess,
}) => {
  const { user, isAgent } = useAuth();
  const { agentList } = useAgentContext();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    "S_ NO": "",
    STANDARD: "",
    BODY: "",
    "ISSUE DATE": null,
    "1ST SURV": null,
    "2ND SURV": null,
    "EXPIRY DATE": null,
    "COMPANY NAME": "",
    ADDRESS: "",
    "NATURE OF BUSINESS": "",
    "CERTIFICATE NO_": "",
    "E- MAILD ID": "",
    "CONTACT NO_": "",
    "CONTACT PERSON": "",
    "MARKETING EXECUTIVE": "",
    "CLIENT / CONSULTANT": "",
    "RECEIVABLE A/C": "",
    AMOUNT: "",
    "AMOUNT RECEIVED DATE": null,
    REMARKS: "",
    agent: isAgent ? user._id : "",
    status: "Unassigned",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editMode && renewalData) {
      const updatedFormData = {
        ...renewalData,
        "ISSUE DATE": renewalData["ISSUE DATE"]
          ? moment(renewalData["ISSUE DATE"], "DD.MM.YYYY")
          : null,
        "1ST SURV": renewalData["1ST SURV"]
          ? moment(renewalData["1ST SURV"], "DD.MM.YYYY")
          : null,
        "2ND SURV": renewalData["2ND SURV"]
          ? moment(renewalData["2ND SURV"], "DD.MM.YYYY")
          : null,
        "EXPIRY DATE": renewalData["EXPIRY DATE"]
          ? moment(renewalData["EXPIRY DATE"], "DD.MM.YYYY")
          : null,
        "AMOUNT RECEIVED DATE": renewalData["AMOUNT RECEIVED DATE"]
          ? moment(renewalData["AMOUNT RECEIVED DATE"], "DD.MM.YYYY")
          : null,
        agent: renewalData.agent || "",
        status: renewalData.status || "Unassigned",
      };
      setFormData(updatedFormData);
    } else {
      // Reset form for add mode
      setFormData({
        "S_ NO": "",
        STANDARD: "",
        BODY: "",
        "ISSUE DATE": null,
        "1ST SURV": null,
        "2ND SURV": null,
        "EXPIRY DATE": null,
        "COMPANY NAME": "",
        ADDRESS: "",
        "NATURE OF BUSINESS": "",
        "CERTIFICATE NO_": "",
        "E- MAILD ID": "",
        "CONTACT NO_": "",
        "CONTACT PERSON": "",
        "MARKETING EXECUTIVE": "",
        "CLIENT / CONSULTANT": "",
        "RECEIVABLE A/C": "",
        AMOUNT: "",
        "AMOUNT RECEIVED DATE": null,
        REMARKS: "",
        agent: isAgent ? user._id : "",
        status: "Unassigned",
      });
    }
    setErrors({});
  }, [editMode, renewalData, isOpen, user._id, isAgent]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields validation
    if (!formData["COMPANY NAME"]) {
      newErrors["COMPANY NAME"] = "Company name is required";
    }

    if (!formData["CONTACT NO_"]) {
      newErrors["CONTACT NO_"] = "Contact number is required";
    }

    if (!formData["CERTIFICATE NO_"]) {
      newErrors["CERTIFICATE NO_"] = "Certificate number is required";
    }

    if (
      formData["E- MAILD ID"] &&
      !/\S+@\S+\.\S+/.test(formData["E- MAILD ID"])
    ) {
      newErrors["E- MAILD ID"] = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (editMode) {
        // Update existing renewal - use PUT request to update individual fields
        const updateData = {
          "S_ NO": formData["S_ NO"],
          STANDARD: formData["STANDARD"],
          BODY: formData["BODY"],
          "ISSUE DATE": formData["ISSUE DATE"]
            ? formData["ISSUE DATE"].toDate()
            : null,
          "1ST SURV": formData["1ST SURV"]
            ? formData["1ST SURV"].toDate()
            : null,
          "2ND SURV": formData["2ND SURV"]
            ? formData["2ND SURV"].toDate()
            : null,
          "EXPIRY DATE": formData["EXPIRY DATE"]
            ? formData["EXPIRY DATE"].toDate()
            : null,
          "COMPANY NAME": formData["COMPANY NAME"],
          ADDRESS: formData["ADDRESS"],
          "NATURE OF BUSINESS": formData["NATURE OF BUSINESS"],
          "CERTIFICATE NO_": formData["CERTIFICATE NO_"],
          "E- MAILD ID": formData["E- MAILD ID"],
          "CONTACT NO_": formData["CONTACT NO_"],
          "CONTACT PERSON": formData["CONTACT PERSON"],
          "MARKETING EXECUTIVE": formData["MARKETING EXECUTIVE"],
          "CLIENT / CONSULTANT": formData["CLIENT / CONSULTANT"],
          "RECEIVABLE A/C": formData["RECEIVABLE A/C"],
          AMOUNT: formData["AMOUNT"],
          "AMOUNT RECEIVED DATE": formData["AMOUNT RECEIVED DATE"]
            ? formData["AMOUNT RECEIVED DATE"].toDate()
            : null,
          REMARKS: formData["REMARKS"],
          agent: formData.agent || null,
          status: formData.status,
        };

        await axios.put(
          `${API_URI}/renewal/${renewalData._id}`,
          updateData,
          getHeaders(),
        );

        toast.success("Renewal updated successfully");
      } else {
        // Create new renewal
        const renewalArray = [
          {
            "S_ NO": formData["S_ NO"],
            STANDARD: formData["STANDARD"],
            BODY: formData["BODY"],
            "ISSUE DATE": formData["ISSUE DATE"]
              ? formData["ISSUE DATE"].format("DD.MM.YYYY")
              : "",
            "1ST SURV": formData["1ST SURV"]
              ? formData["1ST SURV"].format("DD.MM.YYYY")
              : "",
            "2ND SURV": formData["2ND SURV"]
              ? formData["2ND SURV"].format("DD.MM.YYYY")
              : null,
            "EXPIRY DATE": formData["EXPIRY DATE"]
              ? formData["EXPIRY DATE"].format("DD.MM.YYYY")
              : "",
            "COMPANY NAME": formData["COMPANY NAME"],
            ADDRESS: formData["ADDRESS"],
            "NATURE OF BUSINESS": formData["NATURE OF BUSINESS"],
            "CERTIFICATE NO_": formData["CERTIFICATE NO_"],
            "E- MAILD ID": formData["E- MAILD ID"],
            "CONTACT NO_": formData["CONTACT NO_"],
            "CONTACT PERSON": formData["CONTACT PERSON"],
            "MARKETING EXECUTIVE": formData["MARKETING EXECUTIVE"],
            "CLIENT / CONSULTANT": formData["CLIENT / CONSULTANT"],
            "RECEIVABLE A/C": formData["RECEIVABLE A/C"],
            AMOUNT: formData["AMOUNT"],
            "AMOUNT RECEIVED DATE": formData["AMOUNT RECEIVED DATE"]
              ? formData["AMOUNT RECEIVED DATE"].format("DD.MM.YYYY")
              : "",
            REMARKS: formData["REMARKS"],
            agent: formData.agent || null,
            status: formData.status,
          },
        ];

        await axios.post(
          `${API_URI}/renewal`,
          { renewal: renewalArray },
          getHeaders(),
        );

        toast.success("Renewal added successfully");
      }

      onSuccess && onSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving renewal:", error);
      toast.error(
        editMode ? "Failed to update renewal" : "Failed to add renewal",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      "S_ NO": "",
      STANDARD: "",
      BODY: "",
      "ISSUE DATE": null,
      "1ST SURV": null,
      "2ND SURV": null,
      "EXPIRY DATE": null,
      "COMPANY NAME": "",
      ADDRESS: "",
      "NATURE OF BUSINESS": "",
      "CERTIFICATE NO_": "",
      "E- MAILD ID": "",
      "CONTACT NO_": "",
      "CONTACT PERSON": "",
      "MARKETING EXECUTIVE": "",
      "CLIENT / CONSULTANT": "",
      "RECEIVABLE A/C": "",
      AMOUNT: "",
      "AMOUNT RECEIVED DATE": null,
      REMARKS: "",
      agent: isAgent ? user._id : "",
      status: "Unassigned",
    });
    setErrors({});
    onClose();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <Dialog
        open={isOpen}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { maxHeight: "90vh" },
        }}
      >
        <DialogTitle>
          {editMode ? "Edit Renewal" : "Add New Renewal"}
        </DialogTitle>

        <DialogContent dividers sx={{ maxHeight: "70vh", overflowY: "auto" }}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Serial Number */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Serial Number"
                value={formData["S_ NO"]}
                onChange={(e) => handleInputChange("S_ NO", e.target.value)}
                size="small"
              />
            </Grid>

            {/* Standard */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Standard"
                value={formData["STANDARD"]}
                onChange={(e) => handleInputChange("STANDARD", e.target.value)}
                size="small"
              />
            </Grid>

            {/* Body */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Body"
                value={formData["BODY"]}
                onChange={(e) => handleInputChange("BODY", e.target.value)}
                size="small"
              />
            </Grid>

            {/* Certificate Number */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Certificate Number *"
                value={formData["CERTIFICATE NO_"]}
                onChange={(e) =>
                  handleInputChange("CERTIFICATE NO_", e.target.value)
                }
                error={!!errors["CERTIFICATE NO_"]}
                helperText={errors["CERTIFICATE NO_"]}
                size="small"
              />
            </Grid>

            {/* Company Name */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Company Name *"
                value={formData["COMPANY NAME"]}
                onChange={(e) =>
                  handleInputChange("COMPANY NAME", e.target.value)
                }
                error={!!errors["COMPANY NAME"]}
                helperText={errors["COMPANY NAME"]}
                size="small"
              />
            </Grid>

            {/* Address */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Address"
                value={formData["ADDRESS"]}
                onChange={(e) => handleInputChange("ADDRESS", e.target.value)}
                size="small"
              />
            </Grid>

            {/* Nature of Business */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nature of Business"
                value={formData["NATURE OF BUSINESS"]}
                onChange={(e) =>
                  handleInputChange("NATURE OF BUSINESS", e.target.value)
                }
                size="small"
              />
            </Grid>

            {/* Contact Person */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Contact Person"
                value={formData["CONTACT PERSON"]}
                onChange={(e) =>
                  handleInputChange("CONTACT PERSON", e.target.value)
                }
                size="small"
              />
            </Grid>

            {/* Contact Number */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Contact Number *"
                value={formData["CONTACT NO_"]}
                onChange={(e) =>
                  handleInputChange("CONTACT NO_", e.target.value)
                }
                error={!!errors["CONTACT NO_"]}
                helperText={errors["CONTACT NO_"]}
                size="small"
              />
            </Grid>

            {/* Email */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email ID"
                type="email"
                value={formData["E- MAILD ID"]}
                onChange={(e) =>
                  handleInputChange("E- MAILD ID", e.target.value)
                }
                error={!!errors["E- MAILD ID"]}
                helperText={errors["E- MAILD ID"]}
                size="small"
              />
            </Grid>

            {/* Marketing Executive */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Marketing Executive"
                value={formData["MARKETING EXECUTIVE"]}
                onChange={(e) =>
                  handleInputChange("MARKETING EXECUTIVE", e.target.value)
                }
                size="small"
              />
            </Grid>

            {/* Client/Consultant */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Client / Consultant"
                value={formData["CLIENT / CONSULTANT"]}
                onChange={(e) =>
                  handleInputChange("CLIENT / CONSULTANT", e.target.value)
                }
                size="small"
              />
            </Grid>

            {/* Receivable A/C */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Receivable A/C"
                value={formData["RECEIVABLE A/C"]}
                onChange={(e) =>
                  handleInputChange("RECEIVABLE A/C", e.target.value)
                }
                size="small"
              />
            </Grid>

            {/* Amount */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Amount"
                type="number"
                value={formData["AMOUNT"]}
                onChange={(e) => handleInputChange("AMOUNT", e.target.value)}
                size="small"
              />
            </Grid>

            {/* Issue Date */}
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Issue Date"
                value={formData["ISSUE DATE"]}
                onChange={(newValue) =>
                  handleInputChange("ISSUE DATE", newValue)
                }
                renderInput={(params) => (
                  <TextField {...params} fullWidth size="small" />
                )}
                slotProps={{ textField: { fullWidth: true, size: "small" } }}
              />
            </Grid>

            {/* 1st Survey */}
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="1st Survey"
                value={formData["1ST SURV"]}
                onChange={(newValue) => handleInputChange("1ST SURV", newValue)}
                renderInput={(params) => (
                  <TextField {...params} fullWidth size="small" />
                )}
                slotProps={{ textField: { fullWidth: true, size: "small" } }}
              />
            </Grid>

            {/* 2nd Survey */}
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="2nd Survey"
                value={formData["2ND SURV"]}
                onChange={(newValue) => handleInputChange("2ND SURV", newValue)}
                renderInput={(params) => (
                  <TextField {...params} fullWidth size="small" />
                )}
                slotProps={{ textField: { fullWidth: true, size: "small" } }}
              />
            </Grid>

            {/* Expiry Date */}
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Expiry Date"
                value={formData["EXPIRY DATE"]}
                onChange={(newValue) =>
                  handleInputChange("EXPIRY DATE", newValue)
                }
                renderInput={(params) => (
                  <TextField {...params} fullWidth size="small" />
                )}
                slotProps={{ textField: { fullWidth: true, size: "small" } }}
              />
            </Grid>

            {/* Amount Received Date */}
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Amount Received Date"
                value={formData["AMOUNT RECEIVED DATE"]}
                onChange={(newValue) =>
                  handleInputChange("AMOUNT RECEIVED DATE", newValue)
                }
                renderInput={(params) => (
                  <TextField {...params} fullWidth size="small" />
                )}
                slotProps={{ textField: { fullWidth: true, size: "small" } }}
              />
            </Grid>

            {/* Agent Assignment (only for admin users) */}
            {user?.type === "admin" && (
              <Grid item xs={12} sm={6}>
                <Autocomplete
                  options={agentList}
                  getOptionLabel={(option) => option.name}
                  value={
                    agentList.find((agent) => agent._id === formData.agent) ||
                    null
                  }
                  onChange={(event, newValue) => {
                    handleInputChange("agent", newValue ? newValue._id : "");
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Assign Agent"
                      size="small"
                      fullWidth
                    />
                  )}
                />
              </Grid>
            )}

            {/* Remarks */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Remarks"
                value={formData["REMARKS"]}
                onChange={(e) => handleInputChange("REMARKS", e.target.value)}
                size="small"
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading
              ? editMode
                ? "Updating..."
                : "Adding..."
              : editMode
                ? "Update"
                : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default AddRenewalPopup;
