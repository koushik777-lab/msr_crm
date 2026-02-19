const mongoose = require("mongoose");

const OnlineTimeSchema = new mongoose.Schema(
  {
    loginTime: {
      type: Date,
      default: "",
    },
    logoutTime: {
      type: Date,
      default: "",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,

      required: true,
    },
    isAgent: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enums: ["Auto", "Manual"],
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("OnlineTime", OnlineTimeSchema);
