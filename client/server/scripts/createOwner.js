const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("../models/User");

const createOwner = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    const email = "owner@smartmed.com";
    const password = "Owner@123";

    // Check if account already exists
    const existingUser = await User.findOne({
      email,
    });

    if (existingUser) {
      if (existingUser.role === "owner") {
        console.log("Owner account already exists.");
      } else {
        console.log(
          "This email already belongs to a normal user. Owner account was not created."
        );
      }

      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create owner
    const owner = await User.create({
      name: "SmartMed Owner",
      email,
      password: hashedPassword,
      role: "owner",
    });

    console.log("Owner account created successfully!");
    console.log("--------------------------------");
    console.log("Email:", owner.email);
    console.log("Password:", password);
    console.log("Role:", owner.role);
    console.log("--------------------------------");
  } catch (error) {
    console.error("Owner creation error:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB connection closed");
  }
};

createOwner();