const mongoose = require("mongoose");

const PaymentHistorySchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      default: "",
    },
    invoiceNumber: {
      type: String,
      default: "",
    },
    companyName: {
      type: String,
      default: "",
    },
    isClient: {
      type: Boolean,
      default: false,
    },
    name: {
      type: String,
      default: "",
    },
    mobile: {
      type: String,
      default: "",
    },
    services: {
      type: String,
      default: "",
    },
    amount: {
      type: Number,
      default: "",
    },
    gst: {
      type: String,
      default: "",
    },
    bankAccount: {
      type: String,
      default: "",
    },
    paymentMode: {
      type: String,
      default: "",
    },
    marketingExecutive: {
      type: String,
      default: "",
    },
    remarks: {
      type: String,
      default: "",
    },
    govt: {
      type: Number,
      default: "",
    },
    tds: {
      type: Number,
      default: "",
    },
    body: {
      type: Number,
      default: "",
    },
    refAmount: {
      type: Number,
      default: "",
    },
    totalBenefit: {
      type: Number,
      default: "",
    },
    leadSource: {
      type: String,
      default: "",
    },
    editCount: {
      type: Number,
      default: 0,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    isDisApproved: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("PaymentHistory", PaymentHistorySchema);
