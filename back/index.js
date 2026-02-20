const cron = require("node-cron");
const path = require("path");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const { connectToDb, getRandomResponse } = require("./src/utils/helpers");
const authRouter = require("./src/routes/adminAuth");
const agentAuth = require("./src/routes/agentAuth");
const agentRouter = require("./src/routes/agents");
const leadRouter = require("./src/routes/leads");
const LogRouter = require("./src/routes/logs");
const DashboardRouter = require("./src/routes/dashboard");
const EmailMarketingRouter = require("./src/routes/email");
const QuotationNumberRouter = require("./src/routes/quotations");
const PaymentLinkRouter = require("./src/routes/paymentLink");
const RenewalRouter = require("./src/routes/renewal");
const WhatsappRouter = require("./src/routes/whatsappMarketing");
const paymentHistoryRouter = require("./src/routes/paymentHistory");
const onlineTimeRouter = require("./src/routes/OnlineTime");
const { AuthMiddleware } = require("./src/utils/middlewares");
const {
  syncLeads,
  deleteOldCallLogs,
  syncPaymentLinkStatus,
  autoLogout,
  autoLogoutWebsite,
} = require("./src/utils/jobs");

const app = express();
app.use(
  cors({
    origin: "*",
  }),
);
app.use(express.json({ limit: "100mb" }));
dotenv.config();
// test

// Request timing middleware
app.use((req, res, next) => {
  const requestId = Math.random().toString(36).substring(2, 10);
  const startTime = process.hrtime();
  const path = req.originalUrl || req.url;

  // Add request ID to the response headers
  res.setHeader("X-Request-ID", requestId);

  // Log request start
  console.log(`[${requestId}] Request started: ${req.method} ${path}`);

  // Track response completion
  res.on("finish", () => {
    const [seconds, nanoseconds] = process.hrtime(startTime);
    const duration = seconds * 1000 + nanoseconds / 1000000; // Convert to milliseconds
    console.log(
      `[${requestId}] Request completed: ${req.method} ${path} - ${res.statusCode} (${duration.toFixed(2)}ms)`,
    );
  });

  next();
});

// Custom Morgan token for IP address
morgan.token("remote-addr", (req) => {
  const forwarded = req.headers["x-forwarded-for"];
  const remoteAddress = req.socket.remoteAddress;
  return Array.isArray(forwarded) ? forwarded[0] : forwarded || remoteAddress;
});

// Custom Morgan format to include IP address, time, and colors without using chalk
const colorize = (status) => {
  if (status >= 500) return "\x1b[31m"; // red
  if (status >= 400) return "\x1b[33m"; // yellow
  if (status >= 300) return "\x1b[36m"; // cyan
  if (status >= 200) return "\x1b[32m"; // green
  return "\x1b[0m"; // reset
};

app.use(
  morgan((tokens, req, res) => {
    const status = tokens.status(req, res);
    const color = colorize(parseInt(status || "0", 10));
    const contentLength = tokens.res(req, res, "content-length") || "0";

    // Format date in IST
    const istDate = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour12: true,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    return [
      `\x1b[34m${tokens["remote-addr"](req, res)}\x1b[0m`, // blue
      `\x1b[32m${tokens.method(req, res)}\x1b[0m`, // green
      `\x1b[33m${tokens.url(req, res)}\x1b[0m`, // yellow
      `${color}${status}\x1b[0m`, // status with color
      `\x1b[35m${contentLength}\x1b[0m`, // magenta
      "-",
      `\x1b[36m${tokens["response-time"](req, res)} ms\x1b[0m`, // cyan
      `\x1b[37m${istDate}\x1b[0m`, // white time in IST
    ].join(" ");
  }),
);

const PORT = process.env.PORT || 5000;

app.use("/api", authRouter);
app.use("/api", agentAuth);
app.use("/api", agentRouter);
app.use("/api", leadRouter);
app.use("/api", LogRouter);
app.use("/api", DashboardRouter);
app.use("/api", PaymentLinkRouter);
app.use("/api", EmailMarketingRouter);
app.use("/api", QuotationNumberRouter);
app.use("/api", RenewalRouter);
app.use("/api", WhatsappRouter);
app.use("/api", paymentHistoryRouter);
app.use("/api", onlineTimeRouter);

// app.get("/", (req, res) => {
//   // syncLeads();
//   res.send(getRandomResponse());
// });

app.use(express.static(path.join(__dirname, "public")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

if (process.env.NODE_ENV === "production") {
  const cronJobs = [
    {
      schedule: "35 14 * * *",
      task: syncLeads,
      name: "Sync Leads",
    },
    {
      schedule: "* 19 * * *",
      task: syncPaymentLinkStatus,
      name: "Sync Payment Link Status",
    },
    {
      schedule: "0 0 * * *",
      task: deleteOldCallLogs,
      name: "Delete Old Call Logs",
    },
    {
      schedule: "0 19 * * *",
      task: autoLogoutWebsite,
      name: "Auto Logout",
    },
  ];

  cronJobs.forEach((job) => {
    cron.schedule(
      job.schedule,
      () => {
        console.log(`Running scheduled job: ${job.name}`);
        job.task();
      },
      {
        scheduled: true,
        timezone: "Asia/Kolkata",
      },
    );
  });
  console.log("Jobs scheduled");
}

const PORT = process.env.PORT || 5001;

connectToDb()
  .then(() => {
    console.log("Connected to database");
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((e) => console.log(e));
