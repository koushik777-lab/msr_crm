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
    <div className="w-full h-full flex flex-col bg-gray-50 rounded-xl">
      <BackHeader
        title={"Payment Link Generator"}
        showBtn={true}
        addbuttonText={"History"}
        onClick={showHistory}
      />
      <div className="flex-1 overflow-y-auto no-scrollbar p-6">
        <div className="flex flex-col xl:flex-row gap-6">

          <div className="flex-1 min-w-[300px] xl:max-w-[450px]">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition-shadow hover:shadow-md sticky top-0">
              <h2 className="text-xl font-bold text-gray-800 mb-2">Generate Link</h2>
              <p className="text-gray-500 text-sm mb-6 border-b border-gray-100 pb-4">
                Create a payment link to share with others
              </p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm flex items-start gap-2">
                  <span className="font-bold mt-0.5">!</span>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={formik.handleSubmit} className="space-y-5">
                <div>
                  <FormControl fullWidth>
                    <InputLabel id="currency-label" size="small">Currency *</InputLabel>
                    <Select
                      size="small"
                      labelId="currency-label"
                      id="currency"
                      name="currency"
                      value={formik.values.currency}
                      onChange={formik.handleChange}
                      label="Currency *"
                      sx={{ borderRadius: '8px' }}
                    >
                      <MenuItem value="INR">INR (Indian Rupee)</MenuItem>
                      <MenuItem value="USD">USD (United States Dollar)</MenuItem>
                      <MenuItem value="AED">AED (United Arab Emirates Dirham)</MenuItem>
                      <MenuItem value="SAR">SAR (Saudi Arabian Riyal)</MenuItem>
                      <MenuItem value="QAR">QAR (Qatari Riyal)</MenuItem>
                      <MenuItem value="KWD">KWD (Kuwaiti Dinar)</MenuItem>
                      <MenuItem value="EUR">EUR (European Euro)</MenuItem>
                      <MenuItem value="GBP">GBP (British Pound Sterling)</MenuItem>
                      <MenuItem value="OMR">OMR (Omani Rial)</MenuItem>
                      <MenuItem value="CNY">CNY (Chinese Yuan Renminbi)</MenuItem>
                      <MenuItem value="HKD">HKD (Hong Kong Dollar)</MenuItem>
                      <MenuItem value="SGD">SGD (Singapore Dollar)</MenuItem>
                      <MenuItem value="THB">THB (Thai Baht)</MenuItem>
                      <MenuItem value="MYR">MYR (Malaysian Ringgit)</MenuItem>
                      <MenuItem value="IDR">IDR (Indonesian Rupiah)</MenuItem>
                      <MenuItem value="JPY">JPY (Japanese Yen)</MenuItem>
                      <MenuItem value="AUD">AUD (Australian Dollar)</MenuItem>
                      <MenuItem value="NZD">NZD (New Zealand Dollar)</MenuItem>
                      <MenuItem value="PKR">PKR (Pakistani Rupee)</MenuItem>
                      <MenuItem value="RUB">RUB (Russian Ruble)</MenuItem>
                      <MenuItem value="CAD">CAD (Canadian Dollar)</MenuItem>
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
                  <div className="bg-sky-50 text-sky-700 px-4 py-3 rounded-xl text-sm font-medium border border-sky-100 flex justify-between items-center">
                    <span>Final amount to pay:</span>
                    <span className="text-lg">
                      {formik.values.currency == "INR"
                        ? "₹" +
                        (
                          formik.values.amount +
                          0.025 * formik.values.amount
                        ).toFixed(2)
                        : "$" +
                        (
                          formik.values.amount +
                          0.035 * formik.values.amount
                        ).toFixed(2)}
                    </span>
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
                    label="Customer Name *"
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
                    label="Customer Email *"
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
                    className="block text-gray-700 text-sm font-medium mb-1.5"
                  >
                    Link Expiry Date *
                  </label>
                  <input
                    id="expiryDate"
                    type="date"
                    className={`w-full p-2.5 bg-transparent border rounded-lg outline-none transition-colors ${formik.touched.expiryDate && formik.errors.expiryDate
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-300 focus:border-sky-500"
                      }`}
                    min={moment().add(1, "days").format("YYYY-MM-DD")}
                    {...formik.getFieldProps("expiryDate")}
                  />
                  {formik.touched.expiryDate && formik.errors.expiryDate ? (
                    <div className="text-red-500 text-xs mt-1.5 font-medium">
                      {formik.errors.expiryDate}
                    </div>
                  ) : null}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full text-white py-3 px-4 rounded-xl font-medium shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5 flex justify-center items-center h-12"
                    style={{
                      backgroundColor: "#0ea5e9",
                    }}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating...
                      </span>
                    ) : "Generate Payment Link"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="flex-[2]">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition-shadow hover:shadow-md h-full">
              <h2 className="text-xl font-bold text-gray-800 mb-2">QR Codes</h2>
              <p className="text-gray-500 text-sm mb-6 border-b border-gray-100 pb-4">
                Scan or share these QR codes for direct payments
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {QR.map((item, index) => (
                  <div key={index} className="flex flex-col items-center p-4 border border-gray-100 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors group">
                    <h3 className="text-center font-bold text-gray-700 mb-4 h-6">
                      {item.label}
                    </h3>
                    <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 mb-4 transition-transform duration-300 group-hover:scale-105">
                      <img
                        src={item.image}
                        alt={item.label}
                        className="w-48 h-48 object-contain"
                      />
                    </div>
                    <Button
                      variant="outlined"
                      size="small"
                      className="w-full rounded-lg"
                      onClick={() => copyImageToClipboard(item.image)}
                      sx={{ textTransform: 'none', borderRadius: '8px' }}
                    >
                      Copy to clipboard
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
      <PaymentLinkHistory
        isOpen={showHistoryPopup}
        onClose={closeHistoryPopup}
      />
    </div>
  );
};
export default Payment;
