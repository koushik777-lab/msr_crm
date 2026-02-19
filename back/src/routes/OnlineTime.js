const express = require("express");
const { AdminAuthMiddleware } = require("../utils/middlewares");
const OnlineTime = require("../models/OnlineTime");
const AgentModel = require("../models/Agents");
const AdminModel = require("../models/Admin");
const router = express.Router();

router.post("/online-time", AdminAuthMiddleware, async (req, res) => {
  try {
    const { type, loginTime, logoutTime, userId, isAgent, status } = req.body;
    let isFound = true;

    if (isAgent) {
      const agent = await AgentModel.findById(userId);
      if (!agent) {
        isFound = false;
      }
    } else {
      const Admin = await AdminModel.findById(userId);
      if (!Admin) {
        isFound = false;
      }
    }
    if (!isFound) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const isEntryExist = await OnlineTime.findOne({
      createdAt: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lte: new Date(new Date().setHours(23, 59, 59, 999)),
      },
      userId,
      isAgent,
    }).lean();

    console.log("isEntryExist", isEntryExist, userId);
    if (type == "login") {
      if (isEntryExist) {
        return res.status(400).json({
          message: "User already logged in today",
        });
      } else {
        await OnlineTime.create({
          loginTime: loginTime || new Date(),
          userId,
          isAgent,
          //   status: status
        });
        return res.status(200).json({
          message: "User logged in successfully",
        });
      }
    } else {
      if (!isEntryExist) {
        return res.status(400).json({
          message: "User not logged in today",
        });
      }
      await OnlineTime.findByIdAndUpdate(isEntryExist._id, {
        logoutTime: logoutTime || new Date(),
        status: status,
      });
      return res.status(200).json({
        message: "User logged out successfully",
      });
    }
  } catch (error) {
    console.error("Error in online time route:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
      //   error: error.message,
    });
  }
});

router.get("/online-time", AdminAuthMiddleware, async (req, res) => {
  try {
    const { date } = req.query;
    console.log("date", date);
    const onlineTimes = await OnlineTime.find({
      createdAt: {
        $gte: new Date(new Date(date).setHours(0, 0, 0, 0)),
        $lte: new Date(new Date(date).setHours(23, 59, 59, 999)),
      },
      ...(req?.isAgent && { userId: req.user._id }),
    }).lean();

    let finalData = await Promise.all(
      onlineTimes.map(async (item) => {
        if (item?.isAgent) {
          const agent = await AgentModel.findById(item.userId).lean();
          return {
            ...item,
            userName: agent?.name || "Unknown Agent",
            // userEmail: agent?.email || "Unknown Email",
          };
        } else {
          const admin = await AdminModel.findById(item.userId).lean();
          return {
            ...item,
            userName: admin?.email?.includes("admin")
              ? "admin"
              : admin?.email?.includes("sales")
                ? "Sales Manager"
                : "Backend",
            // userEmail: admin?.email || "Unknown Email",
          };
        }
      }),
    );
    return res.status(200).json({
      message: "Online times fetched successfully",
      onlineTimes: finalData,
    });
  } catch (error) {
    console.error("Error fetching online times:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
