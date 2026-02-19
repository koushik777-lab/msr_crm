import React, { useEffect, useState } from "react";
import {
  Formik,
  Form,
  Field,
  ErrorMessage,
  FieldArray,
  useField,
} from "formik";
import * as Yup from "yup";
import MyInput from "../../components/MyInput";
import {
  Autocomplete,
  FormControl,
  InputAdornment,
  InputLabel,
  Menu,
  MenuItem,
  Select,
  TextField,
} from "@mui/material"; // Add this import
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { marketingChannels } from "../../utils/helpers";
import moment from "moment";
import { AccountDetails, quotationServices } from "../../constants/constant";

// Custom form field component to bridge MyInput with Formik
const FormikField = ({ name, label, type = "text", placeholder, ...props }) => {
  const [field, meta] = useField(name);

  return (
    <div>
      <MyInput
        label={label}
        type={type}
        placeholder={placeholder}
        {...field}
        error={meta.touched && !!meta.error}
        helperText={meta.touched && meta.error ? meta.error : ""}
        {...props}
      />
    </div>
  );
};

// Custom Autocomplete component that integrates with Formik
const FormikAutocomplete = ({ name, label, options, ...props }) => {
  const [field, meta, helpers] = useField(name);

  return (
    <Autocomplete
      options={options}
      value={field.value}
      label={label}
      onChange={(_, newValue) => {
        helpers.setValue(newValue);
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          variant="outlined"
          size="small"
          label={label}
          error={meta.touched && !!meta.error}
          helperText={meta.touched && meta.error ? meta.error : ""}
        />
      )}
      style={{ width: "180px" }}
      {...props}
    />
  );
};

