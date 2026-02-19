const mongoose = require("mongoose");

const logSchema = new mongoose.Schema(
  {
    eventName: {
      type: String,
      required: true,
    },
    eventDate: {
      type: Date,
      default: Date.now,
    },
    duration: {
      type: Number,
    },
    link: {
      type: String,
    },
  },
  { _id: false },
);

const statusLogsSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
      enums: [
        "Unassigned",
        "Not Contacted",
        "Contacted",
        "Quotation Sent",
        "Payment Link sent",
        "Documents Received",
        "Payment Received",
        "Reminder Set",
        "Completed",
        "Rejected",
        "Not Contactable",
        "Switch Off",
        "Call Back",
        "Follow Up",
        "Hang up",
      ],
    },
    date: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
    },
  },
  { _id: false },
);

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      // required: true, // for excel
    },
    company: {
      type: String,
      // required: true, // for excel
    },
    industry: {
      type: String,
    },
    number: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      // required: true,
    },
    address2: {
      type: String,
    },
    email: {
      type: String,
      // required: true,
      // validate: {
      //   validator: function (v) {
      //     return /\S+@\S+\.\S+/.test(v);
      //   },
      //   message: (props) => `Invalid Email!`,
      // },
    },
    receivedDate: {
      type: Date,
      default: Date.now,
      // index: true,
    },
    reminderDate: {
      type: Date,
    },
    source: {
      type: String,
      // required: true, // for excel
    },
    status: {
      type: String,
      // required: true, // for excel
      default: "Unassigned",
      // enums: [
      //   "Unassigned",
      //   "Not Contacted", //data not called
      //   "Contacted",
      //   "Quotation Sent",
      //   "Payment Link sent",
      //   "Documents Received",
      //   "Payment Received",
      //   "Completed",
      //   "Rejected", //not interested
      //   // for agents
      //   "Not Contactable",
      //   "Switch Off",
      //   "Call Back",
      //   "Follow Up",
      //   "Hang up",
      // ],
    },
    assignDate: {
      type: Date,
    },
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agent",
    },
    notes: {
      type: String,
    },
    statusLogs: [statusLogsSchema],
    eventLogs: [logSchema],
  },
  { timestamps: true },
);

const Leads = mongoose.model("Leads", leadSchema);

module.exports = Leads;
