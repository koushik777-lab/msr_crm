const axios = require("axios");
const AgentModel = require("../models/Agents");
const PaymentLinkModel = require("../models/PaymentLink");

const generateReferenceId = () => {
  return Math.random().toString(36).substr(2, 9);
};

const createPaymentLink = async (req, res) => {
  try {
    const { amount, expire_by, customer, description, currency } = req.body;
    console.log(req.body);
    let adminId, agentId;
    if (req.isAgent) {
      agentId = req.user._id;
    } else {
      adminId = req.user._id;
    }

    const response = await axios.post(
      "https://api.razorpay.com/v1/payment_links",
      {
        currency: currency,
        amount: Math.round(amount * 100), // amount in paise
        expire_by,
        customer,
        description,
        accept_partial: false,
        reference_id: generateReferenceId(),
      },
      {
        headers: {
          Authorization: `Basic ${process.env.RAZORPAY_AUTH_TOKEN}`,
        },
      },
    );
    const paymentLink = await PaymentLinkModel.create({
      ...(agentId && { agentId }),
      ...(adminId && { adminId }),
      ...response.data,
    });
    res
      .status(201)
      .json({ message: "Payment link created", data: paymentLink });
  } catch (error) {
    console.error("Payment Link Error:", error?.response?.data || error?.message);
    return res.status(500).json({ message: "Internal server error", details: error?.response?.data });
  }
};

const getPaymentLinks = async (req, res) => {
  try {
    let adminId, agentId;
    if (req.isAgent) {
      agentId = req.user._id;
    } else {
      adminId = req.user._id;
    }
    let query = {};
    if (agentId) {
      query.agentId = agentId;
    }
    // else if (adminId) {
    //   query.adminId = adminId;
    // }

    const paymentLinks = await PaymentLinkModel.find(query)
      // .populate(	agentId)
      .sort({
        createdAt: -1,
      });
    paymentLinks.forEach((paymentLink) => {
      paymentLink.amount = paymentLink.amount / 100;
    });
    res
      .status(200)
      .json({ message: "Payment links fetched", data: paymentLinks });
  } catch (error) {
    console.error(error?.response?.data || error?.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getPaymentLinkById = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.isAgent) {
      return res.status(403).json({
        message: "You are not authorized to view this payment link",
      });
    }
    const paymentLinks = await PaymentLinkModel.find({ agentId: id }).sort({
      createdAt: -1,
    });

    if (!paymentLinks) {
      return res.status(404).json({ message: "Payment link not found" });
    }

    paymentLinks.forEach((paymentLink) => {
      paymentLink.amount = paymentLink.amount / 100;
    });

    res
      .status(200)
      .json({ message: "Payment link fetched", data: paymentLinks });
  } catch (error) {
    console.error(error?.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { createPaymentLink, getPaymentLinks, getPaymentLinkById };
