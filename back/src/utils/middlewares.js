const AdminModel = require("../models/Admin");
const { validateJwtToken } = require("./helpers");


const AdminAuthMiddleware = async (req, res, next) => {
  try {
    let authHeader = req.headers.authorization;

    if (!authHeader) {
      console.log("No authorization header provided");
      return res.status(401).json({ message: "Unauthorized Request: No token provided" });
    }

    if (!authHeader.startsWith("Bearer ")) {
      console.log("Invalid authorization header format");
      return res.status(401).json({ message: "Unauthorized Request: Invalid token format" });
    }

    const token = authHeader.split(" ")[1];

    if (!token || token === "null" || token === "undefined") {
      console.log("Missing or literal 'null'/'undefined' token received");
      return res.status(401).json({ message: "Unauthorized Request: Token is empty or invalid" });
    }

    if (!process.env.JWT_SECRET) {
      console.error("CRITICAL: JWT_SECRET is not defined in environment variables");
      return res.status(500).json({ message: "Server configuration error" });
    }

    const decoded = await validateJwtToken(token);
    req.user = decoded.user;
    req.isAgent = decoded.isAgent;
    next();
  } catch (error) {
    console.log("JWT Validation Error:", error.message);
    return res.status(401).json({ message: "Unauthorized Request: " + error.message });
  }
};



module.exports={AdminAuthMiddleware};