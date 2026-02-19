const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AgentsBreakSchema = new Schema(
  {
    agentId: {
      type: Schema.Types.ObjectId,
      ref: "Agent",
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endTime: {
      type: Date,
    },
    duration: {
      type: Number,
    },
    type: {
      type: String,
      required: true,
      enum: ["Break", "OffDuty"],
      default: "Break",
    },
    message: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      required: true,
      default: "Ongoing",
      enum: ["Ended", "Ongoing"],
    },
  },
  { timestamps: true },
);

// Add indexes for dashboard queries
AgentsBreakSchema.index({ agentId: 1, type: 1, startTime: 1 });
AgentsBreakSchema.index({ startTime: 1 });

const AgentsBreak = mongoose.model("AgentsBreak", AgentsBreakSchema);
module.exports = AgentsBreak;
