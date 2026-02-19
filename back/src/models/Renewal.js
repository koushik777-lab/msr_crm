const mongoose = require("mongoose");

const CertificationSchema = new mongoose.Schema(
  {
    "S_ NO": { type: Number },
    STANDARD: { type: String, default: "" },
    BODY: { type: String, default: "" },
    "ISSUE DATE": { type: Date, default: "" },
    "1ST SURV": { type: Date, default: "" },
    "2ND SURV": { type: Date, default: "" },
    "EXPIRY DATE": { type: Date, default: "" },
    "COMPANY NAME": { type: String, default: "", required: true },
    ADDRESS: { type: String, default: "" },
    "NATURE OF BUSINESS": { type: String, default: "" },
    "CERTIFICATE NO_": { type: String, default: "" },
    "E- MAILD ID": { type: String, default: "" },
    "CONTACT NO_": { type: String, default: "" },
    "CONTACT PERSON": { type: String, default: "" },
    "MARKETING EXECUTIVE": { type: String, default: "" },
    "CLIENT / CONSULTANT": { type: String, default: "" },
    "RECEIVABLE A/C": { type: String, default: "" },
    AMOUNT: { type: String, default: "" },
    "AMOUNT RECEIVED DATE": { type: String },
    REMARKS: { type: String, default: "" },
    status: {
      type: String,
      required: true,
      default: "Unassigned",
      enums: [
        "Unassigned",
        "Not Contacted",
        "Contacted",
        "Quotation Sent",
        "Payment Link sent",
        "Documents Received",
        "Payment Received",
        "Completed",
        "Reminder Set",
        "Rejected",
        "Not Contactable",
        "Switch Off",
        "Call Back",
        "Follow Up",
      ],
    },
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agent",
    },
    notes: {
      type: String,
      default: "",
    },
    reminderDate: {
      type: Date,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Renewal", CertificationSchema);
