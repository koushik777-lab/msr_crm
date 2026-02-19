import axios from "axios";
import moment from "moment";
import { useFormik } from "formik";
import toast from "react-hot-toast";
import React, { useState } from "react";
import MyInput from "../../components/MyInput";
import { API_URI } from "../../utils/constants";
import PaymentLinkHistory from "./HistoryPopup";
import { getHeaders } from "../../utils/helpers";
import BackHeader from "../../components/BackHeader";
import PaymentValidationSchema from "./PaymentFormValidation";
import {
  FormControl,
  MenuItem,
  Select,
  InputLabel,
  Button,
} from "@mui/material";
import gstQr from "../../assets/gstQr.png";
import nonGstQr from "../../assets/nonGstQr.png";
import qcciQr from "../../assets/qcciQr.png";

const Payment = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showHistoryPopup, setShowHistoryPopup] = useState(false);

  const formik = useFormik({
    initialValues: {
      amount: "",
      description: "",
      name: "",
      email: "",
      currency: "INR",
      expiryDate: moment().add(1, "days").format("YYYY-MM-DD"),
    },
    validationSchema: PaymentValidationSchema,
    onSubmit: async (values) => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await axios.post(
          `${API_URI}/payment/create`,
          {
            amount: Number(
              formik.values.currency == "INR"
                ? formik.values.amount + 0.025 * formik.values.amount
                : formik.values.amount + 0.035 * formik.values.amount,
            ),
            description: values.description,
            expire_by: moment(values.expiryDate).unix(),
            currency: values.currency,
            customer: {
              name: values.name,
              email: values.email,
            },
          },
          getHeaders(),
        );

        navigator.clipboard.writeText(response?.data?.data?.short_url);
        toast.success("Payment link generated and copied to clipboard");
        setError(null);
        formik.resetForm();
      } catch (err) {
        console.error("Error creating payment link:", err);
        setError(
          err.response?.data?.message || "Failed to create payment link",
        );
      } finally {
        setIsLoading(false);
      }
    },
  });

  const showHistory = () => {
    setShowHistoryPopup(true);
  };

  const closeHistoryPopup = () => {
    setShowHistoryPopup(false);
  };
  const copyImageToClipboard = async (imageUrl) => {
    try {
      // Create a canvas element
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      // Create an image element
      const img = new Image();
      img.crossOrigin = "anonymous";

      // Wait for the image to load
      await new Promise((resolve) => {
        img.onload = resolve;
        img.src = imageUrl;
      });

      // Set canvas dimensions to match image
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw image on canvas
      ctx.drawImage(img, 0, 0);

      // Get blob from canvas
      const blob = await new Promise((resolve) => {
        canvas.toBlob(resolve, "image/png");
      });

      // Copy blob to clipboard
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ]);

      toast.success("QR code copied to clipboard");
    } catch (err) {
      console.error("Error copying image to clipboard:", err);
      toast.error("Could not copy image. Try a different browser.");
    }
  };

  const QR = [
    {
      label: "GST QR",
      image: gstQr,
    },
    {
      label: "Non-GST QR",
      image: nonGstQr,
    },
    {
      label: "QCCI QR",
      image: qcciQr,
    },
  ];

  return (
    <React.Fragment>
      <BackHeader
        title={"Payment Link Generator"}
        showBtn={true}
        addbuttonText={"History"}
        onClick={showHistory}
      />
      <div className="flex ">
        <div className="flex flex-wrap grow justify-start gap-6 border-1 border-gray-300 rounded-lg p-4 mb-6 bg-white mt-4">
          {QR.map((item) => (
            <div>
              <h2 className="text-center text-lg font-semibold mb-4 text-black">
                {item.label}
              </h2>
              <div className="mx-auto mb-2 w-full flex items-center justify-center">
                <Button
                  variant="outlined"
                  className="mx-auto mb-2 "
                  onClick={() => copyImageToClipboard(item.image)}
                >
                  Copy to clipboard
                </Button>
              </div>
              <img
                src={item.image}
                alt={item.label}
                className="mx-auto mb-4"
                style={{ width: "300px" }}
              />
            </div>
          ))}
        </div>
        <div className="min-w-[500px] mx-auto px-4 py-8">
          <div className="max-w-lg mx-auto bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600 mb-6">
              Generate a payment link to share with others
            </p>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={formik.handleSubmit} className="space-y-4">
              <div>
                <FormControl fullWidth>
                  <InputLabel id="currency-label">Currency *</InputLabel>
                  <Select
                    size="small"
                    labelId="currency-label"
                    id="currency"
                    name="currency"
                    value={formik.values.currency}
                    onChange={formik.handleChange}
                    label="Currency *"
                  >
                    <MenuItem value="INR">INR (Indian Rupee)</MenuItem> {/* Indian Rupee */}
                    <MenuItem value="USD">USD (United States Dollar)</MenuItem> {/* United States Dollar */}
                    <MenuItem value="AED">AED (United Arab Emirates Dirham)</MenuItem> {/* United Arab Emirates Dirham */}
                    <MenuItem value="SAR">SAR (Saudi Arabian Riyal)</MenuItem> {/* Saudi Arabian Riyal */}
                    <MenuItem value="QAR">QAR (Qatari Riyal)</MenuItem> {/* Qatari Riyal */}
                    <MenuItem value="KWD">KWD (Kuwaiti Dinar)</MenuItem> {/* Kuwaiti Dinar */}
                    <MenuItem value="EUR">EUR (European Euro)</MenuItem> {/* European Euro */}
                    <MenuItem value="GBP">GBP (British Pound Sterling)</MenuItem> {/* British Pound Sterling */}
                    <MenuItem value="OMR">OMR (Omani Rial)</MenuItem> {/* Omani Rial */}
                    <MenuItem value="CNY">CNY (Chinese Yuan Renminbi)</MenuItem> {/* Chinese Yuan Renminbi */}
                    <MenuItem value="HKD">HKD (Hong Kong Dollar)</MenuItem> {/* Hong Kong Dollar */}
                    <MenuItem value="SGD">SGD (Singapore Dollar)</MenuItem> {/* Singapore Dollar */}
                    <MenuItem value="THB">THB (Thai Baht)</MenuItem> {/* Thai Baht */}
                    <MenuItem value="MYR">MYR (Malaysian Ringgit)</MenuItem> {/* Malaysian Ringgit */}
                    <MenuItem value="IDR">IDR (Indonesian Rupiah)</MenuItem> {/* Indonesian Rupiah */}
                    <MenuItem value="JPY">JPY (Japanese Yen)</MenuItem> {/* Japanese Yen */}
                    <MenuItem value="AUD">AUD (Australian Dollar)</MenuItem> {/* Australian Dollar */}
                    <MenuItem value="NZD">NZD (New Zealand Dollar)</MenuItem> {/* New Zealand Dollar */}
                    <MenuItem value="PKR">PKR (Pakistani Rupee)</MenuItem> {/* Pakistani Rupee */}
                    <MenuItem value="RUB">RUB (Russian Ruble)</MenuItem> {/* Russian Ruble */}
                    <MenuItem value="CAD">CAD (Canadian Dollar)</MenuItem> {/* Canadian Dollar */}


                  </Select>
                </FormControl>
              </div>

              <div>
                <MyInput
                  label="Amount *"
                  type="number"
                  name="amount"
                  placeholder="Enter amount"
                  value={formik.values.amount}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.amount && Boolean(formik.errors.amount)}
                  helperText={formik.touched.amount && formik.errors.amount}
                />
              </div>

              {formik.values.amount > 0 && (
                <div className="text-black mb-4 ">
                  Final amount will be{" "}
                  {formik.values.currency == "INR"
                    ? "₹" +
                    (formik.values.amount + 0.025 * formik.values.amount)
                    : "$" +
                    (formik.values.amount + 0.035 * formik.values.amount)}
                </div>
              )}

              <div>
                <MyInput
                  label="Description *"
                  name="description"
                  placeholder="What is this payment for?"
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.description &&
                    Boolean(formik.errors.description)
                  }
                  helperText={
                    formik.touched.description && formik.errors.description
                  }
                />
              </div>

              <div>
                <MyInput
                  label="Name *"
                  name="name"
                  placeholder="Enter name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                />
              </div>

              <div>
                <MyInput
                  label="Email *"
                  type="email"
                  name="email"
                  placeholder="Enter email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                />
              </div>

              <div>
                <label
                  htmlFor="expiryDate"
                  className="block text-gray-700 font-medium mb-2"
                >
                  Expiry Date *
                  <input
                    id="expiryDate"
                    type="date"
                    className={`w-full p-3 border rounded-md ${formik.touched.expiryDate && formik.errors.expiryDate
                      ? "border-red-500"
                      : "border-gray-300"
                      }`}
                    min={moment().add(1, "days").format("YYYY-MM-DD")}
                    {...formik.getFieldProps("expiryDate")}
                  />
                  {formik.touched.expiryDate && formik.errors.expiryDate ? (
                    <div className="text-red-500 text-sm mt-1">
                      {formik.errors.expiryDate}
                    </div>
                  ) : null}
                </label>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full text-white py-3 rounded-md hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{
                    backgroundColor: "#1364FF",
                    focusRingColor: "#1364FF",
                  }}
                  disabled={isLoading}
                >
                  {isLoading ? "Generating..." : "Generate Payment Link"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <PaymentLinkHistory
        isOpen={showHistoryPopup}
        onClose={closeHistoryPopup}
      />
    </React.Fragment>
  );
};

export default Payment;
