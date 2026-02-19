const axios = require("axios");
const moment = require("moment");
const dotenv = require("dotenv");
const Leads = require("../models/Leads");
const LogModel = require("../models/Logs");
const AgentModel = require("../models/Agents");
const AgentBreakModel = require("../models/AgentsBreak");
const PaymentLinkModel = require("../models/PaymentLink");
const OnlineTime = require("../models/OnlineTime");
dotenv.config();

function getYesterdayDate(asDateObject = false) {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return asDateObject ? yesterday : yesterday.toISOString().split("T")[0];
}

async function fetchNewCompaniesDirectors() {
  try {
    const response = await axios.get(
      "https://datafusion.info/Webservices/companies/newcompanies/directors",
      {
        params: {
          date: getYesterdayDate(),
        },
        headers: {
          "x-api-key": process.env.DATA_FUSION_API_KEY,
        },
      },
    );

    return response.data?.data || [];
  } catch (error) {
    console.error(
      "Error fetching new companies directors info:",
      error?.response?.data,
    );

    return [];
  }
}

async function fetchNewCompaniesInfo() {
  try {
    const response = await axios.get(
      "https://datafusion.info/Webservices/companies/newcompanies",
      {
        params: {
          date: getYesterdayDate(),
        },
        headers: {
          "x-api-key": process.env.DATA_FUSION_API_KEY,
        },
      },
    );

    return response.data?.data || [];
  } catch (error) {
    console.error("Error fetching new companies info:", error?.response?.data);
    return [];
  }
}

async function fetchGSTLeads() {
  try {
    const response = await axios.get(
      "https://datafusion.info/Webservices/gst/new-gst",
      {
        params: {
          date: getYesterdayDate(),
        },
        headers: {
          "x-api-key": process.env.DATA_FUSION_API_KEY,
        },
      },
    );

    return response.data?.data || [];
  } catch (error) {
    console.error("Error fetching new GST leads:", error?.response?.data);
    return [];
  }
}

async function syncLeads() {
  try {
    const gstinStateMapping = {
      "01": "Jammu & Kashmir",
      "02": "Himachal Pradesh",
      "03": "Punjab",
      "04": "Chandigarh",
      "05": "Uttarakhand",
      "06": "Haryana",
      "07": "Delhi",
      "08": "Rajasthan",
      "09": "Uttar Pradesh",
      10: "Bihar",
      11: "Sikkim",
      12: "Arunachal Pradesh",
      13: "Nagaland",
      14: "Manipur",
      15: "Mizoram",
      16: "Tripura",
      17: "Meghalaya",
      18: "Assam",
      19: "West Bengal",
      20: "Jharkhand",
      21: "Odisha",
      22: "Chhattisgarh",
      23: "Madhya Pradesh",
      24: "Gujarat",
      25: "Daman & Diu",
      26: "Dadra & Nagar Haveli",
      27: "Maharashtra",
      28: "Andhra Pradesh (Before Bifurcation)",
      29: "Karnataka",
      30: "Goa",
      31: "Lakshadweep",
      32: "Kerala",
      33: "Tamil Nadu",
      34: "Puducherry",
      35: "Andaman & Nicobar Islands",
      36: "Telangana",
      37: "Andhra Pradesh (New)",
      38: "Ladakh",
      97: "OTHER TERRITORY",
      99: "CENTRE JURISDICTION",
    };

    console.log(
      `${moment().format("DD-MM-YYYY hh:mm:ss A")}: Syncing leads...`,
    );
    const directors = await fetchNewCompaniesDirectors();
    const companies = await fetchNewCompaniesInfo();

    const mergedData = directors.map((director) => {
      const company =
        companies.find((company) => company.CIN === director.CIN) || {};

      return {
        name: director.DirectorName,
        company: company.Company,
        number: director.Mobile.slice(-10),
        email: director.Email,
        address: company.State,
        source: "Company",
        receivedDate: getYesterdayDate(true),
      };
    });
    const gstLeads = await fetchGSTLeads();
    const gstMappedData = gstLeads.map((lead) => {
      //lead.GSTIN
      return {
        name: lead.LegalName || "N/A",
        company: lead.TradeName || "N/A",
        number: lead.Mobile.slice(-10),
        email: lead.Email,
        address: gstinStateMapping[lead.GSTIN.substr(0, 2)],
        source: "GST",
        receivedDate: getYesterdayDate(true),
      };
    });

    // console.log("MERGE DATA", mergedData);
    // console.log("GST DATA" , gstMappedData);
    // return ;
    await Leads.insertMany(mergedData);
    await Leads.insertMany(gstMappedData);
    return mergedData;
  } catch (error) {
    console.error("Error syncing leads:", error);
    return [];
  }
}

