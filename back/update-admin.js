const mongoose = require("mongoose");
const dotenv = require("dotenv");
const AdminModel = require("./src/models/Admin");
const { hashPassword } = require("./src/utils/helpers");

dotenv.config();

const connectToDb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");
        updateAdmin();
    } catch (error) {
        console.error("DB Connection Error:", error);
    }
};

const updateAdmin = async () => {
    try {
        // Delete old admin
        const oldEmail = "admin@gmail.com";
        const deleteResult = await AdminModel.deleteOne({ email: oldEmail });
        if (deleteResult.deletedCount > 0) {
            console.log(`Deleted user: ${oldEmail}`);
        } else {
            console.log(`User ${oldEmail} not found (might have been deleted already).`);
        }

        // Create new admin
        const newEmail = "koushik@gmail.com";
        const newPassword = "Koushik@741";

        // Check if new admin already exists to prevent duplicates
        const existingNewAdmin = await AdminModel.findOne({ email: newEmail });
        if (existingNewAdmin) {
            console.log(`User ${newEmail} already exists. Updating password...`);
            const hashedPassword = await hashPassword(newPassword);
            existingNewAdmin.password = hashedPassword;
            await existingNewAdmin.save();
            console.log("Password updated successfully.");
        } else {
            const hashedPassword = await hashPassword(newPassword);
            const newAdmin = new AdminModel({
                email: newEmail,
                password: hashedPassword
            });
            await newAdmin.save();
            console.log(`Created new user: ${newEmail}`);
        }

    } catch (error) {
        console.error("Error updating admin:", error);
    } finally {
        mongoose.disconnect();
    }
};

connectToDb();
