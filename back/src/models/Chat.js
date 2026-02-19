const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    whatsapp_message_id: {
      type: String,
      unique: true,
    },
    direction: {
      type: String,
      enum: ["send", "recieved"],
      // required: true,
    },
    message: {
      message_type: {
        type: String,
        enum: ["text", "media"],
        // required: true,
      },
      body: {
        type: String,
        // required: true,
      },
    },
    contactId: {
      // chat with which contact
      type: mongoose.Schema.Types.ObjectId,
      ref: "ContactDetails",
      // index: true,
      // required: true,
    },
    replied_to_message: {
      type: String, // contains whats app message id
      default: "",
    },
    agentName: {
      // which agent is assigned to this chat
      type: String,
      // ref: "Agent",
      // default: "admin",
    },
    status: {
      type: String,
      enum: ["delivered", "read"],
    },
  },
  { timestamps: true },
);

const Chat = mongoose.model("Chat", chatSchema);
module.exports = Chat;
