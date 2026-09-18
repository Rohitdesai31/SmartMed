const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const protect = require("../middleware/authMiddleware");
const { body, validationResult } = require("express-validator");
const rateLimit = require("express-rate-limit");
const crypto = require("crypto");

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many authentication attempts. Please try again later.",
  },
});


// =========================
// PASSWORD RESET OTP STORAGE
// =========================

const passwordResetOtps = new Map();

const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

// =========================
// REGISTER USER
// =========================

router.post(
  "/register",
  authLimiter,
  [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Name is required")
      .isLength({ min: 2, max: 50 })
      .withMessage("Name must be between 2 and 50 characters"),

    body("email")
      .trim()
      .normalizeEmail()
      .isEmail()
      .withMessage("Please enter a valid email address"),

    body("password")
      .isString()
      .withMessage("Password must be a string")
      .isLength({ min: 6, max: 100 })
      .withMessage("Password must be between 6 and 100 characters"),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: errors.array()[0].msg,
      });
    }
    try {
      const { name, email, password } = req.body;

      // Check required fields
      if (!name || !email || !password) {
        return res.status(400).json({
          message: "Name, email and password are required",
        });
      }

      // Check password length
      if (password.length < 6) {
        return res.status(400).json({
          message: "Password must be at least 6 characters",
        });
      }

      // Normalize email
      const normalizedEmail = email.trim().toLowerCase();

      // Check if email already exists
      const existingUser = await User.findOne({
        email: normalizedEmail,
      });

      if (existingUser) {
        return res.status(409).json({
          message: "An account with this email already exists",
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: "user",
      });

      return res.status(201).json({
        message: "Account created successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Registration Error:", error);

      return res.status(500).json({
        message: "Server error while creating account",
      });
    }
  },
);

// =========================
// LOGIN USER
// =========================

router.post(
  "/login",
  [
    body("email")
      .trim()
      .normalizeEmail()
      .isEmail()
      .withMessage("Please enter a valid email address"),

    body("password")
      .notEmpty()
      .withMessage("Password is required")
      .isString()
      .withMessage("Password must be a string"),
  ],
  authLimiter,
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: errors.array()[0].msg,
      });
    }

    // YOUR EXISTING LOGIN CODE CONTINUES HERE
    try {
      const { email, password } = req.body;

      // Check required fields
      if (!email || !password) {
        return res.status(400).json({
          message: "Email and password are required",
        });
      }

      // Normalize email
      const normalizedEmail = email.trim().toLowerCase();

      // Find user
      const user = await User.findOne({
        email: normalizedEmail,
      });

      // Do not reveal whether email exists
      if (!user) {
        return res.status(401).json({
          message: "Invalid email or password",
        });
      }

      // Compare password with hashed password
      const isPasswordCorrect = await bcrypt.compare(password, user.password);

      if (!isPasswordCorrect) {
        return res.status(401).json({
          message: "Invalid email or password",
        });
      }

      // Generate JWT
      const token = jwt.sign(
        {
          id: user._id,
          role: user.role,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "1d",
        },
      );

      return res.status(200).json({
        message: "Login successful",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Login Error:", error);

      return res.status(500).json({
        message: "Server error while logging in",
      });
    }
  },
);

router.get("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      message: "Protected profile accessed successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Profile Error:", error);

    return res.status(500).json({
      message: "Server error while fetching profile",
    });
  }
});



// =========================
// FORGOT PASSWORD - SEND OTP
// =========================

router.post(
  "/forgot-password",
  authLimiter,
  [
    body("email")
      .trim()
      .normalizeEmail()
      .isEmail()
      .withMessage("Please enter a valid email address"),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: errors.array()[0].msg,
      });
    }

    try {
      const normalizedEmail = req.body.email.trim().toLowerCase();

      const user = await User.findOne({
        email: normalizedEmail,
      });

      // Do not reveal whether the email exists
      if (!user) {
        return res.status(200).json({
          message:
            "If an account exists with this email, a password reset OTP has been generated.",
        });
      }

      // Generate secure 6-digit OTP
      const otp = crypto.randomInt(100000, 1000000).toString();

      passwordResetOtps.set(normalizedEmail, {
        otp,
        expiresAt: Date.now() + OTP_EXPIRY_MS,
        attempts: 0,
      });

      console.log(
        `Password reset OTP generated for ${normalizedEmail}: ${otp}`,
      );

      return res.status(200).json({
        message: "Password reset OTP generated successfully.",
        otp,
        expiresIn: 600,
      });
    } catch (error) {
      console.error("Forgot Password Error:", error);

      return res.status(500).json({
        message: "Server error while generating password reset OTP",
      });
    }
  },
);

