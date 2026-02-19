const AgentModel = require("../models/Agents");
const LogModel = require("../models/Logs");
const Leads = require("../models/Leads");

const moment = require("moment");
const xlsx = require("xlsx");
// const Leads = require("../models/Leads");

// async function getAllLeads(req, res) {
//   console.time("LEADS")
//   try {
//     // console.log(req.query?.isSourceCount, typeof req.query?.isSourceCount);
//     if (req.query.isSourceCount == "true") {
//       // console.log("status count" , req?.query?.selectedStatus);
//       const leads = await Leads.find(
//         {
//           ...(req?.query?.selectedStatus && {
//             status: req?.query?.selectedStatus,
//           }),
//         },
//         { source: true },
//       ).lean();
//       const obj = {};
//       leads.forEach((lead) => {
//         if (obj[lead.source]) {
//           obj[lead.source]++;
//         } else {
//           obj[lead.source] = 1;
//         }
//       });
//   console.timeEnd("LEADS")
//   console.log("-----------LEADS END-----------")

//       return res
//         .status(200)
//         .json({ message: "Status count fetched successfully !!!", obj });
//     }
//     const currentPage = req.query.page;
//     const limit = req.query.limit;
//     const skip = currentPage ? (currentPage - 1) * limit : 0;
//     // console.log(typeof );
//     // if(){
//     let SearchQuery = {
//       ...(req.isAgent && { agent: req.user._id }),
//       ...(req.query.status && { status: req.query.status }),
//       ...(req.query.source && { source: req.query.source }),
//       ...((req.query.startDate || req.query.endDate) && {
//         receivedDate: {
//           ...(req.query.startDate && { $gte: new Date(req.query.startDate) }),
//           ...(req.query.endDate && { $lte: new Date(req.query.endDate) }),
//         },
//       }),
//       ...(req.query.phoneNumber &&
//         req.query.phoneNumber != "" && {
//           number: {
//             $regex: req.query.phoneNumber.replace(/\+/g, "\\+"),
//             $options: "i",
//           },
//         }),
//       ...(req.query.isMonthly == "true" && {
//         $expr: {
//           $and: [
//             { $eq: [{ $month: "$assignDate" }, new Date().getMonth() + 1] },
//             { $eq: [{ $year: "$assignDate" }, new Date().getFullYear()] },
//           ],
//         },
//       }),
//       ...(req.query.isAnalytics === "true" && {
//         ...(req.query.month &&
//           req.query.year && {
//             createdAt: {
//               $gte: new Date(req.query.year, req.query.month - 1, 1),
//               $lt: new Date(req.query.year, req.query.month, 1),
//             },
//           }),
//       }),
//       // New condition: Single condition for month and year if any one is present
//       ...((req.query.month !== undefined || req.query.year !== undefined) && {
//         createdAt: {
//           ...(req.query.year !== undefined && {
//             $gte: new Date(
//               req.query.year,
//               req.query.month !== undefined ? req.query.month : 0,
//               1,
//             ),
//             $lt: new Date(
//               req.query.year,
//               req.query.month !== undefined ? req.query.month + 1 : 12,
//               1,
//             ),
//           }),
//           ...(req.query.year === undefined &&
//             req.query.month !== undefined && {
//               $expr: {
//                 $eq: [{ $month: "$createdAt" }, req.query.month + 1], // MongoDB months are 1-indexed
//               },
//             }),
//         },
//       }),
//     };
//     // console.log(SearchQuery, currentPage, limit, skip);
//     let totalLeads = await Leads.countDocuments(SearchQuery);

//     let leads = await Leads.find(
//       SearchQuery,
//       req.query.isAnalytics == "true" && {
//         status: true,
//         address: true,
//         assignDate: true,
//         agent: true,
//       },
//     )
//       .sort({ receivedDate: -1 })
//       .lean()
//       .limit(limit || totalLeads)
//       .skip(skip);

//     let agents = await AgentModel.find({}).lean();

