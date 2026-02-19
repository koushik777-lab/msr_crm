import {
  Autocomplete,
  Checkbox,
  FormControlLabel,
  FormGroup,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { Form, Formik, useField, FieldArray, Field } from "formik";
import React, { useEffect } from "react";
import * as Yup from "yup";
import MyInput from "../../components/MyInput";
import { set, sub } from "date-fns";
import { getErrToast, getHeaders, getSuccessToast } from "../../utils/helpers";
import { pdf } from "@react-pdf/renderer";
import axios from "axios";
import { API_URI } from "../../utils/constants";
import QuotationOne from "../../utils/MSRPDF/QuotationOne";
import moment from "moment";

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

const currencyType = ["INR (₹)", "USD ($)"];

function ShopBarcodeForm({
  initialData,
  editMode = false,
  handleUpdateQuotation,
}) {
  const initialValues = {
    companyName: initialData?.companyName || "",
    contactPersonName: initialData?.contactPersonName || "",
    phoneNo: initialData?.phoneNo || "",
    email: initialData?.email || "",
    date:
      moment(initialData?.date).format("YYYY-MM-DD") ||
      moment().format("YYYY-MM-DD"),
    gstin: initialData?.gstin || "",
    address: initialData?.address || "",
    priceDescription: initialData?.priceDescription || [
      {
        sno: 1,
        description: "",
        quantity: 1,
        unitPrice: 1,
      },
    ],
    discount: initialData?.discount || 0,
    gstApplicable: initialData?.gstApplicable || false,
    subTotal: initialData?.subTotal || 0,
    grandTotal: initialData?.grandTotal || 0,
    currencyType: initialData?.currencyType || "INR",
  };

  const validationSchema = Yup.object({
    companyName: Yup.string().required("Company name is required"),
    contactPersonName: Yup.string().required("Contact person name is required"),
    phoneNo: Yup.string()
      .matches(/^[0-9]{10}$/, "Phone number must be 10 digits")
      .required("Phone number is required"),
    email: Yup.string().email("Invalid email format"),
    gstin: Yup.string()
      .matches(
        /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][A-Z0-9][A-Z0-9][A-Z0-9]$/,
        "Invalid GST number. It should be in format XXAAAA0000A1Z5",
      )
      .nullable(),
    discount: Yup.number().typeError("Must be a number"),
    gstApplicable: Yup.boolean(),
    subTotal: Yup.number().min(0),
    grandTotal: Yup.number().min(0),
    priceDescription: Yup.array().of(
      Yup.object().shape({
        description: Yup.string().required("Description is required"),
        quantity: Yup.number()
          .typeError("Must be a number")
          .required("Quantity is required"),
        unitPrice: Yup.number()
          .typeError("Must be a number")
          .required("Unit price is required"),
      }),
    ),
  });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    console.log(values);
    const body = {
      ...values,
      priceDescription: values.priceDescription.map((item, index) => ({
        ...item,
        sno: index + 1,
        amount: values?.gstApplicable
          ? (
              item.quantity * item.unitPrice * 0.18 +
              item.quantity * item.unitPrice
            ).toFixed(2)
          : (item.quantity * item.unitPrice).toFixed(2),
      })),
    };

    if (editMode) {
      await handleUpdateQuotation(body, "smb");
      return;
    }
    try {
      const { data } = await axios.post(
        `${API_URI}/quotation?type=smb`,
        body,
        getHeaders(),
      );
      console.log(data);
      getSuccessToast("Quotation generated successfully!");
      resetForm();
      pdf(<QuotationOne values={data?.newSMBQuotation} />)
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
        Shop My Barcode Quotation
      </h1>
      <Formik
        onSubmit={handleSubmit}
        initialValues={initialValues}
        validationSchema={validationSchema}
        enableReinitialize={true}
      >
        {({ isSubmitting, setFieldValue, values, handleChange }) => (
          <Form className="space-y-10">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <h2
                className="text-lg font-semibold border-b pb-2"
                style={{ color: "#1364FF" }}
              >
                Basic Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <FormikField
                    name="companyName"
                    label="Company Name *"
                    placeholder="Enter company name"
                  />
                </div>

                <div>
                  <FormikField
                    name="date"
                    type="date"
                    label="Date"
                    placeholder="YYYY-MM-DD"
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                </div>
                <div>
                  <FormikField
                    name="gstin"
                    label="GSTIN"
                    placeholder="Enter GST number"
                  />
                </div>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Field
                        name="gstApplicable"
                        type="checkbox"
                        as={Checkbox}
                        // Formik will handle checked/unchecked state
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
                <div>
                  <FormikField
                    name="contactPersonName"
                    label="Contact Person Name *"
                    placeholder="Enter contact person name"
                  />
                </div>

                <div>
                  <FormikField
                    name="email"
                    label="Email"
                    placeholder="Enter email"
                  />
                </div>
                <div>
                  <FormikField
                    name="phoneNo"
                    label="Phone Number *"
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <FormikField
                    name="address"
                    label="Address"
                    placeholder="Enter address"
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

            {/* Price Description Section */}
            <div className="space-y-4">
              <h2
                className="text-lg font-semibold border-b pb-2"
                style={{ color: "#1364FF" }}
              >
                Price Description
              </h2>

              <FieldArray name="priceDescription">
                {({ push, remove, form }) => (
                  <div className="space-y-4">
                    {form?.values?.priceDescription?.map((item, index) => (
                      <div
                        key={index}
                        className="border-1 flex flex-col space-y-4 border-gray-300 p-5 rounded-xl relative"
                      >
                        {form.values.priceDescription.length > 1 && (
                          <button
                            type="button"
                            className="text-red-500 ml-auto"
                            onClick={() => remove(index)}
                          >
                            Remove
                          </button>
                        )}
                        <div
                          key={index}
                          className="grid grid-cols-1 md:grid-cols-2 gap-4 "
                        >
                          <div>
                            <FormikField
                              name={`priceDescription[${index}].description`}
                              label="Description"
                              placeholder="Enter description"
                            />
                          </div>
                          <div>
                            <FormikField
                              name={`priceDescription[${index}].quantity`}
                              label="Quantity"
                              placeholder="Enter quantity"
                              type="number"
                            />
                          </div>
                          <div>
                            <FormikField
                              name={`priceDescription[${index}].unitPrice`}
                              label="Unit Price"
                              placeholder="Enter unit price"
                              type="number"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="px-4 py-2 bg-blue-500 text-white rounded"
                      onClick={() =>
                        push({
                          sno: form.values.priceDescription.length + 1,
                          description: "",
                          quantity: 1,
                          unitPrice: 1,
                        })
                      }
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
              <FormikField
                name="discount"
                label="Discount"
                placeholder="Enter discount"
              />
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

export default ShopBarcodeForm;