async function syncPaymentLinkStatus() {
  try {
    const { data } = await axios.get(
      "https://api.razorpay.com/v1/payment_links",
      {
        headers: {
          Authorization: `Basic ${process.env.RAZORPAY_AUTH_TOKEN}`,
        },
      },
    );

    await PaymentLinkModel.bulkWrite(
      data?.payment_links?.map((item) => ({
        updateOne: {
          filter: { id: item.id },
          update: {
            $set: {
              status: item.status,
            },
          },
          upsert: true,
        },
      })),
    );
  } catch (error) {
    console.error("Error syncing payment links:", error);
  }
}

async function deleteOldCallLogs(retentionDays = 30) {
  try {
    console.log(
      `${moment().format("DD-MM-YYYY hh:mm:ss A")}: Starting old call logs cleanup...`,
    );

    // Calculate the cutoff date based on configurable retention period
    const cutoffDate = moment().subtract(retentionDays, "days").toDate();

    // Find the count of records to be deleted first
    const logsToDeleteCount = await LogModel.countDocuments({
      time: { $lt: cutoffDate },
    });

    if (logsToDeleteCount === 0) {
      console.log(
        `No call logs older than ${retentionDays} days found to delete.`,
      );
      return { success: true, deleted: 0 };
    }

    // Perform the deletion
    const result = await LogModel.deleteMany({ time: { $lt: cutoffDate } });

    console.log(
      `Successfully deleted ${result.deletedCount} call logs older than ${retentionDays} days.`,
    );
    return {
      success: true,
      deleted: result.deletedCount,
      message: `Deleted ${result.deletedCount} call logs older than ${retentionDays} days.`,
    };
  } catch (error) {
    console.error("Error deleting old call logs:", error);
    return {
      success: false,
      error: error.message,
      message: "Failed to delete old call logs.",
    };
  }
}

async function autoLogout() {
  try {
    const onDutyAgents = await AgentModel.find({
      offDuty: { $ne: true },
    }).lean();

    await Promise.all(
      onDutyAgents?.map(async (agent) => {
        // const lastBreak = await AgentBreakModel.findOne({
        //   agentId: agent._id,
        // }).sort({ createdAt: -1 });
        const newBreak = new AgentBreakModel({
          agentId: agent._id,
          startTime: new Date(),
          type: "OffDuty",
          message: "Auto Logout",
          status: "Ongoing",
        });
        await newBreak.save();

        await AgentModel.findByIdAndUpdate(agent._id, {
          offDuty: true,
        });
      }),
    );
  } catch (error) {
    console.error("Error in autoLogout:", error);
  }
}

async function autoLogoutWebsite() {
  try {
    const allLogins = await OnlineTime.find({
      createdAt: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lte: new Date(new Date().setHours(23, 59, 59, 999)),
      },
    });
    let notLoggedOut = allLogins.filter((login) => login.logoutTime === null);
    console.log("TOTAL NOT LOGGED OUT ACCOUNTS", notLoggedOut.length);
    await Promise.all(
      notLoggedOut.map(async (login) => {
        return OnlineTime.findByIdAndUpdate(login._id, {
          logoutTime: new Date(),
          status: "Auto",
        });
      }),
    );
  } catch (error) {
    console.error("Error in autoLogoutWebsite:", error);
  }
}

module.exports = {
  syncPaymentLinkStatus,
  deleteOldCallLogs,
  autoLogout,
  syncLeads,
  autoLogoutWebsite,
};