//     // let TotalLeads= await Leads.find({}, {source: true});
//     // let set= new Set(TotalLeads.map(v=>v.source));
//     // let sources= Array.from(set);
//     // console.log(sources);

//     // console.log(leads);
//     // console.log(agents);

//     leads = leads.map((lead) => ({
//       ...lead,
//       ...(lead?.agent && {
//         agent: {
//           name: agents.find((val) => val?._id.equals(lead?.agent))?.name,
//           _id: lead?.agent,
//         },
//       }),
//       receivedDate: moment(lead.receivedDate).format("DD/MM/YYYY"),
//     }));
//     // leads = await Promise.all(
//     //   leads.map(async (lead) => {
//     //     lead.receivedDate = moment(lead.receivedDate).format("DD/MM/YYYY");
//     //     //
//     //     if (lead?.agent) {
//     //       const agent = await AgentModel.findById(lead.agent);
//     //       // Get the last 10 digits of the lead's number for comparison
//     //       const lastTenDigits = lead.number?.replace(/\D/g, "").slice(-10);

//     //       // Find logs that match the last 10 digits of any number
//     //       const logs = await LogModel.find({
//     //         number: { $regex: lastTenDigits + "$" }, // Matches numbers ending with these 10 digits
//     //       })
//     //         .sort({ time: -1 })
//     //         .limit(1)
//     //         .lean();

//     //       lead.lastCall = logs[0]?.time
//     //         ? moment(logs[0]?.time).format("DD/MM/YYYY")
//     //         : "Not Called";
//     //       lead.agent = agent ? { name: agent.name, _id: agent._id } : null;
//     //     } else {
//     //       lead.agent = null;
//     //     }
//     //     return lead;
//     //   }),
//     // );
//     // }
//     // else{
//     // leads = await Leads.find({} );
//     // }
//     // if(!req.isAgent){
//     //   leads= await Promise.all(leads.map(async (lead)=> {
//     //     const agent = await AgentModel.findById(lead.agent);
//     //     return {...lead._doc, agent: {
//     //       name: agent.name,
//     //       _id: agent._id,
//     //     }};
//     //   }))
//     // }
//       console.timeEnd("LEADS")
//   console.log("-----------LEADS END-----------")
//     return res.status(200).json({
//       message: "Leads fetched successfully !!!",
//       leads,
//       totalLeads,
//       currentPage,
//       limit,
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// }
async function getAllLeads(req, res) {
  console.time("LEADS");
  try {
    if (req.query.isSourceCount === "true") {
      const matchQuery = req.query.selectedStatus
        ? { status: req.query.selectedStatus }
        : {};
      const sourceCounts = await Leads.aggregate([
        { $match: matchQuery },
        { $group: { _id: "$source", count: { $sum: 1 } } },
        { $project: { source: "$_id", count: 1, _id: 0 } },
      ]);

      const obj = sourceCounts.reduce((acc, { source, count }) => {
        acc[source] = count;
        return acc;
      }, {});

      console.timeEnd("LEADS");
      console.log("-----------LEADS END-----------");
      return res
        .status(200)
        .json({ message: "Status count fetched successfully !!!", obj });
    }

    const currentPage = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10);
    const skip = (currentPage - 1) * limit;

    const SearchQuery = {
      ...(req.isAgent && { agent: req.user._id }),
      ...(req.query.status && { status: req.query.status }),
      ...(req.query.source && { source: req.query.source }),
      ...((req.query.startDate || req.query.endDate) && {
        receivedDate: {
          ...(req.query.startDate && { $gte: new Date(req.query.startDate) }),
          ...(req.query.endDate && { $lte: new Date(req.query.endDate) }),
        },
      }),
      ...(req.query.phoneNumber &&
        req.query.phoneNumber !== "" && {
          number: {
            $regex: req.query.phoneNumber.replace(/\+/g, "\\+"),
            $options: "i",
          },
        }),
      ...(req.query.isMonthly === "true" && {
        $expr: {
          $and: [
            { $eq: [{ $month: "$assignDate" }, new Date().getMonth() + 1] },
            { $eq: [{ $year: "$assignDate" }, new Date().getFullYear()] },
          ],
        },
      }),
      ...(req.query.isAnalytics === "true" &&
        req.query.month &&
        req.query.year && {
          createdAt: {
            $gte: new Date(
              parseInt(req.query.year, 10),
              parseInt(req.query.month, 10) - 1,
              1,
            ),
            $lt: new Date(
              parseInt(req.query.year, 10),
              parseInt(req.query.month, 10),
              1,
            ),
          },
        }),
      ...((req.query.month !== undefined || req.query.year !== undefined) && {
        createdAt: {
          ...(req.query.year !== undefined && {
            $gte: new Date(
              parseInt(req.query.year, 10),
              req.query.month !== undefined ? parseInt(req.query.month, 10) : 0,
              1,
            ),
            $lt: new Date(
              parseInt(req.query.year, 10),
              req.query.month !== undefined
                ? parseInt(req.query.month, 10) + 1
                : 12,
              1,
            ),
          }),
          ...(req.query.year === undefined &&
            req.query.month !== undefined && {
              $expr: {
                $eq: [
                  { $month: "$createdAt" },
                  parseInt(req.query.month, 10) + 1,
                ],
              },
            }),
        },
      }),
    };

    // Fetch leads, count, and all agents concurrently
    const [leadsResult, totalLeads, agents] = await Promise.all([
      Leads.find(SearchQuery)
        .select(req.query.isAnalytics === "true" ? "status address" : "")
        .sort({ receivedDate: -1 })
        .lean()
        .limit(limit || 0)
        .skip(skip),
      //status address assignDate agent receivedDate number
      Leads.countDocuments(SearchQuery),
      AgentModel.find({}).select("_id name").lean(), // Fetch all 13-15 agents
    ]);

    // Create agent map for O(1) lookups
    const agentMap = agents.reduce((map, agent) => {
      map[agent._id.toString()] = { name: agent.name, _id: agent._id };
      return map;
    }, {});

    // Transform leads with agent data and formatted dates
    const leads = leadsResult.map((lead) => ({
      ...lead,
      agent: lead.agent ? agentMap[lead.agent.toString()] || null : null,
      receivedDate: moment(lead.receivedDate).format("DD/MM/YYYY"),
    }));

    console.timeEnd("LEADS");
    console.log("-----------LEADS END-----------");
    return res.status(200).json({
      message: "Leads fetched successfully !!!",
      leads,
      totalLeads,
      currentPage,
      limit,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: error.message });
  }
}

