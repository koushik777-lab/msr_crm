import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  Select,
  MenuItem,
  Autocomplete,
  TextField,
  Grid,
  InputLabel,
  Box,
} from "@mui/material";
import MyInput from "../../components/MyInput";
import moment from "moment";
import { useAuth } from "../../context/AuthContext";

export default function AddManualQuotation({
  open,
  handleClose,
  onSubmit,
  initialData,
  editMode,
}) {
  const { isAgent, user, isSalesManager, isBackend } = useAuth();
  // console.log("EDIT MODE ", editMode);
  console.log("IS SALES MANAGER ", isSalesManager);
  const [formData, setFormData] = useState({
    agentName: isAgent
      ? user?.name
      : isSalesManager
        ? "Sales Manager"
        : isBackend
          ? "Backend"
          : "admin",
    date: moment().format("YYYY-MM-DD"),
    reminder: "",
    name: "",
    companyName: "",
    address: "",
    location: "",
    natureOfBusiness: "",
    leadFrom: "",
    isForClient: true,
    number: "",
    email: "",
    orderNumber: "",
    documentsRequired: [],
    isoSample: "",
    remarks: "",
    feedback: "",
    isManuallyCreated: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    console.log(initialData, initialData?.reminder);
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        ...initialData,
        ...(initialData?.reminder && {
          reminder: moment(initialData.reminder).format("YYYY-MM-DD"),
        }),
        date: moment(initialData.date).format("YYYY-MM-DD"),
      }));
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        ...(initialData?._id && { _id: initialData._id }),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const leadFromOptions = [
    "OTHERS",
    "GOOGLE MANUAL",
    "FB ADS",
    "FB MANUAL",
    "INSTAGRAM",
    "MCA",
    "GST",
    "INDIAMART",
    "JUST DIAL",
    "REF",
    "RENEWAL DATA",
    "SURVELLIANCE ",
    "GOOGLE ADS",
    "WHATSAPP MKT",
    "EMAIL MKT",
    "CONSULTANT",
  ];

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {initialData?._id ? "Edit Manual Lead" : "Add Manual Lead"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <MyInput
                label="Agent Name"
                name="agentName"
                value={formData.agentName}
                onChange={handleChange}
                inputProps={{
                  readOnly: true,
                }}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={6}>
              <MyInput
                label="Date"
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                inputProps={{
                  readOnly: editMode,
                }}
                fullWidth
                required
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <MyInput
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={6}>
              <MyInput
                label="Company Name"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                fullWidth
                // required
              />
            </Grid>
            <Grid item xs={12}>
              <MyInput
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                fullWidth
                multiline
                rows={2}
                // required
              />
              <Box sx={{ mt: 2 }}>
                <MyInput
                  label="Reminder Date"
                  type="date"
                  name="reminder"
                  value={formData.reminder}
                  onChange={handleChange}
                  fullWidth
                  // required
                  slotProps={{
                    inputLabel: {
                      shrink: true,
                    },
                  }}
                />
              </Box>
            </Grid>
            <Grid item xs={6}>
              <MyInput
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <MyInput
                label="Nature of Business"
                name="natureOfBusiness"
                value={formData.natureOfBusiness}
                onChange={handleChange}
                fullWidth
                // required
              />
            </Grid>
            <Grid item xs={6}>
              <Autocomplete
                freeSolo
                options={leadFromOptions}
                value={formData.leadFrom}
                onChange={(e, value) =>
                  setFormData((prev) => ({
                    ...prev,
                    leadFrom: value,
                  }))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Lead From"
                    size="small"
                    fullWidth
                  />
                )}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth variant="outlined" size="small">
                <InputLabel id="isForClient-label">Quotation For</InputLabel>
                <Select
                  labelId="isForClient-label"
                  size="small"
                  value={formData.isForClient}
                  name="isForClient"
                  onChange={handleChange}
                  label="Quotation For"
                >
                  <MenuItem value={true}>Client</MenuItem>
                  <MenuItem value={false}>Consultant</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <MyInput
                label="Contact Number"
                name="number"
                value={formData.number}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={6}>
              <MyInput
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                fullWidth
                // required
              />
            </Grid>
            <Grid item xs={6}>
              <MyInput
                label="Quoted Price"
                name="orderNumber"
                value={formData.orderNumber}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <MyInput
                label="ISO Sample Certificate"
                name="isoSample"
                value={formData.isoSample}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Remarks"
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                multiline
                rows={4}
                placeholder="Enter remarks..."
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Feedback"
                name="feedback"
                value={formData.feedback}
                onChange={handleChange}
                multiline
                rows={4}
                placeholder="Enter feedback..."
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <MyInput
                label="Requirements"
                name="documentsRequired"
                value={formData.documentsRequired}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    documentsRequired: e.target.value.split(","),
                  }))
                }
                fullWidth
                multiline
                rows={2}
                placeholder="Enter requirements separated by commas"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} type="button">
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting
              ? initialData?._id
                ? "Updating..."
                : "Submitting..."
              : initialData?._id
                ? "Update"
                : "Submit"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
