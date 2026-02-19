const Logs = require("../models/Logs");
const Leads = require("../models/Leads");
const AgentModel = require("../models/Agents");
const AgentsBreak = require("../models/AgentsBreak");
const Quotation = require("../models/Quotation");
const PaymentLink = require("../models/PaymentLink");
const moment = require("moment");
// const AgentBreaks= require("../models/AgentsBreak");

async function getAllLogs(req, res) {
  try {
    const agentId = req.user._id;

    const logs = await Logs.find({ agentId: agentId });
    res.status(200).json({ message: "Logs fetched successfully !!!", logs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function postLog(req, res) {
  try {
    const agentId = req.user._id;
    console.log("Received logs for agent:", agentId);
    console.log(JSON.stringify(req.body, null, 2));

    if (!req.body || req.body.length === 0) {
      return res.status(400).json({ message: "No logs to insert." });
    }

    const agent = await AgentModel.findById(agentId);
    if (!agent) {
      return res.status(404).json({ message: "Agent not found." });
    }

    // Get the max callId directly from the database
    const lastLog = await Logs.findOne({ agentId })
      .sort({ callId: -1 })
      .limit(1);
    const maxCallId = lastLog ? lastLog.callId : -1;

    // Get all existing logs for this agent to check for duplicates
    const existingLogs = await Logs.find({ agentId });

    const agentLeads = await Leads.find({
      agent: agentId,
      status: "Not Contacted",
    });

    try {
      await Promise.all(
        agentLeads
          .map(async (lead) => {
            const matchingLog = req.body.find(
              (log) => log.number === lead.number && log.duration > 0,
            );

            if (matchingLog) {
              return await Leads.findByIdAndUpdate(
                lead._id,
                { status: "Contacted" },
                { new: true },
              );
            }
            return null;
          })
          .filter(Boolean),
      );
    } catch (error) {
      console.error("Error updating lead statuses:", error);
    }

    // Filter logs to avoid duplicates using both callId and combination of number/time
    const logsFromUser = req.body
      .filter((log) => {
        // Filter by callId
        if (!(log.callId > maxCallId && log?.number)) {
          return false;
        }

        // Also check if this log is a duplicate based on number and approximate time
        const isDuplicate = existingLogs.some((existingLog) => {
          // Convert both times to moment objects for comparison
          const logTime = moment(log.time);
          const existingTime = moment(existingLog.time);

          // Check if number matches and time is within a 5 second margin
          return (
            existingLog.number === log.number &&
            Math.abs(logTime.diff(existingTime, "seconds")) < 5
          );
        });

        return !isDuplicate;
      })
      .map((log) => ({ ...log, agentId }));

    if (logsFromUser.length === 0) {
      return res
        .status(200)
        .json({ message: "No new logs to insert.", newLogs: [] });
    }

    const newLogs = await Logs.insertMany(logsFromUser);

    res.status(201).json({ message: "Logs created successfully!", newLogs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
}

async function getLogByAgent(req, res) {
  try {
    const agentId = req.params.id;
    console.log(req.query);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const logOfAgent = await Logs.find({
      agentId,
      ...(req.query?.isToday == "true" && {
        time: {
          $gte: today,
          $lt: tomorrow,
        },
        // duration: { $gt: 0 },
      }),
    }).sort({ callId: -1 });

    let agentBreaks;
    if (req?.query?.getTimings == "true") {
      const todayDate = moment().startOf("day").toDate();
      agentBreaks = await AgentsBreak.find({
        agentId: agentId,
        type: "OffDuty",
        startTime: {
          $gte: todayDate,
        },
      });
    }

    // Filter out logs with duplicate callIds
    const uniqueLogs = logOfAgent?.reduce((acc, log) => {
      // Check if we already have a log with this callId
      const existingIndex = acc?.findIndex(
        (item) => item?.callId === log?.callId,
      );
      if (existingIndex === -1) {
        // If not found, add this log
        acc.push(log);
      }
      return acc;
    }, []);

    res.status(200).json({
      message: "Logs fetched successfully",
      logs: uniqueLogs,
      agentBreaks,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
}

async function getAgentCallStats(req, res) {
  try {
    const agentId = req.user._id;

    // Get agent details to match with quotations and payment history
    const agent = await AgentModel.findById(agentId);
    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }

    const logs = await Logs.find({ agentId });
    const leads = await Leads.find({ agent: agentId });
    const agentBreak = await AgentsBreak.findOne({
      agentId,
      type: "Break",
    }).sort({
      createdAt: -1,
    });
    const agentOffDuty = await AgentsBreak.findOne({
      agentId,
      type: "OffDuty",
    });

    // Get today's date range
    const todayStart = moment().startOf("day").toDate();
    const todayEnd = moment().endOf("day").toDate();

    // Today's statistics
    const todayLogs = logs.filter((log) => {
      const logDate = moment(log.time);
      return logDate.isSame(moment(), "day");
    });

    // Today's quotations generated by this agent
    const todayQuotations = await Quotation.find({
      agentName: agent.name,
      createdAt: {
        $gte: todayStart,
        $lte: todayEnd,
      },
    });

    // Today's payments received by this agent
    const todayPayments = await PaymentLink.find({
      agentId: agentId,
      status: "paid",
    });

    const dialedCalls = logs.filter(
      (log) => log.direction.toLowerCase() === "outgoing",
    );
    const connectedCalls = logs.reduce(
      (acc, log) => acc + (log.duration > 0 ? 1 : 0),
      0,
    );
    const avgCallDuration =
      logs.reduce((acc, log) => acc + log.duration, 0) / connectedCalls;
    const nonLeadCalls = logs.reduce(
      (acc, log) =>
        acc + (!leads.find((lead) => lead.number === log.number) ? 1 : 0),
      0,
    );

    const firstCalls = leads.reduce(
      (acc, lead) =>
        acc + (!logs.find((log) => log.number === lead.number) ? 1 : 0),
      0,
    );
    const followUpCalls = 0;
    let idleTimeSinceLogin = 0;
    let breakTimeSinceLogin = 0;

    if (agentBreak?.status === "Ongoing") {
      breakTimeSinceLogin = moment().diff(agentBreak.startTime, "seconds");
    }
    if (agentOffDuty?.status === "Ended") {
      idleTimeSinceLogin = moment().diff(agentOffDuty.endTime, "seconds");
    }

    const todayTalkTime = logs.reduce((acc, log) => {
      const logDate = moment(log.time);
      const today = moment();
      if (logDate.isSame(today, "day")) {
        return acc + log.duration;
      }
      return acc;
    }, 0);

    const todayPaymentAmount = todayPayments.reduce((acc, payment) => {
      return acc + (payment.amount || 0) / 100;
    }, 0);

    res.status(200).json({
      message: "Agent call statistics fetched successfully!",
      data: {
        totalCalls: logs.length,
        dialedCalls: dialedCalls.length,
        receivedCalls: logs.length - dialedCalls.length,
        avgCallDuration,
        connectedCalls,
        nonLeadCalls,
        todayTalkTime,
        firstCalls,
        followUpCalls,
        idleTimeSinceLogin,
        breakTimeSinceLogin,
        // New statistics
        todayTotalCalls: todayLogs.length,
        todayQuotationsGenerated: todayQuotations.length,
        todayPaymentReceived: Number(
          todayPaymentAmount.toFixed(2),
        ).toLocaleString(),
        todayPaymentCount: todayPayments.length,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
}

const formatDuration = (seconds) => {
  if (!seconds || seconds === 0) return "0s";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes > 0 && remainingSeconds > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m`;
  } else {
    return `${remainingSeconds}s`;
  }
};

async function getCallHistory(req, res) {
  try {
    const agentId = req.user._id;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 500;
    const skip = (page - 1) * limit;

    const dateFilter = {};
    if (req.query.startDate && req.query.endDate) {
      dateFilter.time = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate),
      };
    }

    const directionFilter = req.query.direction
      ? { direction: req.query.direction }
      : {};

    const filter = {
      agentId,
      ...dateFilter,
      ...directionFilter,
    };

    // Get total count for pagination info
    const totalCalls = await Logs.countDocuments(filter);

    // Get logs with only needed fields
    const logs = await Logs.find(filter, {
      number: 1,
      duration: 1,
      time: 1,
      direction: 1,
      callId: 1,
    })
      .sort({ time: -1 })
      .skip(skip)
      .limit(limit);

    // Get only necessary fields from leads
    const leads = await Leads.find({ agent: agentId }, { number: 1, name: 1 });

    // Create a map of phone numbers to lead names for quick lookup
    const leadMap = new Map();
    leads.forEach((lead) => {
      leadMap.set(lead.number, lead.name);
    });

    // Map logs data with lead information
    const callHistory = logs.map((log, index) => ({
      id: ((page - 1) * limit + index + 1).toString(),
      lead: leadMap.get(log.number) || log.number,
      duration: formatDuration(log.duration),
      time: moment(log.time).utcOffset("+05:30").format("hh:mm A DD/MM/YYYY"),
      direction: log.direction,
      number: log.number,
      callId: log.callId,
    }));

    res.status(200).json({
      message: "Call history fetched successfully!",
      data: {
        history: callHistory,
        pagination: {
          totalCalls,
          totalPages: Math.ceil(totalCalls / limit),
          currentPage: page,
          limit,
        },
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  getAllLogs,
  postLog,
  getLogByAgent,
  getCallHistory,
  getAgentCallStats,
};
