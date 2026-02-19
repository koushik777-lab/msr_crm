const mongoose = require("mongoose");
const dotenv = require("dotenv");
const AdminModel = require("./src/models/Admin");
const { hashPassword } = require("./src/utils/helpers");

dotenv.config();

const connectToDb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");
        checkAdmin();
    } catch (error) {
        console.error("DB Connection Error:", error);
    }
};

const checkAdmin = async () => {
    try {
        const admins = await AdminModel.find();
        if (admins.length > 0) {
            console.log("Existing Admins found:");
            admins.forEach(admin => {
                console.log(`Email: ${admin.email}`);
                // We cannot retrieve the password, but we can tell the user the email.
            });
            console.log("\nIf you don't know the password, I can reset it for you.");
        } else {
            console.log("No admin found. Creating default admin...");
            const email = "admin@gmail.com";
            const password = "admin";
            const hashedPassword = await hashPassword(password);

            const newAdmin = new AdminModel({
                email,
                password: hashedPassword
            });

            await newAdmin.save();
            console.log(`\nAdmin Created Successfully!`);
            console.log(`Email: ${email}`);
            console.log(`Password: ${password}`);
        }
    } catch (error) {
        console.error("Error checking admin:", error);
    } finally {
        mongoose.disconnect();
    }
};

connectToDb();
