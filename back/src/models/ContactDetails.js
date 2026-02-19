const mongoose = require("mongoose");

const DetailsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      // required: true,
    },
    number: {
      type: String,
      required: true,
      // index: true,
      // unique: true,
    },
    assignedTo: {
      type: String,
    },
  },
  { timestamps: true },
);
const ContactDetails = mongoose.model("ContactDetails", DetailsSchema);
module.exports = ContactDetails;
