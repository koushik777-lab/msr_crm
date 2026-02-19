const Leads = require("../models/Leads");
const AgentModel = require("../models/Agents");
const { sendEmail } = require("../services/mailService");

async function startMarketingEmails(req, res) {
  try {
    const { leads, subject, html, to, cc, bcc } = req.body;

    console.log({ leads, subject, html, to, cc, bcc });
    let CC = cc[0].split(",");
    let BCC = bcc[0].split(",");
    // console.log(req.body, CC);
    if (!subject) {
      return res.status(400).json({ message: "Email subject is required" });
    }

    if (!html) {
      return res
        .status(400)
        .json({ message: "Email content (html) is required" });
    }

    const userId = req.user._id;
    let agent = null;
    let leadsEmail = [];

    if (req.isAgent) {
      agent = await AgentModel.findById(userId);

      if (!agent) {
        return res.status(404).json({ message: "Agent not found" });
      }

      leadsEmail =
        (await Leads.find({ _id: { $in: leads }, agent: agent._id }).select(
          "email",
        )) || [];
    } else {
      leadsEmail = await Leads.find({ _id: { $in: leads } }).select("email");
    }

    // Validate emails
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    let validEmails = [];
    validEmails = leadsEmail
      .filter((lead) => lead.email && emailRegex.test(lead.email))
      .map((lead) => lead.email);

    emailRegex.test(to) && validEmails.push(to);

    // Validate CC and BCC emails
    let validCC = [];
    let validBCC = [];
    CC.forEach((email) => {
      if (email.trim() && emailRegex.test(email.trim())) {
        validCC.push(email.trim());
      }
    });

    BCC.forEach((email) => {
      if (email.trim() && emailRegex.test(email.trim())) {
        validBCC.push(email.trim());
      }
    });
    // console.log({CC, BCC, validBCC, validCC, validEmails})

    if (
      validEmails.length === 0 &&
      validCC.length === 0 &&
      validBCC.length === 0
    ) {
      return res
        .status(400)
        .json({ message: "No valid email addresses found" });
    }

    const senderEmail = req.isAgent ? agent.email : process.env.ADMIN_MAIL;
    const recipients = [...validEmails];

    if (req.isAgent && agent.email) {
      recipients.push(agent.email);
    } else if (!req.isAgent) {
      recipients.push(process.env.ADMIN_MAIL);
    }

    await sendEmail(
      recipients,
      subject,
      null,
      html,
      {
        user: senderEmail,
        password: req.isAgent
          ? agent.emailPassword
          : process.env.ADMIN_MAIL_PASS,
      },
      req.files,
      validCC,
      validBCC,
    );

    res.status(200).json({
      message: "Marketing emails sent successfully",
      count: validEmails.length,
      ccCount: validCC.length,
      bccCount: validBCC.length,
    });
  } catch (error) {
    console.error("Error sending marketing emails:", error);
    res.status(500).json({
      message: "Failed to send marketing emails",
      error: error.message,
    });
  }
}

module.exports = {
  startMarketingEmails,
};