async function postLeads(req, res) {
  try {
    const body = req.body;
    const isAgent = req.isAgent;
    if (isAgent) {
      const agent = req.user;
      body.agent = agent._id;
      body.status = "Not Contacted";
    }
    const newLead = await Leads.create(body);
    res.status(201).json({ message: "Lead created successfully !!!", newLead });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function updateLeads(req, res) {
  try {
    const id = req.params.id;
    const isAgent = req.isAgent;
    if (isAgent) {
      let updatedLead = await Leads.findById(id);
      if (updatedLead.agent.toString() !== req.user._id) {
        throw new Error("You are not authorized to update this lead !!!");
      }
      updatedLead = await Leads.findByIdAndUpdate(id, req.body, { new: true });
      res
        .status(200)
        .json({ message: "Lead updated successfully !!!", updatedLead });
    } else {
      const body = req.body;
      if (body.agent) {
        body.status = "Not Contacted";
      }
      const updatedLead = await Leads.findByIdAndUpdate(id, body, {
        new: true,
      }).lean();
      updatedLead.receivedDate = moment(updatedLead.receivedDate).format(
        "DD/MM/YYYY",
      );
      if (updatedLead.agent) {
        const agent = await AgentModel.findById(updatedLead.agent);
        updatedLead.agent = agent ? { name: agent.name, _id: agent._id } : null;
      }
      res
        .status(200)
        .json({ message: "Lead updated successfully !!!", updatedLead });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function deleteLeads(req, res) {
  try {
    const id = req.params.id;
    const isAgent = req.isAgent;
    if (isAgent) {
      throw new Error("You are not authorized to delete this lead !!!");
    }
    await Leads.findByIdAndDelete(id);
    res.status(200).json({ message: "Lead deleted successfully !!!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function getAgentLeads(req, res) {
  try {
    const agent = req.user;
    const leads = await Leads.find({ agent: agent._id }).sort({
      createdAt: -1,
    });
    res
      .status(200)
      .json({ message: "Agent leads fetched successfully !!!", leads });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function updateLeadStatus(req, res) {
  try {
    const agent = req.user;
    if (!req.isAgent) {
      throw new Error("You are not authorized to update this lead !!!");
    }
    const id = req.params.id;
    const lead = await Leads.findOneAndUpdate(
      { _id: id, agent: agent._id },
      {
        status: req.body.status,
        $push: { statusLogs: { status: req.body.status } },
      },
      { new: true },
    );
    res
      .status(200)
      .json({ message: "Lead status updated successfully !!!", lead });
  } catch (error) {
    res.status(500).json({ message: "Lead status update failed !!!" });
  }
}

async function multiAssignLeads(req, res) {
  try {
    // const agent = req.user;
    const leadsToUpdate = req.body.leads;
    // console.log(leadsToUpdate);

    const updatedLeads = await Promise.all(
      leadsToUpdate.map((lead) => {
        return Leads.updateMany(
          { address: lead.address },
          {
            status: "Not Contacted",
            agent: lead.agent._id,
            assignDate: new Date(),
            $push: { statusLogs: { status: "Not Contacted" } },
          },
          { new: true },
        );
      }),
    );

    res
      .status(200)
      .json({ message: "Lead status updated successfully !!!", updatedLeads });
    return;
    if (!req.isAgent) {
      throw new Error("You are not authorized to update this lead !!!");
    }
    const ids = req.body.ids;
    const lead = await Leads.updateMany(
      { _id: { $in: ids } },
      {
        agent: agent._id,
        status: "Not Contacted",
        $push: { statusLogs: { status: "Not Contacted" } },
      },
      { new: true },
    );
    res
      .status(200)
      .json({ message: "Lead status updated successfully !!!", lead });
  } catch (error) {
    res.status(500).json({ message: "Lead status update failed !!!" });
  }
}

const uploadExcelLeads = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please upload an Excel file" });
    }
    const { source } = req.body;

    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert Excel data to array of objects with headers as keys
    const jsonData = xlsx.utils.sheet_to_json(worksheet);
    let formattedData = jsonData.map((lead) => ({
      receivedDate: lead["Recieved Date"]
        ? moment(lead["Recieved Date"]).toDate()
        : "",
      name: lead["Director Name"],
      number: lead["Mobile"],
      company: lead["Company"],
      email: lead["Email"],
      address: lead["State"],
      address2: lead["Address"],
      source: source || lead?.["Source"] || "Company",
      industry: lead["ACTIVITY_DESCRIPTION"],
    }));
    // .filter((lead) => !!lead?.number);
    formattedData = formattedData.filter((v) => v.number && v.number != "");
    let isValid = true;
    formattedData.forEach((lead) => {
      if (!lead?.number) {
        console.log(lead?.company);
        isValid = false;
        // break;
      }
    });
    if (!isValid) {
      return res.status(400).json({ message: "Phone number is mandatory" });
    }

    // console.log(formattedData?.[0]);

    const leads = await Leads.insertMany(formattedData);

    return res.status(200).json({
      success: true,
      // data: formattedData,
      message: "Excel file processed successfully",
    });
  } catch (error) {
    console.error("Error processing Excel file:", error);
    return res.status(500).json({
      success: false,
      message: "Error processing Excel file",
    });
  }
};

module.exports = {
  getAllLeads,
  postLeads,
  updateLeads,
  deleteLeads,
  getAgentLeads,
  updateLeadStatus,
  multiAssignLeads,
  uploadExcelLeads,
};
