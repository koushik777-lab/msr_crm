import { FieldArray, Form, Formik, useField } from "formik";
import moment from "moment";
import React from "react";
import * as Yup from "yup";
import MyInput from "../../components/MyInput";
import {
  Autocomplete,
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { getErrToast, getHeaders, getSuccessToast } from "../../utils/helpers";
import axios from "axios";
import QuotationTwo from "../../utils/MSRPDF/QuotationTwo";
import { pdf } from "@react-pdf/renderer";
import { API_URI } from "../../utils/constants";
import { useAuth } from "../../context/AuthContext";
import ReactQuill from "react-quill";
import { quotationServices } from "../../constants/constant";
import { set } from "date-fns";

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

const FormikAutocomplete = ({ name, label, options, onChange, ...props }) => {
  const [field, meta, helpers] = useField(name);

  return (
    <Autocomplete
      options={options}
      value={field.value}
      label={label}
      // onChange={(_, newValue) => {
      //   helpers.setValue(newValue);
      // }}
      onChange={onChange ? onChange : field.onChange}
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
      // style={{ width: "180px" }}
      {...props}
    />
  );
};

const currencyType = ["INR (₹)", "USD ($)"];
const contactPersonPrefix = ["Mr", "Ms", "Mrs"];

// Helper function to get document options for a service based on entity type
const getDocumentOptionsForService = (serviceName, entityType) => {
  console.log(serviceName, entityType);
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
  const licenseServices = values.auditFeeTable
    .filter((item) => item.serviceDocs)
    .map((item) => item.serviceDocs)
    .map((service) => service.trim())
    .filter(Boolean);

  const selectedServices = [...licenseServices];

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

function QCCIForm({ initialData, editMode = false, handleUpdateQuotation }) {
  const { user, isAgent, isBackend, isSalesManager } = useAuth();
  const initialValues = {
    companyName: initialData?.companyName || "",
    entityType: initialData?.entityType || "Sole Proprietorship",
    date:
      moment(initialData?.date).format("YYYY-MM-DD") ||
      moment().format("YYYY-MM-DD"),
    addressOfHeadOffice: initialData?.addressOfHeadOffice || "",
    // standard: initialData?.standard || "",
    noOfSites: initialData?.noOfSites || 0,
    noOfEmployees: initialData?.noOfEmployees || 0,
    scopeOfRegistration: initialData?.scopeOfRegistration || "",
    // certificationBody: initialData?.certificationBody || "",
    certificationBoard: initialData?.certificationBoard || "",
    currencyType: initialData?.currencyType || "INR",
    contactPersonName: initialData?.contactPersonName || "",
    contactPersonPrefix: initialData?.namePrefix || "Mr",
    phoneNo: initialData?.phoneNo || "",
    email: initialData?.email || "",
    notes: initialData?.notes || "",
    totalFeePerAudit: initialData?.totalFeePerAudit || 0,
    documentsRequired: initialData?.documentsRequired || [""],
    auditFeeTable: initialData?.auditFeeTable || [
      {
        services: "",
        fee: 0,
        serviceDocs: "",
        // remarks: "",
      },
    ],
    gstApplicable: initialData?.gstApplicable || false,
    quotedBy:
      user?.type === "agent"
        ? user?.name
        : isSalesManager
          ? "Sales Manager"
          : isBackend
            ? "Backend"
            : "admin",
  };

  const validationSchema = Yup.object({
    companyName: Yup.string().required("Company name is required"),
    date: Yup.date().nullable(),
    addressOfHeadOffice: Yup.string().nullable(),
    // standard: Yup.string().required("Standard is required"),
    totalFeePerAudit: Yup.number()
      .typeError("Surveillance fee per audit must be a number")
      .required("Surveillance fee per audit is required"),
    noOfSites: Yup.number()
      .typeError("Number of sites must be a number")
      .nullable(),
    noOfEmployees: Yup.number()
      .typeError("Number of employees must be a number")
      .nullable(),
    scopeOfRegistration: Yup.string().nullable(),
    certificationBoard: Yup.string().nullable(),
    // certificationBody: Yup.string().nullable(),
    contactPersonName: Yup.string().required("Contact person name is required"),
    phoneNo: Yup.string()
      .matches(/^[0-9]{10}$/, "Phone number must be 10 digits")
      .required("Phone number is required"),
    email: Yup.string().email("Invalid email address"),
    auditFeeTable: Yup.array().of(
      Yup.object().shape({
        services: Yup.string().required("Service is required"),
        fee: Yup.number()
          .typeError("Fee must be a number")
          .required("Fee is required"),
        serviceDocs: Yup.string().nullable(),
        // remarks: Yup.string(),
      }),
    ),
    gstApplicable: Yup.boolean(),
    quotedBy: Yup.string().nullable(),
  });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    console.log(values);
    // const body = {
    //   ...values,
    //   priceDescription: values.priceDescription.map((item, index) => ({
    //     ...item,
    //     sno: index + 1,
    //     amount: values?.gstApplicable
    //       ? (
    //           item.quantity * item.unitPrice * 0.18 +
    //           item.quantity * item.unitPrice
    //         ).toFixed(2)
    //       : (item.quantity * item.unitPrice).toFixed(2),
    //   })),
    // };
    if (editMode) return await handleUpdateQuotation(values, "qcci");
    try {
      const { data } = await axios.post(
        `${API_URI}/quotation?type=qcci`,
        values,
        getHeaders(),
      );
      console.log(data);
      getSuccessToast("Quotation generated successfully!");
      resetForm();
      pdf(
        <QuotationTwo
          values={{
            ...data?.newQCCIQuotation,
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
    } catch (error) {
      console.error("Error generating quotation:", error);
      getErrToast(
        error?.response?.data?.message ||
          "Error generating quotation. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="text-black">
      <h1 className="text-2xl text-gray-400 font-bold mb-7 border-b pb-2">
        QCCI Quotation
      </h1>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({
          isSubmitting,
          setFieldValue,
          values,
          handleChange,
          errors,
          touched,
        }) => (
          <Form className="space-y-10">
            <div className="space-y-4">
              <h2
                className="text-lg font-semibold border-b pb-2"
                style={{ color: "#1364FF" }}
              >
                Basic Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormikField
                  name="companyName"
                  label="Company Name *"
                  placeholder="Enter company name"
                />

                <FormikField
                  disabled={true}
                  type="date"
                  name="date"
                  label="Date"
                  placeholder="Select date"
                />

                <FormikField
                  name="addressOfHeadOffice"
                  label="Head Office Address"
                  placeholder="Enter head office address"
                />

                {/* <FormikField
                  name="standard"
                  label="Standard *"
                  placeholder="Enter certification standard (e.g., ISO 9001:2015)"
                /> */}

                <FormikField
                  name="noOfSites"
                  label="Number of Sites"
                  placeholder="Enter number of sites"
                />

                <FormikField
                  name="noOfEmployees"
                  label="Number of Employees"
                  placeholder="Enter number of employees"
                />

                <FormikField
                  name="scopeOfRegistration"
                  label="Scope of Registration"
                  placeholder="Enter scope of registration"
                />

                <FormikField
                  name="totalFeePerAudit"
                  label="Surveillance Fee Per Audit"
                  placeholder="Enter surveillance fee per audit"
                />

                <FormikField
                  name="certificationBoard"
                  label="Certification Board"
                  placeholder="Enter certification board (e.g., QCCI)"
                />
                {/* <FormikField
                  name="certificationBody"
                  label="Certification Body"
                  placeholder="Enter certification body (e.g., ISO)"
                /> */}

                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        onChange={(e) =>
                          setFieldValue("gstApplicable", e.target.checked)
                        }
                        name="gstApplicable"
                      />
                    }
                    label="GST Applicable"
                  />
                </FormGroup>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="space-y-4">
              <h2
                className="text-lg font-semibold border-b pb-2"
                style={{ color: "#1364FF" }}
              >
                Contact Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Grouped Name Prefix + Contact Person Name */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1">
                    <FormikAutocomplete
                      name="contactPersonPrefix"
                      options={contactPersonPrefix}
                    />
                  </div>
                  <div className="col-span-2">
                    <FormikField
                      name="contactPersonName"
                      label="Contact Person Name *"
                      placeholder="Enter contact person name"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <FormikField
                    name="phoneNo"
                    label="Phone Number *"
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <FormikField
                    name="email"
                    label="Email Address"
                    placeholder="Enter email"
                  />
                </div>
              </div>
            </div>

            {/* Currency Type */}
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
                variant="outlined"
                size="small"
                value={values.currencyType}
                onChange={handleChange}
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
              <FormikAutocomplete
                fullWidth
                name="entityType"
                label={"Select Entity Type"}
                options={[
                  "Sole Proprietorship",
                  "Partnership",
                  "Limited Liability Partnership (LLP)",
                  "Private Limited",
                  "Public Company",
                  "One Person Company (OPC)",
                  "Section 8 Company",
                  "Others",
                ]}
              />
            </div>

            {/* Audit Fee Section */}
            <div className="space-y-4">
              <h2
                className="text-lg font-semibold border-b pb-2"
                style={{ color: "#1364FF" }}
              >
                Audit Fee Details
              </h2>

              <FieldArray name="auditFeeTable">
                {({ push, remove, form }) => (
                  <div className="space-y-4">
                    {form?.values?.auditFeeTable?.map((item, index) => (
                      <div
                        key={index}
                        className="border-1 flex flex-col space-y-4 border-gray-300 p-5 rounded-xl relative"
                      >
                        {form?.values?.auditFeeTable.length > 1 && (
                          <button
                            type="button"
                            className="text-red-500 ml-auto"
                            onClick={() => {
                              remove(index);
                              // After removing a service, update documents required
                              setTimeout(() => {
                                // Create an updated copy of the values with the item removed
                                const updatedValues = {
                                  ...values,
                                  auditFeeTable: values.auditFeeTable.filter(
                                    (_, i) => i !== index,
                                  ),
                                };
                                updateDocumentsRequired(
                                  updatedValues,
                                  setFieldValue,
                                );
                              }, 0);
                            }}
                          >
                            Remove
                          </button>
                        )}
                        <div
                          key={index}
                          className="grid grid-cols-1 md:grid-cols-2 gap-4 "
                        >
                          <FormikField
                            name={`auditFeeTable.${index}.services`}
                            label="Services *"
                            placeholder="Enter services"
                          />

                          <FormikField
                            name={`auditFeeTable.${index}.fee`}
                            label="Fee *"
                            type="number"
                            placeholder="Enter fee"
                          />

                          <div className="col-span-2">
                            <FormikAutocomplete
                              onChange={(e, newval) => {
                                setFieldValue(
                                  `auditFeeTable.${index}.serviceDocs`,
                                  newval,
                                );
                                console.log(newval);
                                // After service is selected, update documents required
                                setTimeout(() => {
                                  // Create an updated values object with the new service selection
                                  const updatedValues = {
                                    ...values,
                                    auditFeeTable: [
                                      ...values.auditFeeTable.slice(0, index),
                                      {
                                        ...values.auditFeeTable[index],
                                        serviceDocs: newval,
                                      },
                                      ...values.auditFeeTable.slice(index + 1),
                                    ],
                                  };

                                  updateDocumentsRequired(
                                    updatedValues,
                                    setFieldValue,
                                  );
                                }, 0);
                              }}
                              name={`auditFeeTable.${index}.serviceDocs`}
                              label={"Service Document"}
                              options={quotationServices.map((i) => i?.service)}
                            />
                          </div>

                          {/* <FormikField
                            name={`auditFeeTable.${index}.remarks`}
                            label="Remarks"
                            placeholder="Enter remarks"
                          /> */}
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="px-4 py-2 bg-blue-500 text-white rounded"
                      onClick={() =>
                        push({
                          services: "",
                          fee: 0,
                          serviceDocs: "",
                          // remarks: "",
                        })
                      }
                    >
                      + Add Item
                    </button>
                  </div>
                )}
              </FieldArray>
            </div>

            {/* Quotation Signatures Section */}
            <div className="space-y-4">
              <h2
                className="text-lg font-semibold border-b pb-2"
                style={{ color: "#1364FF" }}
              >
                Quotation Signatures
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormikField
                  name="quotedBy"
                  label="Quoted By"
                  placeholder="Enter name of the person quoting"
                />

                <FormikField
                  name="companyName"
                  label="Accepted By"
                  placeholder="Enter name of the person accepting"
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
                value={values.notes}
                onChange={(content) => {
                  setFieldValue("notes", content);
                }}
                modules={{
                  toolbar: [
                    ["bold", "italic", "underline"],
                    [{ list: "ordered" }, { list: "bullet" }],
                  ],
                }}
              />
              {touched.notes && errors.notes && (
                <div className="text-red-500 text-sm mt-1">{errors.notes}</div>
              )}
            </div>

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
        )}
      </Formik>
    </div>
  );
}

export default QCCIForm;
