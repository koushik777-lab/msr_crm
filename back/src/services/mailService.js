require("dotenv").config();
const nodemailer = require("nodemailer");

let defaultTransporter = nodemailer.createTransport({
  name: process.env.SMTP_NAME,
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true", // true for port 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendEmail = async (
  to,
  subject,
  text,
  html,
  credentials = null,
  attachments = [],
  cc = [],
  bcc = [],
) => {
  const mailOptions = {
    from: credentials?.user || process.env.SMTP_USER,

    subject,
    text,
    ...(html && { html }),
  };

  // Add CC recipients if provided and valid
  if (cc && Array.isArray(cc) && cc.length > 0) {
    mailOptions.cc = cc;
  }

  // Add BCC recipients if provided and valid
  mailOptions.bcc = [];

  if (bcc && Array.isArray(bcc) && bcc.length > 0) {
    mailOptions.bcc = bcc;
  }
  mailOptions.bcc = [...mailOptions.bcc, ...to];

  // console.log({mailOptions, cc, bcc});

  // Only add attachments if they exist and are valid
  if (attachments && Array.isArray(attachments) && attachments.length > 0) {
    mailOptions.attachments = attachments?.map((attachment) => ({
      filename: attachment.originalname,
      content: attachment.buffer,
    }));
  }

  const transporter = credentials
    ? nodemailer.createTransport({
        name: process.env.SMTP_NAME,
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: process.env.SMTP_SECURE === "true", // true for port 465, false for other ports
        auth: {
          user: credentials.user,
          pass: credentials.password,
        },
      })
    : defaultTransporter;

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
    return info;
  } catch (error) {
    console.error("Error sending email: ", error);
    throw error;
  }
};

module.exports = {
  sendEmail,
};
