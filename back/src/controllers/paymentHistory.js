const PaymentHistory = require("../models/PaymentHistory");

/**
 * Get all payment history records
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllPaymentHistory = async (req, res) => {
  try {
    // Prepare query parameters
    const isAgent = req?.isAgent;
    const agentName = req?.user?.name;

    const query = {};

    // Apply filters if provided in query params
    if (isAgent) {
      query.marketingExecutive = agentName;
    }
    if (req.query.companyName) {
      query.companyName = { $regex: req.query.companyName, $options: "i" };
    }

    if (req.query.services) {
      query.services = { $regex: req.query.services, $options: "i" };
    }
    if (req?.query?.isClient != undefined) {
      query.isClient = req.query.isClient === "true";
    }

    if (req.query.marketingExecutive) {
      query.marketingExecutive = req.query.marketingExecutive;
    }

    if (req.query.invoiceNumber) {
      query.invoiceNumber = req.query.invoiceNumber;
    }

    // Date range filters
    if (req.query.fromDate || req.query.toDate) {
      query.date = {};

      if (req.query.fromDate) {
        query.date.$gte = new Date(req.query.fromDate);
      }

      if (req.query.toDate) {
        // Add one day to include the end date fully
        const toDate = new Date(req.query.toDate);
        toDate.setDate(toDate.getDate() + 1);
        query.date.$lt = toDate;
      }
    }

    // Fetch payment history records
    const paymentHistory = await PaymentHistory.find(query)
      .sort({ date: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      message: "Payment history fetched successfully",
      data: paymentHistory,
    });
  } catch (error) {
    console.error("Error fetching payment history:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching payment history",
      error: error.message,
    });
  }
};

/**
 * Create a new payment history record
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createPaymentHistory = async (req, res) => {
  try {
    const newPaymentHistory = await PaymentHistory.create(req.body);

    return res.status(201).json({
      success: true,
      message: "Payment history created successfully",
      data: newPaymentHistory,
    });
  } catch (error) {
    console.error("Error creating payment history:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating payment history",
      error: error.message,
    });
  }
};

/**
 * Update an existing payment history record
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updatePaymentHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const isAgent = req?.isAgent;

    // console.log("Updating payment history with ID:", req.body);

    const existingPaymentHistory = await PaymentHistory.findById(id).lean();
    // console.log("Existing payment history:", existingPaymentHistory);
    if (!existingPaymentHistory) {
      return res.status(404).json({
        success: false,
        message: "Payment history record not found",
      });
    }
    if (existingPaymentHistory.editCount >= 1 && isAgent) {
      return res.status(400).json({
        success: false,
        message: "Edit Limit reached",
      });
    }

    console.log("Request body:", req.body, id);

    const updatedPaymentHistory = await PaymentHistory.findByIdAndUpdate(
      id,
      {
        ...req.body,
        ...(isAgent && {
          editCount:
            existingPaymentHistory?.editCount ||
            existingPaymentHistory?.editCount == "0"
              ? existingPaymentHistory.editCount + 1
              : 1,
        }),
      },
      { new: true },
      // { new: true, runValidators: true },
    ).lean();

    return res.status(200).json({
      success: true,
      message: "Payment history updated successfully",
      data: updatedPaymentHistory,
    });
  } catch (error) {
    console.error("Error updating payment history:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating payment history",
      error: error.message,
    });
  }
};

/**
 * Delete a payment history record
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deletePaymentHistory = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedPaymentHistory = await PaymentHistory.findByIdAndDelete(id);

    if (!deletedPaymentHistory) {
      return res.status(404).json({
        success: false,
        message: "Payment history record not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payment history deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting payment history:", error);
    return res.status(500).json({
      success: false,
      message: "Error deleting payment history",
      error: error.message,
    });
  }
};

const paymentHistoryDashboard = async (req, res) => {
  try {
    const { month, year } = req.query;
    const filter = {};

    if (month && year) {
      // Both month and year present
      const start = new Date(Number(year), Number(month) - 1, 1);
      const end = new Date(Number(year), Number(month), 1);
      filter.date = { $gte: start, $lt: end };
    } else if (year) {
      // Only year present
      const start = new Date(Number(year), 0, 1);
      const end = new Date(Number(year) + 1, 0, 1);
      filter.date = { $gte: start, $lt: end };
    } else if (month) {
      // Only month present (all years)
      const m = Number(month);
      filter.$expr = {
        $eq: [{ $month: "$date" }, m],
      };
    }
    const allPayments = await PaymentHistory.find(filter).lean();
    const allExecutives = new Set(
      allPayments.map((payment) => payment.marketingExecutive),
    );

    // Today's date for filtering
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // First day of current month for filtering
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Convert to the desired format
    const finalData = Array.from(allExecutives).map((executive) => {
      // Filter payments by this executive
      const executivePayments = allPayments.filter(
        (payment) => payment.marketingExecutive === executive,
      );

      // Calculate total payments amount
      let obj = {
        agent: executive || "Unknown",
        msr: 0,
        qcci: 0,
        "qcci fb lead": 0,
        "msr fb lead": 0,
        insta: 0,
        "company data": 0,
        "just dail": 0,
        indiamart: 0,
        "google ads": 0,
        consultant: 0,
        gst: 0,
        "govt fees": 0,
        body: 0,
        "total prof fees": 0,
        "gross total": 0,
      };
      for (let i = 0; i < executivePayments.length; i++) {
        let currPayment = executivePayments[i];
        if (
          currPayment.bankAccount == "VSIPR - IDFC - GST" ||
          currPayment.bankAccount == "QCCI - IDFC - Non GST"
        ) {
          obj["qcci"] += Number(currPayment.amount) || 0;
        } else {
          obj["msr"] += Number(currPayment.amount) || 0;
        }

        if (currPayment.leadSource == "FB ADS MSR") {
          obj["msr fb lead"] += Number(currPayment.amount) || 0;
        } else if (currPayment.leadSource == "FB ADS QCCI") {
          obj["qcci fb lead"] += Number(currPayment.amount) || 0;
        } else if (currPayment.leadSource == "INSTAGRAM") {
          obj["insta"] += Number(currPayment.amount) || 0;
        } else if (currPayment.leadSource == "COMPANY") {
          obj["company data"] += Number(currPayment.amount) || 0;
        } else if (currPayment.leadSource == "JUST DAIL") {
          obj["just dail"] += Number(currPayment.amount) || 0;
        } else if (currPayment.leadSource == "INDIAMART") {
          obj["indiamart"] += Number(currPayment.amount) || 0;
        } else if (currPayment.leadSource == "GOOGLE ADS") {
          obj["google ads"] += Number(currPayment.amount) || 0;
        } else if (currPayment.leadSource == "CONSULTANT") {
          obj["consultant"] += Number(currPayment.amount) || 0;
        } else if (currPayment.leadSource == "GST") {
          obj["gst"] += Number(currPayment.amount) || 0;
        }
        // else if(currPayment.leadSource == "GOVT FEES"){
        //   obj["govt fees"] += Number(currPayment.amount) || 0;
        // }
        // else if(currPayment.leadSource == "BODY"){
        //   obj["body"] += Number(currPayment.amount) || 0;
        // }

        obj["govt fees"] += Number(currPayment.govt) || 0;
        obj["body"] += Number(currPayment.body) || 0;
        obj["total prof fees"] +=
          Number(currPayment.amount) -
            (Number(currPayment.gst) -
              Number(currPayment.govt) -
              Number(currPayment.body)) || 0;
        obj["gross total"] += Number(currPayment.amount) || 0;
      }
      console.log(
        "MARKETING EXECUTIVE:",
        executive,
        "EXECUTIVE PAYMENTS:",
        executivePayments.length,
      );
      const totalPayments = [...executivePayments].reduce(
        (sum, payment) => sum + (Number(payment.amount) || 0),
        0,
      );

      // Calculate today's payments amount
      const todayPayments = [...executivePayments].filter((payment) => {
        const paymentDate = new Date(payment.date);
        return paymentDate >= today;
      });
      const todayPaymentsAmount = todayPayments.reduce(
        (sum, payment) => sum + (Number(payment.amount) || 0),
        0,
      );

      // Calculate this month's payments amount
      const monthPayments = [...executivePayments].filter((payment) => {
        const paymentDate = new Date(payment.date);
        return paymentDate >= firstDayOfMonth;
      });

      const monthPaymentsAmount = monthPayments.reduce(
        (sum, payment) => sum + (Number(payment.amount) || 0),
        0,
      );

      return {
        agent: executive || "Unknown",
        count: `${executivePayments?.length} (₹${totalPayments})`,
        today: `${todayPayments?.length} (₹${todayPaymentsAmount})`,
        month: `${monthPayments?.length} (₹${monthPaymentsAmount})`,
        ...obj,
      };

      // return obj;
    });

    return res.status(200).json({
      success: true,
      message: "Payment history dashboard data fetched successfully",
      data: finalData,
    });
  } catch (error) {
    console.error("Error fetching payment history dashboard:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching payment history dashboard",
      error: error.message,
    });
  }
};
module.exports = {
  getAllPaymentHistory,
  createPaymentHistory,
  updatePaymentHistory,
  deletePaymentHistory,
  paymentHistoryDashboard,
};
