const AgentModel = require("../models/Agents");
const LeadsModel = require("../models/Leads");
const AgentsBreak = require("../models/AgentsBreak");
const { sendEmail } = require("../services/mailService");
const Quotations = require("../models/Quotation");
const PaymentHistory = require("../models/PaymentHistory");

const {
  hashPassword,
  comparePassword,
  genrateJwtToken,
} = require("../utils/helpers");
const {
  createAgentValidations,
  updateAgentValidations,
} = require("../utils/validations");

async function getAllAgents(req, res) {
  try {
    // console.log("GET ALL AGENTS");
    // console.time("Agents");
    const allAgents = (await AgentModel.find({}).lean()) || [];
    // const agentsWithLeadCount = await Promise.all(
    //   allAgents.map(async (agent) => {
    //     const assignedLeads =
    //       (await LeadsModel.find({
    //         agent: agent._id,
    //       }).countDocuments()) || 0;
    //     return { ...agent, assignedLeads };
    //   }),
    // );
    // console.timeEnd("Agents");
    // console.log("AGENTS FEETCHED");

    return res.status(200).json({
      //  agents: agentsWithLeadCount
      agents: allAgents,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function getAgentById(req, res) {
  try {
    const agentId = req.user._id;
    const agent = await AgentModel.findById(agentId);
    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }
    return res.status(200).json({ message: "Agent found", data: agent });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function createAgent(req, res) {
  try {
    const { name, email, phoneNumber, password, emailPassword } = req.body;

    const isAgentExist = await createAgentValidations(req.body);
    console.log(isAgentExist);
    if (isAgentExist.status) {
      const hashedPassword = await hashPassword(password);
      const newAgent = new AgentModel({
        name,
        email,
        phoneNumber,
        password: hashedPassword,
        emailPassword: emailPassword,
      });
      await newAgent.save();
      res.status(201).json({ message: "Agent created successfully" });
    } else {
      throw new Error(isAgentExist.message);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function updateAgent(req, res) {
  try {
    const id = req.params.id;
    const { name, email, phoneNumber, password } = req.body;
    updateAgentValidations(req.body);
    const agent = await AgentModel.findById(id);
    let oldName = agent.name;
    if (!agent) {
      throw new Error("Agent not found");
    }
    if (email) {
      agent.email = email;
    }
    if (phoneNumber) {
      agent.phoneNumber = phoneNumber;
    }
    if (name) {
      agent.name = name;
    }
    if (password && password != "") {
      const isPasswordValid = await comparePassword(password, agent.password);
      console.log("IS PASS VALID", isPasswordValid);
      if (isPasswordValid) {
        agent.password = await hashPassword(req.body.newPassword);
        await agent.save();
        oldName != name && (await updateAgentNameCorrectly(name, oldName));
        res
          .status(200)
          .json({ message: "Agent updated successfullys", agent: agent });
      } else {
        throw new Error("Old password is incorrect");
      }
    } else {
      await agent.save();
      oldName != name && (await updateAgentNameCorrectly(name, oldName));

      res
        .status(200)
        .json({ message: "Agent updated successfully", agent: agent });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function deleteAgent(req, res) {
  try {
    const { id } = req.params;
    await AgentModel.findByIdAndDelete(id);
    res.status(200).json({ message: "Agent deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function loginAgent(req, res) {
  try {
    const { email, password } = req.body;
    if (email && email.includes("@") && email.includes(".")) {
      const agent = await AgentModel.findOne({ email: email });
      if (!agent) {
        return res.status(404).json({ message: "Agent not found" });
      }
      // console.log(agent, password);
      const isPasswordValid = await comparePassword(password, agent.password);
      if (isPasswordValid) {
        const token = genrateJwtToken({ user: agent, isAgent: true });
        return res.status(200).json({
          message: "Agent logged in successfully",
          token: token,
          agent: agent,
        });
      } else {
        return res.status(400).json({ message: "Invalid password" });
      }
    } else {
      res.status(400).json({ message: "Invalid email" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function agentBreak(req, res) {
  try {
    const agentId = req.user._id;
    const agent = await AgentModel.findById(agentId);
    if (agent?.offDuty) {
      return res.status(403).json({
        message: "Please Login to your account to take a break",
      });
    }
    const lastBreak = await AgentsBreak.findOne({
      agentId: agentId,
      type: "Break",
    }).sort({
      createdAt: -1,
    });
    if (lastBreak && lastBreak.status === "Ongoing") {
      lastBreak.endTime = new Date();
      lastBreak.duration = (lastBreak.endTime - lastBreak.startTime) / 1000;
      lastBreak.status = "Ended";
      await lastBreak.save();
      await AgentModel.findByIdAndUpdate(agentId, { onBreak: false });
      return res
        .status(200)
        .json({ message: "Break ended successfully", break: lastBreak });
    }
    const newBreak = new AgentsBreak({ agentId: agentId, type: "Break" });
    await newBreak.save();
    await AgentModel.findByIdAndUpdate(agentId, { onBreak: true });
    return res
      .status(201)
      .json({ message: "Break started successfully", break: newBreak });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function agentOffDuty(req, res) {
  try {
    const agentId = req.user._id;
    const lastLogout = await AgentsBreak.findOne({
      agentId: agentId,
      type: "OffDuty",
    }).sort({
      createdAt: -1,
    });
    if (lastLogout && lastLogout.status === "Ongoing") {
      lastLogout.endTime = new Date();
      lastLogout.duration = (lastLogout.endTime - lastLogout.startTime) / 1000;
      lastLogout.status = "Ended";
      await lastLogout.save();
      await AgentModel.findByIdAndUpdate(agentId, { offDuty: false });
      return res
        .status(200)
        .json({ message: "Login succesfuly", break: lastLogout });
    }
    const newBreak = new AgentsBreak({ agentId: agentId, type: "OffDuty" });
    await newBreak.save();
    await AgentModel.findByIdAndUpdate(agentId, { offDuty: true });
    return res.status(201).json({ message: "Logout", break: newBreak });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function sendEmailController(req, res) {
  try {
    const { email, subject, message } = req.body;
    const agentId = req.user._id;
    const agent = await AgentModel.findById(agentId);

    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }
    await sendEmail(email, subject, message, null, {
      user: agent.email,
      password: agent.emailPassword,
    });
    return res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
}

async function updateAgentNameCorrectly(newName, oldName) {
  try {
    await Quotations.updateMany({ agentName: oldName }, { agentName: newName });
    await PaymentHistory.updateMany(
      { marketingExecutive: oldName },
      { marketingExecutive: newName },
    );
  } catch (error) {
    throw new Error("Error in updating agent Name");
  }
}

module.exports = {
  getAllAgents,
  createAgent,
  updateAgent,
  deleteAgent,
  loginAgent,
  agentBreak,
  getAgentById,
  agentOffDuty,
  sendEmailController,
};