const QuotationForm = ({ initialData, onSubmit, editMode }) => {
  console.log({ initialData, editMode });
  // Add loading state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize documents required based on initial services when form loads
  useEffect(() => {
    if (
      initialData &&
      !editMode && // Only auto-populate documents in create mode, not edit mode
      (initialData.licenseRegistrationFees?.length > 0 ||
        initialData.feeStructureCompliances?.length > 0)
    ) {
      // If we have initial services data, populate documents required
      const licenseServices = (initialData.licenseRegistrationFees || [])
        .map((item) => item.service)
        .filter(Boolean);

      const complianceServices = (initialData.feeStructureCompliances || [])
        .map((item) => item.service)
        .filter(Boolean);

      const allServices = [...licenseServices, ...complianceServices];

      // Get all document options for the selected services
      const uniqueDocuments = new Set();
      allServices.forEach((serviceName) => {
        const serviceObj = quotationServices.find(
          (service) => service.service === serviceName,
        );
        if (serviceObj && serviceObj.soleOptions) {
          serviceObj.soleOptions.forEach((doc) => uniqueDocuments.add(doc));
        }
      });

      // If there are any documents from services, use them as initial values
      const documentsList = Array.from(uniqueDocuments);
      if (documentsList.length > 0) {
        initialData.documentsRequired = documentsList;
      }
    }
  }, [initialData, editMode]);

  const handleSubmit = async (values, { setSubmitting }) => {
    console.log("FORM SUBMIT", values);
    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
      setSubmitting(false);
    }
  };

  // Initialize form with default values
  const initialFormData = {
    // orderNo: initialData.orderNo || "",
    date: moment(initialData?.date).format("YYYY-MM-DD") || "",
    company: initialData?.company || "",
    address: initialData?.address || "",
    services: initialData?.services || "",
    natureOfBusiness: initialData?.natureOfBusiness || "",
    entityType: initialData?.entityType || "Sole Proprietorship",
    namePrefix: initialData?.namePrefix || "Mr",
    employeeNumber: initialData?.employeeNumber || "",
    locationNumber: initialData?.locationNumber || "",
    number: initialData?.number || "",
    name: initialData?.name || "",
    email: initialData?.email || "",
    currencyType: initialData?.currencyType || "INR",
    licenseRegistrationFees: initialData?.licenseRegistrationFees || [],
    feeStructureCompliances: initialData?.feeStructureCompliances || [],
    discount: (initialData?.discount && Number(initialData?.discount)) || "",
    isGST: !!initialData?.isGST,
    accountDetails: initialData?.accountDetails || {
      withGST: "",
      withoutGST: "",
    },
    note: initialData?.note || "",
    documentsRequired: initialData?.documentsRequired || [""],
    quotedBy: initialData?.quotedBy || "",
    acceptedBy: initialData?.name || "",
    // new fields
    remarks: initialData?.remarks || "",
    reminder: initialData?.reminder
      ? moment(initialData?.reminder).format("YYYY-MM-DD")
      : "",

    feedback: initialData?.feedback || "",
    isForClient: initialData?.isForClient,
    leadFrom: initialData?.leadFrom || "",
    location: initialData?.location || "",
  };

  console.log("FORMIK FORM DATA", initialFormData);

  // Validation schema
  const validationSchema = Yup.object({
    // orderNo: Yup.string().required("Order number is required"),
    date: Yup.string().required("Date is required"),
    company: Yup.string().required("Company name is required"),
    address: Yup.string().required("Address is required"),
    // services: Yup.string().required("Services are required"),
    natureOfBusiness: Yup.string().required("Nature of business is required"),
    number: Yup.string().required("Contact is required"),
    name: Yup.string().required("Contact person name is required"),
    email: Yup.string()
      .email("Invalid email format")
      .required("Email is required"),
    locationNumber: Yup.number().typeError(
      "Number of locations should be a number",
    ),
    employeeNumber: Yup.number().typeError(
      "Number of employees should be a number",
    ),
  });

  // Handle adding a license item with field type selection
  const handleAddLicenseItem = (arrayHelpers, values) => {
    if (values.licenseRegistrationFees.length >= 15) {
      alert("Limit Exceeded: You can add maximum 15 items only");
      return;
    }

    // Using browser confirm instead of Alert from React Native
    const useThreeFields = window.confirm(
      "Do you want to add Professional Fees",
    );

    arrayHelpers.push({
      service: "",
      serviceDocs: "",
      feeType: "Govt./Others", // Default fee type
      fees: "",
      professionalFees: "",
      total: "",
      showThreeFields: useThreeFields,
    });

    // No immediate need to update documents as new item has empty service
  };

  // Handle adding a compliance item with field type selection
  const handleAddComplianceItem = (arrayHelpers, values) => {
    if (values.feeStructureCompliances.length >= 15) {
      alert("Limit Exceeded: You can add maximum 15 items only");
      return;
    }

    const useThreeFields = window.confirm(
      "Do you want to add Professional Fees",
    );

    arrayHelpers.push({
      service: "",
      serviceDocs: "",
      feeType: "Govt./Others", // Default fee type
      fees: "",
      professionalFees: "",
      total: "",
      showThreeFields: useThreeFields,
    });

    // No immediate need to update documents as new item has empty service
  };

  // Calculate total when fees change
  const calculateTotal = (item) => {
    if (item.fees && item.professionalFees) {
      return (
        parseFloat(item.fees) + parseFloat(item.professionalFees)
      ).toString();
    }
    return "";
  };

  // Helper function to get document options for a service based on entity type
  const getDocumentOptionsForService = (serviceName, entityType) => {
    const serviceObj = quotationServices.find(
      (service) => service.service === serviceName,
    );

    if (!serviceObj) return [];

    // Return appropriate options based on entity type
    if (entityType === "Sole Proprietorship") {
      return serviceObj.soleOptions || [];
    } else if (
      entityType === "Limited Liability Partnership (LLP)" ||
      entityType === "Private Limited"
    ) {
      return serviceObj.pvtOptions || serviceObj.soleOptions || [];
    }

    // Default to soleOptions if entity type is not recognized
    return serviceObj.soleOptions || [];
  };

  // Function to recalculate the document set based on all selected services
  const updateDocumentsRequired = (values, setFieldValue) => {
    // Collect all service names
    const licenseServices = values.licenseRegistrationFees
      .map((item) => item.service)
      .filter(Boolean);
    const complianceServices = values.feeStructureCompliances
      .map((item) => item.service)
      .filter(Boolean);
    const selectedServices = [...licenseServices, ...complianceServices];

    // Create a set of unique document options
    const uniqueDocuments = new Set();

    // Add document options for each service based on entity type
    selectedServices.forEach((serviceName) => {
      const options = getDocumentOptionsForService(
        serviceName,
        values.entityType,
      );
      options.forEach((option) => uniqueDocuments.add(option));
    });

    // Convert set to array
    const serviceDocumentsList = Array.from(uniqueDocuments);

    // Identify which documents are service-generated and which are manually added
    // First, create a cache of all possible service documents for quick lookup
    const allPossibleServiceDocs = new Set();
    quotationServices.forEach((service) => {
      const soleOptions = service.soleOptions || [];
      const pvtOptions = service.pvtOptions || [];
      [...soleOptions, ...pvtOptions].forEach((doc) =>
        allPossibleServiceDocs.add(doc),
      );
    });

    // Find manually added documents (those that don't exist in any service options)
    const manuallyAddedDocs = values.documentsRequired.filter(
      (doc) => doc && !allPossibleServiceDocs.has(doc),
    );

    // Always preserve manually added documents in both edit and create mode
    // Combine service documents with manually added documents
    const combinedDocsList = [...serviceDocumentsList, ...manuallyAddedDocs];

    // If there are no documents, keep at least one empty string for the field array
    if (combinedDocsList.length === 0) {
      setFieldValue("documentsRequired", [""]);
    } else {
      setFieldValue("documentsRequired", combinedDocsList);
    }
  };

  // Fee type options
  const feeTypeOptions = ["Govt./Others", "Body fees/Auditor Fees"];
  const contactPersonPrefix = ["Mr", "Ms", "Mrs"];
  const currencyType = ["INR (₹)", "USD ($)"];

  return (
    <div>
      <h1 className="text-2xl text-gray-400 font-bold mb-7 border-b pb-2">
        MSR Quotation
      </h1>
      <Formik
        initialValues={initialFormData}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize={true}
      >
        {({
          values,
          errors,
          touched,
          setFieldValue,
          handleChange,
          setValues,
          isSubmitting,
        }) => {
          // Update documents required whenever services change
          useEffect(() => {
            // This will trigger when services or entity type changes
            if (
              values.licenseRegistrationFees?.length > 0 ||
              values.feeStructureCompliances?.length > 0
            ) {
              updateDocumentsRequired(values, setFieldValue);
            }
          }, [
            // Only depend on the service names, not the entire objects
            JSON.stringify(
              values.licenseRegistrationFees.map((item) => item.service),
            ),
            JSON.stringify(
              values.feeStructureCompliances.map((item) => item.service),
            ),
            values.entityType, // Add entity type as a dependency
          ]);

          return (
            <Form className="space-y-8">
              {/* Basic Information Section */}
              <div className="space-y-4">
                <h2
                  className="text-lg font-semibold border-b pb-2"
                  style={{ color: "#1364FF" }}
                >
                  Basic Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* <div>
                <FormikField
                  name="orderNo"
                  label="Order No *"
                  placeholder="Enter order number"
                />
              </div> */}

                  <div>
                    <FormikField
                      name="company"
                      label="Company Name *"
                      placeholder="Enter company name"
                      // InputProps={{
                      //   readOnly:viewMode? true : false,
                      // }}
                    />
                  </div>

                  <div>
                    <FormikField
                      name="date"
                      type="date"
                      label="Date *"
                      placeholder="DD-MM-YYYY"
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <FormikField
                    name="address"
                    label="Address "
                    placeholder="Enter address"
                  />
                </div>

                <div>
                  {/* <FormikField
                name="services"
                label="Services *"
                placeholder="Enter services"
              /> */}
                </div>

                <div>
                  <FormikField
                    name="natureOfBusiness"
                    label="Nature of Business *"
                    placeholder="Enter nature of business"
                  />
                </div>
                <div>
                  <FormikField
                    name="employeeNumber"
                    label="No. of employees"
                    placeholder="Enter number of emmployees"
                  />
                </div>
                <div className="grid grid-cols-3">
                  <FormikField
                    name="locationNumber"
                    label="No. of Locations"
                    placeholder="Enter number of locations"
                  />
                </div>
                <div className="grid grid-cols-3">
                  <FormikField
                    type="date"
                    name="reminder"
                    label="Reminder Date"
                    placeholder="Enter reminder date"
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </div>
                <ShowOnEditMode editMode={editMode}>
                  <div className="grid grid-cols-2">
                    <FormikField
                      name="location"
                      label="Locations"
                      placeholder="Enter locations"
                    />
                  </div>
                  <div className="grid grid-cols-1 mt-4">
                    <FormikAutocomplete
                      name="leadFrom"
                      label="Lead From"
                      options={marketingChannels}
                      placeholder="Select lead source"
                    />
                  </div>
                </ShowOnEditMode>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h2
                  className="text-lg font-semibold border-b pb-2"
                  style={{ color: "#1364FF" }}
                >
                  Contact Information
                </h2>

                <div>
                  <FormikField
                    name="number"
                    label="Contact *"
                    type="tel"
                    placeholder="Enter contact number"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <FormikAutocomplete
                    name={"namePrefix"}
                    options={contactPersonPrefix}
                  />
                  <div className="flex-1 w-full">
                    <FormikField
                      name="name"
                      label="Contact Person Name *"
                      placeholder="Enter contact person name"
                    />
                  </div>
                </div>

                <div>
                  <FormikField
                    name="email"
                    label="Email *"
                    type="email"
                    placeholder="Enter email address"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <h2
                  className="text-lg font-semibold border-b pb-2"
                  style={{ color: "#1364FF" }}
                >
                  Currency type
                </h2>
                <Select
                  // label="Currency type"
                  name="currencyType"
                  value={values.currencyType}
                  onChange={handleChange}
                  variant="outlined"
                  size="small"
                >
                  {currencyType.map((v, i) => (
                    <MenuItem key={i} value={v.split(" ")[0]}>
                      {v}
                    </MenuItem>
                  ))}
                  {/* <MenuItem value="USD">USD</MenuItem> */}
                </Select>
              </div>

              {/* Entity Type Section */}
              <div className="space-y-4">
                <h2
                  className="text-lg font-semibold border-b pb-2"
                  style={{ color: "#1364FF" }}
                >
                  Entity Type
                </h2>
                <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel id="entityType-label">
                    Select Entity Type
                  </InputLabel>
                  <Select
                    labelId="entityType-label"
                    id="entityType"
                    name="entityType"
                    value={values.entityType}
                    onChange={handleChange}
                    label="Select Entity Type"
                  >
                    {[
                      "Sole Proprietorship",
                      "Partnership",
                      "Limited Liability Partnership (LLP)",
                      "Private Limited",
                      "Public Company",
                      "One Person Company (OPC)",
                      "Section 8 Company",
                      "Others",
                    ].map((val, idx) => (
                      <MenuItem value={val} key={idx}>
                        {val}
                      </MenuItem>
                    ))}
                    {/* <MenuItem value="Sole Proprietorship">
                    Sole Proprietorship
                  </MenuItem>
                  <MenuItem value="Private Limited / LLP">
                    Private Limited / LLP
                  </MenuItem> */}
                  </Select>
                </FormControl>
              </div>

              {/* License Registration Fees */}
              <div className="space-y-4">
                <h2
                  className="text-lg font-semibold border-b pb-2"
                  style={{ color: "#1364FF" }}
                >
                  Fees Structure
                </h2>

                <FieldArray name="licenseRegistrationFees">
                  {(arrayHelpers) => (
                    <div className="space-y-4">
                      {values.licenseRegistrationFees.map((item, index) => (
                        <div
                          key={index}
                          className="p-4 border border-gray-200 rounded-lg"
                        >
                          <div className="flex justify-between items-center mb-3">
                            <h3 className="font-medium">Item {index + 1}</h3>
                            {index >= 0 && (
                              <button
                                type="button"
                                onClick={() => {
                                  arrayHelpers.remove(index);
                                  // After removing a service, update documents required
                                  setTimeout(() => {
                                    // Create an updated copy of the values with the item removed
                                    const updatedValues = {
                                      ...values,
                                      licenseRegistrationFees:
                                        values.licenseRegistrationFees.filter(
                                          (_, i) => i !== index,
                                        ),
                                    };
                                    updateDocumentsRequired(
                                      updatedValues,
                                      setFieldValue,
                                    );
                                  }, 0);
                                }}
                                className="text-red-500 font-medium"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                          <FormikField
                            name={`licenseRegistrationFees.${index}.serviceDocs`}
                            type="text"
                            // label="Service Docs"
                            placeholder="Enter service name"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 mb-4"
                          />
                          <div className="mb-3 mt-3">
                            {/* <label className="block text-sm font-medium text-gray-700 mb-1">
                          Service
                        </label> */}

                            <FormControl fullWidth>
                              <InputLabel
                                id={`licenseRegistrationFees-${index}-service-label`}
                              >
                                Service Docs
                              </InputLabel>
                              <Select
                                labelId={`licenseRegistrationFees-${index}-service-label`}
                                id={`licenseRegistrationFees-${index}-service`}
                                name={`licenseRegistrationFees.${index}.service`}
                                value={
                                  values.licenseRegistrationFees[index]
                                    .service || ""
                                }
                                onChange={(e) => {
                                  handleChange(e);
                                  // After service is selected, update documents required
                                  setTimeout(() => {
                                    // Create an updated values object with the new service selection
                                    const updatedValues = {
                                      ...values,
                                      licenseRegistrationFees: [
                                        ...values.licenseRegistrationFees.slice(
                                          0,
                                          index,
                                        ),
                                        {
                                          ...values.licenseRegistrationFees[
                                            index
                                          ],
                                          service: e.target.value,
                                        },
                                        ...values.licenseRegistrationFees.slice(
                                          index + 1,
                                        ),
                                      ],
                                    };
                                    updateDocumentsRequired(
                                      updatedValues,
                                      setFieldValue,
                                    );
                                  }, 0);
                                }}
                                size="small"
                                label="Service"
                              >
                                <MenuItem value="">Select a service</MenuItem>
                                {quotationServices.map((serviceOption, i) => (
                                  <MenuItem
                                    key={i}
                                    value={serviceOption.service}
                                  >
                                    {serviceOption.service}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </div>

                          {item.showThreeFields ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <div className="flex items-center gap-3 ">
                                  <FormikAutocomplete
                                    name={`licenseRegistrationFees.${index}.feeType`}
                                    label="Fee Type"
                                    options={feeTypeOptions}
                                  />{" "}
                                  <FormikField
                                    name={`licenseRegistrationFees.${index}.fees`}
                                    label="Fees"
                                    placeholder="Enter fees"
                                    onChange={(e) => {
                                      if (isNaN(Number(e.target.value))) {
                                        return;
                                      }
                                      handleChange(e);
                                      const newValue = e.target.value;
                                      setFieldValue(
                                        `licenseRegistrationFees.${index}.fees`,
                                        newValue,
                                      );

                                      // Calculate total
                                      const professionalFees =
                                        values.licenseRegistrationFees[index]
                                          .professionalFees || "0";
                                      if (newValue && professionalFees) {
                                        const total = (
                                          parseFloat(newValue) +
                                          parseFloat(professionalFees)
                                        ).toString();
                                        setFieldValue(
                                          `licenseRegistrationFees.${index}.total`,
                                          total,
                                        );
                                      }
                                    }}
                                    // InputProps={{
                                    //   startAdornment: (
                                    //     <InputAdornment position="start">
                                    //       <Select
                                    //         value={
                                    //           values.licenseRegistrationFees[index]
                                    //             .currencyTypeFees
                                    //         }
                                    //         onChange={(e) => {
                                    //           setFieldValue(
                                    //             `licenseRegistrationFees.${index}.currencyTypeFees`,
                                    //             e.target.value,
                                    //           );
                                    //         }}
                                    //         variant="standard"
                                    //         disableUnderline
                                    //       >
                                    //         <MenuItem value="₹">₹</MenuItem>
                                    //         <MenuItem value="$">$</MenuItem>
                                    //         {/* <MenuItem value="€">€</MenuItem> */}
                                    //         {/* <MenuItem value="£">£</MenuItem> */}
                                    //       </Select>
                                    //     </InputAdornment>
                                    //   ),
                                    // }}
                                  />
                                  <div className="flex-1 "></div>
                                </div>
                              </div>
                              <div>
                                {/* <label className="block text-sm font-medium text-gray-700 mb-1">
                              Professional Fees
                            </label> */}
                                <FormikField
                                  name={`licenseRegistrationFees.${index}.professionalFees`}
                                  label="Professional Fees"
                                  placeholder="Enter professional fees"
                                  onChange={(e) => {
                                    if (isNaN(Number(e.target.value))) {
                                      return;
                                    }
                                    handleChange(e);
                                    const newValue = e.target.value;
                                    setFieldValue(
                                      `licenseRegistrationFees.${index}.professionalFees`,
                                      newValue,
                                    );

                                    // Calculate total
                                    const fees =
                                      values.licenseRegistrationFees[index]
                                        .fees || "0";
                                    if (fees && newValue) {
                                      const total = (
                                        parseFloat(fees) + parseFloat(newValue)
                                      ).toString();
                                      setFieldValue(
                                        `licenseRegistrationFees.${index}.total`,
                                        total,
                                      );
                                    }
                                  }}
                                  // InputProps={{
                                  //   startAdornment: (
                                  //     <InputAdornment position="start">
                                  //       <Select
                                  //         value={
                                  //           values.licenseRegistrationFees[index]
                                  //             .currencyTypeProfessionalFees
                                  //         }
                                  //         onChange={(e) => {
                                  //           setFieldValue(
                                  //             `licenseRegistrationFees.${index}.currencyTypeProfessionalFees`,
                                  //             e.target.value,
                                  //           );
                                  //         }}
                                  //         variant="standard"
                                  //         disableUnderline
                                  //       >
                                  //         <MenuItem value="₹">₹</MenuItem>
                                  //         <MenuItem value="$">$</MenuItem>
                                  //         {/* <MenuItem value="€">€</MenuItem> */}
                                  //         {/* <MenuItem value="£">£</MenuItem> */}
                                  //       </Select>
                                  //     </InputAdornment>
                                  //   ),
                                  // }}
                                />
                                {/* <Field
                              name={`licenseRegistrationFees.${index}.professionalFees`}
                              type="number"
                              placeholder="Enter professional fees"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              onChange={(e) => {
                                handleChange(e);
                                const newValue = e.target.value;
                                setFieldValue(
                                  `licenseRegistrationFees.${index}.professionalFees`,
                                  newValue
                                );

                                // Calculate total
                                const fees =
                                  values.licenseRegistrationFees[index].fees ||
                                  "0";
                                if (fees && newValue) {
                                  const total = (
                                    parseFloat(fees) + parseFloat(newValue)
                                  ).toString();
                                  setFieldValue(
                                    `licenseRegistrationFees.${index}.total`,
                                    total
                                  );
                                }
                              }}
                            /> */}
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="flex items-center gap-3 mt-3">
                                <FormikAutocomplete
                                  name={`licenseRegistrationFees.${index}.feeType`}
                                  label="Fee Type"
                                  options={feeTypeOptions}
                                />

                                <div className="flex-1">
                                  <FormikField
                                    name={`licenseRegistrationFees.${index}.fees`}
                                    label="Fees"
                                    placeholder="Enter fees"
                                    onChange={(e) => {
                                      if (isNaN(Number(e.target.value))) {
                                        return;
                                      }
                                      handleChange(e);
                                      const newValue = e.target.value;
                                      setFieldValue(
                                        `licenseRegistrationFees.${index}.fees`,
                                        newValue,
                                      );
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() =>
                          handleAddLicenseItem(arrayHelpers, values)
                        }
                        className="w-full py-2 bg-gray-100 rounded-md hover:bg-gray-200 font-medium"
                        style={{ color: "#1364FF" }}
                      >
                        + Add Item
                      </button>
                    </div>
                  )}
                </FieldArray>
              </div>
              <div className="space-y-4">
                <h2
                  className="text-lg font-semibold border-b pb-2"
                  style={{ color: "#1364FF" }}
                >
                  Discount
                </h2>
                <div className="mb-8">
                  <FormikField
                    name={"discount"}
                    // onChange={(e) => setFieldValue("discount", e.target.value)}
                    label={"Discount"}
                    type="number"
                    placeholder={"Enter Discount"}
                  />
                </div>
              </div>
              {/* Fee Structure Compliances */}
              <div className="space-y-4">
                <h2
                  className="text-lg font-semibold border-b pb-2"
                  style={{ color: "#1364FF" }}
                >
                  Fee Structure Compliances
                </h2>

                <FieldArray name="feeStructureCompliances">
                  {(arrayHelpers) => (
                    <div className="space-y-4">
                      {values.feeStructureCompliances.map((item, index) => (
                        <div
                          key={index}
                          className="p-4 border border-gray-200 rounded-lg"
                        >
                          <div className="flex justify-between items-center mb-3">
                            <h3 className="font-medium">Item {index + 1}</h3>
                            {index >= 0 && (
                              <button
                                type="button"
                                onClick={() => {
                                  arrayHelpers.remove(index);
                                  // After removing a service, update documents required
                                  setTimeout(() => {
                                    // Create an updated copy of the values with the item removed
                                    const updatedValues = {
                                      ...values,
                                      feeStructureCompliances:
                                        values.feeStructureCompliances.filter(
                                          (_, i) => i !== index,
                                        ),
                                    };
                                    updateDocumentsRequired(
                                      updatedValues,
                                      setFieldValue,
                                    );
                                  }, 0);
                                }}
                                className="text-red-500 font-medium"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                          <FormikField
                            name={`feeStructureCompliances.${index}.serviceDocs`}
                            type="text"
                            // label="Service Docs"
                            placeholder="Enter service name"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 mb-4"
                          />

                          <div className="my-3">
                            {/* <label className="block text-sm font-medium text-gray-700 mb-1">
                          Service
                        </label> */}
                            <FormControl fullWidth>
                              <InputLabel
                                id={`feeStructureCompliances-${index}-service-label`}
                              >
                                Service
                              </InputLabel>
                              <Select
                                labelId={`feeStructureCompliances-${index}-service-label`}
                                id={`feeStructureCompliances-${index}-service`}
                                name={`feeStructureCompliances.${index}.service`}
                                value={
                                  values.feeStructureCompliances[index]
                                    .service || ""
                                }
                                onChange={(e) => {
                                  handleChange(e);
                                  // After service is selected, update documents required
                                  setTimeout(() => {
                                    // Create an updated values object with the new service selection
                                    const updatedValues = {
                                      ...values,
                                      feeStructureCompliances: [
                                        ...values.feeStructureCompliances.slice(
                                          0,
                                          index,
                                        ),
                                        {
                                          ...values.feeStructureCompliances[
                                            index
                                          ],
                                          service: e.target.value,
                                        },
                                        ...values.feeStructureCompliances.slice(
                                          index + 1,
                                        ),
                                      ],
                                    };
                                    updateDocumentsRequired(
                                      updatedValues,
                                      setFieldValue,
                                    );
                                  }, 0);
                                }}
                                size="small"
                                label="Service"
                              >
                                <MenuItem value="">Select a service</MenuItem>
                                {quotationServices.map((serviceOption, i) => (
                                  <MenuItem
                                    key={i}
                                    value={serviceOption.service}
                                  >
                                    {serviceOption.service}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                            {/* <Field
                          name={`feeStructureCompliances.${index}.service`}
                          type="text"
                          placeholder="Enter service name"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        /> */}
                          </div>

                          {item.showThreeFields ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <div className="flex items-center gap-3 ">
                                  <FormikAutocomplete
                                    name={`feeStructureCompliances.${index}.feeType`}
                                    label="Fee Type"
                                    options={feeTypeOptions}
                                  />

                                  <div className="flex-1">
                                    <FormikField
                                      name={`feeStructureCompliances.${index}.fees`}
                                      label="Fees"
                                      placeholder="Enter fees"
                                      onChange={(e) => {
                                        if (isNaN(Number(e.target.value))) {
                                          return;
                                        }
                                        handleChange(e);
                                        const newValue = e.target.value;
                                        setFieldValue(
                                          `feeStructureCompliances.${index}.fees`,
                                          newValue,
                                        );

                                        // Calculate total
                                        const professionalFees =
                                          values.feeStructureCompliances[index]
                                            .professionalFees || "0";
                                        if (newValue && professionalFees) {
                                          const total = (
                                            parseFloat(newValue) +
                                            parseFloat(professionalFees)
                                          ).toString();
                                          setFieldValue(
                                            `feeStructureCompliances.${index}.total`,
                                            total,
                                          );
                                        }
                                      }}
                                      // InputProps={{
                                      //   startAdornment: (
                                      //     <InputAdornment position="start">
                                      //       <Select
                                      //         value={
                                      //           values.feeStructureCompliances[
                                      //             index
                                      //           ].currencyTypeFees
                                      //         }
                                      //         onChange={(e) => {
                                      //           setFieldValue(
                                      //             `feeStructureCompliances.${index}.currencyTypeFees`,
                                      //             e.target.value,
                                      //           );
                                      //         }}
                                      //         variant="standard"
                                      //         disableUnderline
                                      //       >
                                      //         <MenuItem value="₹">₹</MenuItem>
                                      //         <MenuItem value="$">$</MenuItem>
                                      //       </Select>
                                      //     </InputAdornment>
                                      //   ),
                                      // }}
                                    />
                                  </div>
                                </div>
                              </div>
                              <div>
                                {/* <label className="block text-sm font-medium text-gray-700 mb-1">
                              Professional Fees
                            </label> */}
                                <FormikField
                                  name={`feeStructureCompliances.${index}.professionalFees`}
                                  label="Professional Fees"
                                  placeholder="Enter professional fees"
                                  onChange={(e) => {
                                    if (isNaN(Number(e.target.value))) {
                                      return;
                                    }
                                    handleChange(e);
                                    const newValue = e.target.value;
                                    setFieldValue(
                                      `feeStructureCompliances.${index}.professionalFees`,
                                      newValue,
                                    );

                                    // Calculate total
                                    const fees =
                                      values.feeStructureCompliances[index]
                                        .fees || "0";
                                    if (fees && newValue) {
                                      const total = (
                                        parseFloat(fees) + parseFloat(newValue)
                                      ).toString();
                                      setFieldValue(
                                        `feeStructureCompliances.${index}.total`,
                                        total,
                                      );
                                    }
                                  }}
                                  // InputProps={{
                                  //   startAdornment: (
                                  //     <InputAdornment position="start">
                                  //       <Select
                                  //         value={
                                  //           values.feeStructureCompliances[index]
                                  //             .currencyTypeProfessionalFees
                                  //         }
                                  //         onChange={(e) => {
                                  //           setFieldValue(
                                  //             `feeStructureCompliances.${index}.currencyTypeProfessionalFees`,
                                  //             e.target.value,
                                  //           );
                                  //         }}
                                  //         variant="standard"
                                  //         disableUnderline
                                  //       >
                                  //         <MenuItem value="₹">₹</MenuItem>
                                  //         <MenuItem value="$">$</MenuItem>
                                  //       </Select>
                                  //     </InputAdornment>
                                  //   ),
                                  // }}
                                />
                                {/* <Field
                              name={`feeStructureCompliances.${index}.professionalFees`}
                              type="number"
                              placeholder="Enter professional fees"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              onChange={(e) => {
                                handleChange(e);
                                const newValue = e.target.value;
                                setFieldValue(
                                  `feeStructureCompliances.${index}.professionalFees`,
                                  newValue
                                );

                                // Calculate total
                                const fees =
                                  values.feeStructureCompliances[index].fees ||
                                  "0";
                                if (fees && newValue) {
                                  const total = (
                                    parseFloat(fees) + parseFloat(newValue)
                                  ).toString();
                                  setFieldValue(
                                    `feeStructureCompliances.${index}.total`,
                                    total
                                  );
                                }
                              }}
                            /> */}
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="flex items-center gap-3 mt-3">
                                <FormikAutocomplete
                                  name={`feeStructureCompliances.${index}.feeType`}
                                  label="Fee Type"
                                  options={feeTypeOptions}
                                />

                                <div className="flex-1">
                                  <FormikField
                                    name={`feeStructureCompliances.${index}.fees`}
                                    label={"Fees"}
                                    placeholder={"Enter fees"}
                                    onChange={(e) => {
                                      if (isNaN(Number(e.target.value))) {
                                        return;
                                      }
                                      handleChange(e);
                                      const newValue = e.target.value;
                                      setFieldValue(
                                        `feeStructureCompliances.${index}.fees`,
                                        newValue,
                                      );
                                    }}
                                    // InputProps={{
                                    //   startAdornment: (
                                    //     <InputAdornment position="start">
                                    //       <Select
                                    //         value={
                                    //           values.feeStructureCompliances[index]
                                    //             .currencyTypeFees
                                    //         }
                                    //         onChange={(e) => {
                                    //           setFieldValue(
                                    //             `feeStructureCompliances.${index}.currencyTypeFees`,
                                    //             e.target.value,
                                    //           );
                                    //         }}
                                    //         variant="standard"
                                    //         disableUnderline
                                    //       >
                                    //         <MenuItem value="₹">₹</MenuItem>
                                    //         <MenuItem value="$">$</MenuItem>
                                    //       </Select>
                                    //     </InputAdornment>
                                    //   ),
                                    // }}
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() =>
                          handleAddComplianceItem(arrayHelpers, values)
                        }
                        className="w-full py-2 bg-gray-100 rounded-md hover:bg-gray-200 font-medium"
                        style={{ color: "#1364FF" }}
                      >
                        + Add Item
                      </button>
                    </div>
                  )}
                </FieldArray>
              </div>

              {/* Account Details */}
              <div className="space-y-4">
                <h2
                  className="text-lg font-semibold border-b pb-2"
                  style={{ color: "#1364FF" }}
                >
                  Account Details
                </h2>

                <div className="flex space-x-0 mb-4">
                  <button
                    type="button"
                    className={`flex-1 py-2 text-center border ${values.isGST ? "text-white" : "bg-white text-gray-700"}`}
                    style={{ backgroundColor: values.isGST ? "#1364FF" : "" }}
                    onClick={() => setFieldValue("isGST", true)}
                  >
                    With GST
                  </button>
                  <button
                    type="button"
                    className={`flex-1 py-2 text-center border ${!values.isGST ? "text-white" : "bg-white text-gray-700"}`}
                    style={{ backgroundColor: !values.isGST ? "#1364FF" : "" }}
                    onClick={() => setFieldValue("isGST", false)}
                  >
                    Without GST
                  </button>
                </div>
                <div className="my-2 mb-4">
                  <FormControl fullWidth variant="outlined" size="small">
                    <InputLabel id="accountType-label">
                      Select Account Type
                    </InputLabel>
                    <Select
                      value={
                        Object.keys(AccountDetails).filter((key) => {
                          return values.isGST
                            ? values.accountDetails.withGST ===
                                AccountDetails[key]
                            : values.accountDetails.withoutGST ===
                                AccountDetails[key];
                        })?.[0] || ""
                      }
                      onChange={(e) => {
                        // console.log(e.target.value)
                        setFieldValue(
                          values.isGST
                            ? "accountDetails.withGST"
                            : "accountDetails.withoutGST",
                          AccountDetails[e.target.value],
                        );
                      }}
                      labelId="accountType-label"
                    >
                      {Object.entries(AccountDetails).map(([key, value]) => (
                        <MenuItem key={key} value={key}>
                          {" "}
                          {key}{" "}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>

                <div>
                  <MyInput
                    label="Account Details"
                    name={
                      values.isGST
                        ? "accountDetails.withGST"
                        : "accountDetails.withoutGST"
                    }
                    value={
                      values.isGST
                        ? values.accountDetails.withGST
                        : values.accountDetails.withoutGST
                    }
                    // onChange={handleChange}

                    placeholder="Enter account details"
                    multiline
                    rows={5}
                  />
                </div>
              </div>

              {/* Documents Required */}
              <div className="space-y-4">
                <h2
                  className="text-lg font-semibold border-b pb-2"
                  style={{ color: "#1364FF" }}
                >
                  Documents Required
                </h2>

                <FieldArray name="documentsRequired">
                  {(arrayHelpers) => (
                    <div className="space-y-2">
                      <div className="mb-2 text-sm text-gray-600">
                        Documents are automatically added based on selected
                        services. You can also add custom documents.
                      </div>
                      {values.documentsRequired.map((doc, index) => (
                        <div key={index} className="flex items-center">
                          <div className="flex-grow">
                            <div className="flex items-center">
                              <span className="mr-2 font-medium">
                                {index + 1}.
                              </span>
                              <MyInput
                                name={`documentsRequired.${index}`}
                                value={values.documentsRequired[index]}
                                onChange={handleChange}
                                placeholder="Enter required document"
                              />
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => arrayHelpers.remove(index)}
                            className="ml-2 text-2xl text-red-500 font-bold"
                          >
                            ×
                          </button>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => arrayHelpers.push("")}
                        className="w-full py-2 bg-gray-100 rounded-md hover:bg-gray-200 font-medium"
                        style={{ color: "#1364FF" }}
                      >
                        + Add Document
                      </button>
                    </div>
                  )}
                </FieldArray>
              </div>

              {/* Quotation Signatures */}
              <div className="space-y-4">
                <h2
                  className="text-lg font-semibold border-b pb-2"
                  style={{ color: "#1364FF" }}
                >
                  Quotation Signatures
                </h2>

                <div>
                  <FormikField
                    name="quotedBy"
                    label="Quoted By"
                    placeholder="Enter name"
                  />
                </div>

                <div>
                  <FormikField
                    name="name"
                    label="Accepted By"
                    placeholder="Enter name"
                  />
                </div>
                <ShowOnEditMode editMode={editMode}>
                  <div>
                    <FormControl fullWidth variant="outlined" size="small">
                      <InputLabel id="isForClient-label">
                        Quotation For
                      </InputLabel>
                      <Select
                        labelId="isForClient-label"
                        name="isForClient"
                        size="small"
                        value={values.isForClient}
                        onChange={(e) => {
                          setFieldValue("isForClient", e.target.value);
                        }}
                        label="Quotation For"
                        className="w-full"
                      >
                        <MenuItem value={true}>Client</MenuItem>
                        <MenuItem value={false}>Consultant</MenuItem>
                      </Select>
                    </FormControl>
                  </div>
                </ShowOnEditMode>
              </div>

              {/* Note Text */}
              <div className="space-y-4">
                <h2
                  className="text-lg font-semibold border-b pb-2"
                  style={{ color: "#1364FF" }}
                >
                  Notes
                </h2>

                <ReactQuill
                  style={{ height: "150px", color: "black" }}
                  theme="snow"
                  value={values.note}
                  onChange={(content) => {
                    setFieldValue("note", content);
                  }}
                  modules={{
                    toolbar: [
                      ["bold", "italic", "underline"],
                      [{ list: "ordered" }, { list: "bullet" }],
                    ],
                  }}
                />
                {touched.note && errors.note && (
                  <div className="text-red-500 text-sm mt-1">{errors.note}</div>
                )}
              </div>
              <ShowOnEditMode editMode={editMode}>
                <div className="space-y-4 my-12">
                  <h2
                    className="text-lg font-semibold border-b pb-2"
                    style={{ color: "#1364FF" }}
                  >
                    Remarks
                  </h2>

                  <ReactQuill
                    style={{ height: "150px", color: "black" }}
                    theme="snow"
                    value={values.remarks}
                    onChange={(content) => {
                      setFieldValue("remarks", content);
                    }}
                    modules={{
                      toolbar: [
                        ["bold", "italic", "underline"],
                        [{ list: "ordered" }, { list: "bullet" }],
                      ],
                    }}
                  />
                  {touched.remarks && errors.remarks && (
                    <div className="text-red-500 text-sm mt-1">
                      {errors.remarks}
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <h2
                    className="text-lg font-semibold border-b pb-2"
                    style={{ color: "#1364FF" }}
                  >
                    Feedback
                  </h2>

                  <ReactQuill
                    style={{ height: "150px", color: "black" }}
                    theme="snow"
                    value={values.feedback}
                    onChange={(content) => {
                      setFieldValue("feedback", content);
                    }}
                    modules={{
                      toolbar: [
                        ["bold", "italic", "underline"],
                        [{ list: "ordered" }, { list: "bullet" }],
                      ],
                    }}
                  />
                  {touched.feedback && errors.feedback && (
                    <div className="text-red-500 text-sm mt-1">
                      {errors.feedback}
                    </div>
                  )}
                </div>
              </ShowOnEditMode>

              {/* Submit Button */}
              <div className="pt-5">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: "#1364FF",
                    focusRingColor: "#1364FF",
                  }}
                >
                  {isSubmitting ? "Generating..." : "Generate Quotation"}
                </button>
              </div>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
};

const ShowOnEditMode = ({ editMode, children }) => {
  return <div className={` ${editMode ? "block" : "hidden"}`}>{children}</div>;
};

export default QuotationForm;
