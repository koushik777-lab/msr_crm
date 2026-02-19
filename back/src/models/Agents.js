const mongoose = require("mongoose");
const agentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    emailPassword: {
      type: String,
      required: true,
    },
    cancelledLeads: {
      type: Number,
      default: 0,
    },
    onBreak: {
      type: Boolean,
    },
    offDuty: {
      type: Boolean,
    },
  },
  { timestamps: true },
);

const AgentModel = mongoose.model("Agents", agentSchema);
module.exports = AgentModel;
