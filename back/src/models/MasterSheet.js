const mongoose = require("mongoose");

const MasterSheetSchema = new mongoose.Schema(
  {
    "S_ NO": { type: Number },
    accreditationBody: { type: String, default: "" },
    accreditationBodyOther: { type: String, default: "" },
    certificationBody: { type: String, default: "" },
    certificationBodyOther: { type: String, default: "" },
    standard: { type: String, default: "" },
    standardOther: { type: String, default: "" },
    issueDate: { type: Date },
    firstSurvDate: { type: Date },
    secondSurvDate: { type: Date },
    expireDate: { type: Date },
    companyName: { type: String, required: true },
    address: { type: String, default: "" },
    scope: { type: String, default: "" },
    certificateNo: { type: String, default: "" },
    courierDate: { type: Date },
    emailId: { type: String, default: "" },
    contactNumber: { type: String, default: "" },
    contactPerson: { type: String, default: "" },
    marketingExecutive: { type: String, default: "" },
    clientConsultant: { type: String, default: "" },
    clientConsultantOther: { type: String, default: "" },
    amount: { type: Number },
    accountName: { type: String, default: "" },
    accountNameOther: { type: String, default: "" },
    dateReceived: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MasterSheet", MasterSheetSchema);
