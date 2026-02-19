const mongoose = require("mongoose");

const logsSchema = new mongoose.Schema(
  {
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agents",
      required: true,
    },
    number: {
      type: String,
      required: true,
    },
    callId: {
      type: Number,
      required: true,
    },
    time: {
      type: Date,
      // default: Date.now,
      required: true,
    },
    duration: {
      type: Number,
    },
    direction: {
      type: String,
      required: true,
      enums: ["Incoming", "Outgoing", "Declined"],
    },
  },
  { timestamps: true },
);

// Add indexes for dashboard queries
logsSchema.index({ agentId: 1, time: 1, duration: 1 });
logsSchema.index({ time: 1 });

module.exports = mongoose.model("Logs", logsSchema);
