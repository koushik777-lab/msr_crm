const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const paymentLinkSchema = new Schema(
  {
    agentId: {
      type: Schema.Types.ObjectId,
      ref: "Agents",
    },
    adminId: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
    },
    accept_partial: {
      type: Boolean,
      default: false,
    },
    amount: {
      type: Number,
      required: true,
    },
    amount_paid: {
      type: Number,
      default: 0,
    },
    callback_method: {
      type: String,
      enum: ["get", "post"],
      default: "get",
    },
    callback_url: {
      type: String,
    },
    cancelled_at: {
      type: Number,
      default: 0,
    },
    created_at: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
      default: "INR",
    },
    customer: {
      contact: {
        type: String,
      },
      email: {
        type: String,
      },
      name: {
        type: String,
      },
    },
    description: {
      type: String,
    },
    expire_by: {
      type: Number,
    },
    expired_at: {
      type: Number,
      default: 0,
    },
    first_min_partial_amount: {
      type: Number,
    },
    id: {
      type: String,
      required: true,
      unique: true,
    },
    notes: {
      type: Map,
      of: String,
    },
    notify: {
      email: {
        type: Boolean,
        default: true,
      },
      sms: {
        type: Boolean,
        default: true,
      },
      whatsapp: {
        type: Boolean,
        default: false,
      },
    },
    payments: {
      type: Schema.Types.Mixed,
      default: null,
    },
    reference_id: {
      type: String,
    },
    reminder_enable: {
      type: Boolean,
      default: true,
    },
    reminders: {
      type: Array,
      default: [],
    },
    short_url: {
      type: String,
    },
    status: {
      type: String,
      enum: ["created", "paid", "cancelled", "expired"],
      default: "created",
    },
    updated_at: {
      type: Number,
    },
    upi_link: {
      type: Boolean,
      default: false,
    },
    user_id: {
      type: String,
      default: "",
    },
    whatsapp_link: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Add index for dashboard queries
paymentLinkSchema.index({ agentId: 1 });

module.exports = mongoose.model("PaymentLink", paymentLinkSchema);
