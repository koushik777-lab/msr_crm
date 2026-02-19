const mongoose = require("mongoose");

const qcciSchema = new mongoose.Schema(
  {
    entityType: { type: String },
    documentsRequired: [String],
    agentName: { type: String },
    companyName: { type: String, required: true },
    date: { type: Date, default: Date.now },
    addressOfHeadOffice: String,
    standard: { type: String },
    noOfSites: Number,
    currencyType: String,
    noOfEmployees: Number,
    totalFeePerAudit: Number,
    scopeOfRegistration: String,
    certificationBody: String,
    certificationBoard: String,
    contactPersonPrefix: String,
    contactPersonName: { type: String, required: true },
    phoneNo: { type: String, required: true },
    auditFeeTable: [
      {
        serviceDocs: String,
        services: String,
        fee: Number,
        remarks: String,
      },
    ],
    gstApplicable: { type: Boolean },
    quotedBy: String,
    acceptedBy: String,
    notes: String,
    email: String,
  },
  {
    collection: "qcci_quotations",
  },
);

const QCCIQuotationModel = mongoose.model("QCCI", qcciSchema);
module.exports = QCCIQuotationModel;