// =========================
// RESET PASSWORD
// =========================

router.post(
  "/reset-password",
  authLimiter,
  [
    body("email")
      .trim()
      .normalizeEmail()
      .isEmail()
      .withMessage("Please enter a valid email address"),

    body("otp")
      .trim()
      .isLength({ min: 6, max: 6 })
      .withMessage("OTP must be 6 digits")
      .isNumeric()
      .withMessage("OTP must contain only numbers"),

    body("newPassword")
      .isString()
      .isLength({ min: 6, max: 100 })
      .withMessage("Password must be between 6 and 100 characters"),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: errors.array()[0].msg,
      });
    }

    try {
      const normalizedEmail = req.body.email.trim().toLowerCase();
      const otp = req.body.otp.trim();
      const newPassword = req.body.newPassword;

      const resetData = passwordResetOtps.get(normalizedEmail);

      if (!resetData) {
        return res.status(400).json({
          message: "OTP not found or already used. Please request a new OTP.",
        });
      }

      // Check OTP expiry
      if (Date.now() > resetData.expiresAt) {
        passwordResetOtps.delete(normalizedEmail);

        return res.status(400).json({
          message: "OTP has expired. Please request a new OTP.",
        });
      }

      // Check OTP
      if (resetData.otp !== otp) {
        resetData.attempts += 1;

        if (resetData.attempts >= 5) {
          passwordResetOtps.delete(normalizedEmail);

          return res.status(429).json({
            message:
              "Too many incorrect OTP attempts. Please request a new OTP.",
          });
        }

        return res.status(400).json({
          message: "Invalid OTP.",
        });
      }

      // Find account
      const user = await User.findOne({
        email: normalizedEmail,
      });

      if (!user) {
        passwordResetOtps.delete(normalizedEmail);

        return res.status(400).json({
          message: "Unable to reset password.",
        });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      user.password = hashedPassword;

      await user.save();

      // OTP can only be used once
      passwordResetOtps.delete(normalizedEmail);

      return res.status(200).json({
        message: "Password reset successfully. You can now login.",
      });
    } catch (error) {
      console.error("Reset Password Error:", error);

      return res.status(500).json({
        message: "Server error while resetting password",
      });
    }
  },
);

// =========================
// GET ALL REGISTERED USERS - OWNER ONLY
// =========================

router.get("/users", protect, async (req, res) => {
  try {
    // Only owner can access customer management
    if (req.user.role !== "owner") {
      return res.status(403).json({
        message: "Owner access required",
      });
    }

    const users = await User.find({ role: "user" })
      .select("-password")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Users fetched successfully",
      users,
    });
  } catch (error) {
    console.error("Get All Users Error:", error);

    return res.status(500).json({
      message: "Server error while fetching users",
    });
  }
});

// =========================
// FORGOT LOGIN EMAIL
// =========================

router.post(
  "/forgot-email",
  authLimiter,
  [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Name is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: errors.array()[0].msg,
      });
    }

    try {
      const normalizedName = req.body.name.trim();

      const user = await User.findOne({
        name: {
          $regex: new RegExp(
            `^${normalizedName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
            "i",
          ),
        },
        role: "owner",
      }).select("name email");

      if (!user) {
        return res.status(404).json({
          message: "No owner account was found with that name.",
        });
      }

      return res.status(200).json({
        message: "Owner account found.",
        email: user.email,
      });
    } catch (error) {
      console.error("Forgot Login Email Error:", error);

      return res.status(500).json({
        message: "Server error while recovering login email.",
      });
    }
  },
); 

module.exports = router;
