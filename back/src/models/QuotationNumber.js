const mongoose = require("mongoose");

const QuotationNumber = new mongoose.Schema(
  {
    date: {
      type: String,
      rquired: true,
    },
    number: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true },
);

const QuotationNumberModel = mongoose.model("QuotationNumber", QuotationNumber);

module.exports = QuotationNumberModel;
