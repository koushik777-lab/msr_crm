const AdminModel = require("../models/Admin");
const AgentModel = require("../models/Agents");
const {
  hashPassword,
  comparePassword,
  genrateJwtToken,
} = require("../utils/helpers");
const { signUpvalidations } = require("../utils/validations");

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await AdminModel.findOne({ email });

    if (user) {
      const isPasswordCorrect = await comparePassword(password, user.password);
      if (isPasswordCorrect) {
        const token = await genrateJwtToken({ user });

        res
          .status(200)
          .json({ message: "Login successful", user: user, token: token });
      }
    } else res.status(400).json({ message: "Invalid credentials" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
}

async function signup(req, res) {
  try {
    const { email, password } = req.body;

    const isUserExist = await signUpvalidations(email);
    console.log(isUserExist);
    if (isUserExist) {
      return res.status(400).json({ message: "User already exists" });
    }
    const hashedPassword = await hashPassword(password);

    const newUser = new AdminModel({ email, password: hashedPassword });
    const savedUser = await newUser.save();
    const token = await genrateJwtToken(savedUser);

    res.status(201).json({
      message: "User created successfully",
      user: savedUser,
      token: token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function adminAndAgentLogin(req, res) {
  try {
    const { email, password } = req.body;
    console.time("findUser");
    let user = await AdminModel.findOne({ email }).lean();
    console.timeEnd("findUser");

    if (user) {
      // admin auth
      console.time("passCompare");

      const isPasswordCorrect = await comparePassword(password, user.password);
      console.log(user, isPasswordCorrect);
      console.timeEnd("passCompare");

      if (isPasswordCorrect) {
        console.time("genToken");

        const token = genrateJwtToken({ user });
        console.timeEnd("genToken");

        return res.status(200).json({
          message: "Login successful",
          user: { ...user, type: "admin" },
          token: token,
        });
      }
      return res.status(400).json({ message: "Invalid password" });
    } else {
      // agent auth
      user = await AgentModel.findOne({ email }).lean();
      if (user) {
        const isPasswordCorrect = await comparePassword(
          password,
          user.password,
        );
        if (isPasswordCorrect) {
          const token = genrateJwtToken({ user, isAgent: true });
          return res.status(200).json({
            message: "Login successful",
            user: { ...user, type: "agent" },
            token: token,
          });
        } else {
          return res.status(400).json({ message: "Invalid password" });
        }
      } else {
        return res.status(404).json({ message: "User not found" });
      }
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: error.message });
  }
}

const changePassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    // console.log(req.body);
    if (!email || !newPassword) {
      return res
        .status(400)
        .json({ message: "Please provide necessary fields" });
    }
    const admin = await AdminModel.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: "User not found" });
    }
    // console.log("Admin ", admin)
    // const isPasswordCorrect = await comparePassword(
    //   oldPassword,
    //   admin.password
    // );
    // if (!isPasswordCorrect) {
    //   return res.status(400).json({ message: "Invalid Old password" });
    // }
    // console.log("Passwrod Matched");
    const hashedPassword = await hashPassword(newPassword);
    // console.log("NEW PASSWROD", hashedPassword);

    const updatedAdmin = await AdminModel.findByIdAndUpdate(
      admin._id,
      { password: hashedPassword },
      { new: true },
    );
    if (!updatedAdmin) {
      return res.status(500).json({ message: "Internal server error" });
    }
    return res.status(200).json({ message: "Password Updated successfully" });
  } catch (error) {}
};

const getAllAdmins = async (req, res) => {
  try {
    if (req?.isAgent) {
      return res.status(403).json({ message: "Forbidden" });
    }
    const admins = await AdminModel.find().lean();
    if (!admins) {
      return res.status(404).json({ message: "No admins found" });
    }
    return res
      .status(200)
      .json({ message: "Admins fetched successfully", admins });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  login,
  signup,
  adminAndAgentLogin,
  changePassword,
  getAllAdmins,
};
