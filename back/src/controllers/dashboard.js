const moment = require("moment");
const Leads = require("../models/Leads");
const LogModel = require("../models/Logs");
const AdminModel = require("../models/Admin");
const AgentModel = require("../models/Agents");
const PaymentModel = require("../models/PaymentLink");
const AgentBreakModel = require("../models/AgentsBreak");
const OnlineTime = require("../models/OnlineTime");

const getMonthlyLeads = async (req, res) => {
  try {
    console.log("Fetching monthly leads data...");
    console.time("monthlyLeads");
    const leads = await Leads.aggregate([
      {
        $group: {
          _id: { $month: "$receivedDate" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const leadsWithMonthNames = monthNames.map((month, index) => {
      const lead = leads.find((lead) => lead._id === index + 1);
      return {
        month,
        count: lead ? lead.count : 0,
      };
    });
    console.timeEnd("monthlyLeads");

    console.log("monthlyLeads End");

    res
      .status(200)
      .json({ message: "Monthly Leads", data: leadsWithMonthNames });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// async function getDashboardData(req, res) {
//   try {
//     console.time("getDashboardData");
//     const isAgent = req.isAgent;
//     const agentId = isAgent ? req.user._id : null;
//     // const today = moment().startOf("day").toDate();
//     const thirtyDaysAgo = moment().subtract(30, "days").startOf("day").toDate();

//     // Step 1: Get agents data with filter
//     const agentQuery = isAgent ? { _id: agentId } : {};
//     const agents = await AgentModel.find(agentQuery).select("_id name").lean();

//     if (!agents.length) {
//       return res.status(200).json({
//         message: "Dashboard Data",
//         data: { agentCalls: [], agentPayments: [], agentIdelTime: [] },
//       });
//     }

//     const agentIds = agents.map((agent) => agent._id);

//     // Step 2: Get today's call counts in a single aggregation
//     // const agentCallsAggregation = await LogModel.aggregate([
//     //   {
//     //     $match: {
//     //       agentId: { $in: agentIds },
//     //       time: { $gte: today },
//     //       duration: { $gt: 0 },
//     //     },
//     //   },
//     //   {
//     //     $group: {
//     //       _id: "$agentId",
//     //       count: { $sum: 1 },
//     //     },
//     //   },
//     // ]);

//     // Step 3: Get payment counts in a single aggregation
//     const agentPaymentsAggregation = await PaymentModel.aggregate([
//       {
//         $match: {
//           agentId: { $in: agentIds },
//         },
//       },
//       {
//         $group: {
//           _id: "$agentId",
//           count: { $sum: 1 },
//         },
//       },
//     ]);

//     // Step 4: Get login/logout times for agents
//     const loginLogoutTimes = await AgentBreakModel.aggregate([
//       {
//         $match: {
//           agentId: { $in: agentIds },
//           type: "OffDuty",
//           startTime: { $gte: thirtyDaysAgo },
//         },
//       },
//       {
//         $group: {
//           _id: {
//             agentId: "$agentId",
//             date: { $dateToString: { format: "%Y-%m-%d", date: "$startTime" } },
//           },
//           loginTime: { $min: "$startTime" },
//           logoutTime: { $max: "$endTime" },
//         },
//       },
//     ]);

//     // Create a map for quick access to login/logout times
//     const loginLogoutMap = {};
//     loginLogoutTimes.forEach((record) => {
//       const agentId = record._id.agentId.toString();
//       const date = record._id.date;
//       if (!loginLogoutMap[agentId]) {
//         loginLogoutMap[agentId] = {};
//       }
//       loginLogoutMap[agentId][date] = {
//         loginTime: record.loginTime,
//         logoutTime: record.logoutTime,
//       };
//     });

//     // Step 5: Calculate idle time metrics more efficiently
//     // Get all relevant break and idle records with limited date range
//     const [idleTimes, breakTimes, callLogs] = await Promise.all([
//       AgentBreakModel.find({
//         agentId: { $in: agentIds },
//         type: "OffDuty",
//         startTime: { $gte: thirtyDaysAgo },
//       }).lean(),

//       AgentBreakModel.find({
//         agentId: { $in: agentIds },
//         type: "Break",
//         startTime: { $gte: thirtyDaysAgo },
//       }).lean(),

//       LogModel.find({
//         agentId: { $in: agentIds },
//         time: { $gte: thirtyDaysAgo },
//         duration: { $gt: 0 },
//       }).lean(),
//     ]);

//     // Process idle time data more efficiently
//     const idleTimeByAgentAndDay = {};

//     // Process idle times
//     idleTimes.forEach((record) => {
//       const agentIdStr = record.agentId.toString();
//       const day = moment(record.startTime).format("DD-MM-YYYY");

//       if (!idleTimeByAgentAndDay[agentIdStr]) {
//         idleTimeByAgentAndDay[agentIdStr] = {};
//       }

//       if (!idleTimeByAgentAndDay[agentIdStr][day]) {
//         idleTimeByAgentAndDay[agentIdStr][day] = {
//           totalDuration: 0,
//           breakDuration: 0,
//           callDuration: 0,
//           loginTime: null,
//           logoutTime: null,
//         };
//       }

//       idleTimeByAgentAndDay[agentIdStr][day].totalDuration +=
//         record.duration || 0;
//     });

//     // Process break times
//     breakTimes.forEach((record) => {
//       const agentIdStr = record.agentId.toString();
//       const day = moment(record.startTime).format("DD-MM-YYYY");

//       if (!idleTimeByAgentAndDay[agentIdStr]) {
//         idleTimeByAgentAndDay[agentIdStr] = {};
//       }

//       if (!idleTimeByAgentAndDay[agentIdStr][day]) {
//         idleTimeByAgentAndDay[agentIdStr][day] = {
//           totalDuration: 0,
//           breakDuration: 0,
//           callDuration: 0,
//           loginTime: null,
//           logoutTime: null,
//         };
//       }

//       idleTimeByAgentAndDay[agentIdStr][day].breakDuration +=
//         record.duration || 0;
//     });

//     // Process call logs
//     callLogs.forEach((call) => {
//       const agentIdStr = call.agentId.toString();
//       const day = moment(call.time).format("DD-MM-YYYY");

//       if (!idleTimeByAgentAndDay[agentIdStr]) {
//         idleTimeByAgentAndDay[agentIdStr] = {};
//       }

//       if (!idleTimeByAgentAndDay[agentIdStr][day]) {
//         idleTimeByAgentAndDay[agentIdStr][day] = {
//           totalDuration: 0,
//           breakDuration: 0,
//           callDuration: 0,
//           loginTime: null,
//           logoutTime: null,
//         };
//       }

//       idleTimeByAgentAndDay[agentIdStr][day].callDuration += call.duration || 0;
//     });

//     // Add login/logout times to the idleTimeByAgentAndDay
//     Object.keys(loginLogoutMap).forEach((agentId) => {
//       Object.keys(loginLogoutMap[agentId]).forEach((date) => {
//         const formattedDate = moment(date).format("DD-MM-YYYY");
//         if (!idleTimeByAgentAndDay[agentId]) {
//           idleTimeByAgentAndDay[agentId] = {};
//         }
//         if (!idleTimeByAgentAndDay[agentId][formattedDate]) {
//           idleTimeByAgentAndDay[agentId][formattedDate] = {
//             totalDuration: 0,
//             breakDuration: 0,
//             callDuration: 0,
//             loginTime: null,
//             logoutTime: null,
//           };
//         }
//         idleTimeByAgentAndDay[agentId][formattedDate].loginTime =
//           loginLogoutMap[agentId][date].loginTime;
//         idleTimeByAgentAndDay[agentId][formattedDate].logoutTime =
//           loginLogoutMap[agentId][date].logoutTime;
//       });
//     });

//     // Format the response data
//     // const agentCallsCount = agents.map((agent) => {
//     //   const agentIdStr = agent._id.toString();
//     //   const callData = agentCallsAggregation.find(
//     //     (data) => data._id.toString() === agentIdStr,
//     //   );

//     //   return {
//     //     _id: agent._id,
//     //     agent: agent.name,
//     //     count: callData ? callData.count : 0,
//     //   };
//     // });

//     const agentPayments = agents.map((agent) => {
//       const agentIdStr = agent._id.toString();
//       const paymentData = agentPaymentsAggregation.find(
//         (data) => data._id.toString() === agentIdStr,
//       );

//       return {
//         _id: agent._id,
//         agent: agent.name,
//         count: paymentData ? paymentData.count.toLocaleString() : "0",
//       };
//     });
//     console.log("-------AGENTS-------", agents);
//     const agentIdelTime = await Promise.all(
//       agents.map(async (agent) => {
//         const agentIdStr = agent._id.toString();

//         // Get all unique dates across all agents
//         const allDates = new Set();
//         Object.keys(idleTimeByAgentAndDay).forEach((agentId) => {
//           if (idleTimeByAgentAndDay[agentId]) {
//             Object.keys(idleTimeByAgentAndDay[agentId]).forEach((date) => {
//               allDates.add(date);
//             });
//           }
//         });

//         // If agent has no data, initialize with all dates from other agents
//         if (
//           !idleTimeByAgentAndDay[agentIdStr] ||
//           Object.keys(idleTimeByAgentAndDay[agentIdStr]).length === 0
//         ) {
//           idleTimeByAgentAndDay[agentIdStr] = {};
//           allDates.forEach((date) => {
//             idleTimeByAgentAndDay[agentIdStr][date] = {
//               totalDuration: 0,
//               breakDuration: 0,
//               callDuration: 0,
//               loginTime: null,
//               logoutTime: null,
//             };
//           });
//         } else {
//           // Ensure this agent has entries for all dates
//           allDates.forEach((date) => {
//             if (!idleTimeByAgentAndDay[agentIdStr][date]) {
//               idleTimeByAgentAndDay[agentIdStr][date] = {
//                 totalDuration: 0,
//                 breakDuration: 0,
//                 callDuration: 0,
//                 loginTime: null,
//                 logoutTime: null,
//               };
//             }
//           });
//         }

//         // Continue with the existing code
//         const agentIdleData = idleTimeByAgentAndDay[agentIdStr];

//         return {
//           _id: agent._id,
//           agent: agent.name,
//           idleTimeByDay: await Promise.all(
//             Object.keys(agentIdleData).map(async (day) => {
//               const dayData = agentIdleData[day];
//               // const netIdleDuration =
//               //   24 * 60 * 60 -
//               //   Math.max(
//               //     0,
//               //     dayData.totalDuration +
//               //       dayData.breakDuration +
//               //       dayData.callDuration
//               //   );
//               let onlineTime = await OnlineTime.findOne({
//                 userId: agent._id,
//                 createdAt: {
//                   $gte: new Date(day?.split("-").reverse().join("-")).setHours(
//                     0,
//                     0,
//                     0,
//                     0,
//                   ),
//                   $lte: new Date(day?.split("-").reverse().join("-")).setHours(
//                     23,
//                     59,
//                     59,
//                     999,
//                   ),
//                 },
//               }).lean();
//               const netIdleDuration =
//                 moment(onlineTime?.logoutTime).unix() -
//                   moment(onlineTime?.loginTime).unix() -
//                   dayData?.callDuration || 0;

//               // console.log(agent, day, onlineTime);
//               return {
//                 date: day?.split("-").reverse().join("-"),
//                 totalDuration: formatDuration(dayData.totalDuration),
//                 breakDuration: formatDuration(dayData.breakDuration),
//                 callDuration: formatDuration(dayData.callDuration),
//                 netIdleDuration: formatDuration(netIdleDuration),
//                 loginTime: onlineTime
//                   ? moment(onlineTime.loginTime)
//                       .utcOffset("+05:30")
//                       .format("hh:mm:ss A")
//                   : "-",

//                 //  dayData.loginTime
//                 //   ? moment(dayData.loginTime)
//                 //       .utcOffset("+05:30")
//                 //       .format("HH:mm:ss A")
//                 //   : "-",

//                 logoutTime:
//                   onlineTime && onlineTime?.logoutTime
//                     ? moment(onlineTime?.logoutTime)
//                         .utcOffset("+05:30")
//                         .format("hh:mm:ss A")
//                     : "-",
//                 // dayData.logoutTime
//                 //   ? moment(dayData.logoutTime)
//                 //       .utcOffset("+05:30")
//                 //       .format("HH:mm:ss A")
//                 //   : "-",
//               };
//             }),
//           ),
//         };
//       }),
//     );
// console.timeEnd("getDashboardData");
// console.log("------------")
//     res.status(200).json({
//       message: "Dashboard Data",
//       data: {
//         agentCalls: [],
//         agentPayments: agentPayments,
//         agentIdelTime: agentIdelTime,
//         // idleTimes,
//       },
//     });

//   } catch (error) {
//     console.error(error.message);
//     res.status(500).json({ message: error.message });
//   }
// }
async function getDashboardData(req, res) {
  try {
    console.time("getDashboardData");
    const isAgent = req.isAgent;
    const agentId = isAgent ? req.user._id : null;
    const thirtyDaysAgo = moment().subtract(30, "days").startOf("day").toDate();

    // Step 1: Get agents data with filter
    const agentQuery = isAgent ? { _id: agentId } : {};
    const agents = await AgentModel.find(agentQuery).select("_id name").lean();
    if (!agents.length) {
      return res.status(200).json({
        message: "Dashboard Data",
        data: { agentCalls: [], agentPayments: [], agentIdelTime: [] },
      });
    }

    const agentIds = agents.map((agent) => agent._id);
    const agentIdSet = new Set(agentIds.map((id) => id.toString()));
    const dateRangeStart = moment(thirtyDaysAgo).format("YYYY-MM-DD");
    const dateRangeEnd = moment().format("YYYY-MM-DD");

    // Step 2: Fetch all required data concurrently
    const [
      agentPaymentsAggregation,
      loginLogoutTimes,
      idleTimes,
      breakTimes,
      callLogs,
      onlineTimes,
    ] = await Promise.all([
      PaymentModel.aggregate([
        { $match: { agentId: { $in: agentIds } } },
        { $group: { _id: "$agentId", count: { $sum: 1 } } },
      ]),
      AgentBreakModel.aggregate([
        {
          $match: {
            agentId: { $in: agentIds },
            type: "OffDuty",
            startTime: { $gte: thirtyDaysAgo },
          },
        },
        {
          $group: {
            _id: {
              agentId: "$agentId",
              date: {
                $dateToString: { format: "%Y-%m-%d", date: "$startTime" },
              },
            },
            loginTime: { $min: "$startTime" },
            logoutTime: { $max: "$endTime" },
          },
        },
      ]),
      AgentBreakModel.find({
        agentId: { $in: agentIds },
        type: "OffDuty",
        startTime: { $gte: thirtyDaysAgo },
      }).lean(),
      AgentBreakModel.find({
        agentId: { $in: agentIds },
        type: "Break",
        startTime: { $gte: thirtyDaysAgo },
      }).lean(),
      LogModel.find({
        agentId: { $in: agentIds },
        time: { $gte: thirtyDaysAgo },
        duration: { $gt: 0 },
      }).lean(),
      OnlineTime.find({
        userId: { $in: agentIds },
        createdAt: {
          $gte: thirtyDaysAgo,
          $lte: new Date(moment().endOf("day").toDate()),
        },
      }).lean(),
    ]);

    // Step 3: Build loginLogoutMap efficiently
    const loginLogoutMap = {};
    loginLogoutTimes.forEach((record) => {
      const agentIdStr = record._id.agentId.toString();
      const date = record._id.date;
      loginLogoutMap[agentIdStr] = loginLogoutMap[agentIdStr] || {};
      loginLogoutMap[agentIdStr][date] = {
        loginTime: record.loginTime,
        logoutTime: record.logoutTime,
      };
    });

    // Step 4: Process idle, break, and call data
    const idleTimeByAgentAndDay = {};
    const allDates = new Set();

    const initializeAgentDay = (agentIdStr, day) => {
      allDates.add(day);
      if (!idleTimeByAgentAndDay[agentIdStr]) {
        idleTimeByAgentAndDay[agentIdStr] = {};
      }
      if (!idleTimeByAgentAndDay[agentIdStr][day]) {
        idleTimeByAgentAndDay[agentIdStr][day] = {
          totalDuration: 0,
          breakDuration: 0,
          callDuration: 0,
          loginTime: null,
          logoutTime: null,
        };
      }
    };

    idleTimes.forEach((record) => {
      const agentIdStr = record.agentId.toString();
      const day = moment(record.startTime).format("DD-MM-YYYY");
      initializeAgentDay(agentIdStr, day);
      idleTimeByAgentAndDay[agentIdStr][day].totalDuration +=
        record.duration || 0;
    });

    breakTimes.forEach((record) => {
      const agentIdStr = record.agentId.toString();
      const day = moment(record.startTime).format("DD-MM-YYYY");
      initializeAgentDay(agentIdStr, day);
      idleTimeByAgentAndDay[agentIdStr][day].breakDuration +=
        record.duration || 0;
    });

    callLogs.forEach((call) => {
      const agentIdStr = call.agentId.toString();
      const day = moment(call.time).format("DD-MM-YYYY");
      initializeAgentDay(agentIdStr, day);
      idleTimeByAgentAndDay[agentIdStr][day].callDuration += call.duration || 0;
    });

    Object.entries(loginLogoutMap).forEach(([agentId, dates]) => {
      Object.keys(dates).forEach((date) => {
        const formattedDate = moment(date).format("DD-MM-YYYY");
        initializeAgentDay(agentId, formattedDate);
        idleTimeByAgentAndDay[agentId][formattedDate].loginTime =
          loginLogoutMap[agentId][date].loginTime;
        idleTimeByAgentAndDay[agentId][formattedDate].logoutTime =
          loginLogoutMap[agentId][date].logoutTime;
      });
    });

    // Step 5: Process online times
    const onlineTimeMap = {};
    onlineTimes.forEach((record) => {
      const agentIdStr = record.userId.toString();
      const day = moment(record.createdAt).format("DD-MM-YYYY");
      onlineTimeMap[agentIdStr] = onlineTimeMap[agentIdStr] || {};
      onlineTimeMap[agentIdStr][day] = record;
    });

    // Step 6: Format agent payments
    const agentPayments = agents.map((agent) => {
      const agentIdStr = agent._id.toString();
      const paymentData = agentPaymentsAggregation.find(
        (data) => data._id.toString() === agentIdStr,
      );
      return {
        _id: agent._id,
        agent: agent.name,
        count: paymentData ? paymentData.count.toLocaleString() : "0",
      };
    });

    // Step 7: Format agent idle time
    const agentIdelTime = await Promise.all(
      agents.map(async (agent) => {
        const agentIdStr = agent._id.toString();

        if (!idleTimeByAgentAndDay[agentIdStr]) {
          idleTimeByAgentAndDay[agentIdStr] = {};
          allDates.forEach((date) => {
            initializeAgentDay(agentIdStr, date);
          });
        } else {
          allDates.forEach((date) => {
            initializeAgentDay(agentIdStr, date);
          });
        }

        const agentIdleData = idleTimeByAgentAndDay[agentIdStr];

        return {
          _id: agent._id,
          agent: agent.name,
          idleTimeByDay: Object.entries(agentIdleData).map(([day, dayData]) => {
            const onlineTime = onlineTimeMap[agentIdStr]?.[day];
            let netIdleDuration = "-";
            if (
              onlineTime &&
              onlineTime.loginTime &&
              onlineTime.logoutTime &&
              moment(onlineTime.loginTime).isValid() &&
              moment(onlineTime.logoutTime).isValid()
            ) {
              const duration =
                moment(onlineTime.logoutTime).unix() -
                moment(onlineTime.loginTime).unix() -
                dayData.callDuration;
              if (duration >= 0) {
                netIdleDuration = formatDuration(duration);
              }
            }

            return {
              date: day.split("-").reverse().join("-"),
              totalDuration: formatDuration(dayData.totalDuration),
              breakDuration: formatDuration(dayData.breakDuration),
              callDuration: formatDuration(dayData.callDuration),
              netIdleDuration,
              loginTime: onlineTime?.loginTime
                ? moment(onlineTime.loginTime)
                    .utcOffset("+05:30")
                    .format("hh:mm:ss A")
                : "-",
              logoutTime: onlineTime?.logoutTime
                ? moment(onlineTime.logoutTime)
                    .utcOffset("+05:30")
                    .format("hh:mm:ss A")
                : "-",
            };
          }),
        };
      }),
    );

    console.timeEnd("getDashboardData");
    console.log("------------");
    res.status(200).json({
      message: "Dashboard Data",
      data: {
        agentCalls: [],
        agentPayments,
        agentIdelTime,
      },
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: error.message });
  }
}
async function getTodaysCall(req, res) {
  try {
    const isAgent = req.isAgent;
    const agentId = isAgent ? req.user._id : null;
    const today = moment()
      .startOf("day")
      .set({ hours: 0, minutes: 0, seconds: 0, milliseconds: 0 })
      .toDate();
    const tomorrow = moment(today).add(1, "day").toDate();

    const agentQuery = isAgent ? { _id: agentId } : {};
    const agents =
      (await AgentModel.find(agentQuery).select("_id name").lean()) || [];

    if (!agents.length) {
      return res.status(200).json({
        message: "Today's Calls",
        data: [],
      });
    }

    const agentIds = agents.map((agent) => agent._id);

    // Get call counts in a single aggregation
    const agentCallsAggregation = await LogModel.aggregate([
      {
        $match: {
          agentId: { $in: agentIds },
          time: { $gte: today, $lt: tomorrow },
          duration: { $gt: 0 },
        },
      },
      {
        $group: {
          _id: {
            agentId: "$agentId",
            callId: "$callId", // Group by callId to avoid counting duplicates
          },
          uniqueCall: { $first: 1 }, // Take just one entry per callId
        },
      },
      {
        $group: {
          _id: "$_id.agentId",
          count: { $sum: "$uniqueCall" }, // Count unique calls per agent
        },
      },
    ]);

    const agentCallsCount = agents?.map((agent) => {
      const agentIdStr = agent._id.toString();
      const callData = agentCallsAggregation.find(
        (data) => data._id.toString() === agentIdStr,
      );

      return {
        _id: agent._id,
        agent: agent.name,
        count: callData ? callData.count : 0,
      };
    });

    res.status(200).json({
      message: "Today's Calls",
      data: agentCallsCount,
    });
  } catch (error) {
    console.error("Error in getTodaysCall:", error.message);
    res.status(500).json({ message: "Failed to fetch today's calls" });
  }
}

// Helper function to format duration in hours, minutes, seconds
function formatDuration(seconds) {
  return moment.utc(seconds * 1000).format("H[h] m[m] s[s]");
}

module.exports = {
  getTodaysCall,
  getMonthlyLeads,
  getDashboardData,
};
