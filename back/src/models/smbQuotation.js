const mongoose = require("mongoose");

const shopMyBarcodeSchema = new mongoose.Schema(
  {
    agentName: { type: String },
    companyName: { type: String, required: true },
    contactPersonName: { type: String, required: true },
    address: { type: String },
    currencyType: { type: String, required: true },
    phoneNo: { type: String, required: true },
    email: {
      type: String,
      required: false,
    },
    date: { type: Date, default: Date.now },
    gstin: {
      type: String,
      required: false,
    },
    priceDescription: [
      {
        sno: { type: String, required: true },
        description: { type: String },
        quantity: { type: Number, required: true },
        unitPrice: { type: Number, required: true },
        // gst: { type: Number, required: true },
        amount: { type: Number },
      },
    ],
    discount: { type: Number, default: 0 },
    gstApplicable: { type: Boolean },
    subTotal: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 },
  },
  {
    collection: "shopmybarcode_quotations",
  },
);

const SMQQuotationModel = mongoose.model("ShopMyBarcode", shopMyBarcodeSchema);
module.exports = SMQQuotationModel;
