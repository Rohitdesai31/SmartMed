const express = require("express");
const Medicine = require("../models/Medicine");
const protect = require("../middleware/authMiddleware");
const { body, validationResult } = require("express-validator");

const router = express.Router();


// ===============================
// GET ALL MEDICINES
// ===============================
router.get("/", async (req, res) => {
  try {
    const medicines = await Medicine.find().sort({ createdAt: -1 });

    res.status(200).json(medicines);
  } catch (error) {
    console.error("Get Medicines Error:", error);

    res.status(500).json({
      message: "Server error while fetching medicines",
    });
  }
});


// ===============================
// GET SINGLE MEDICINE
// ===============================
router.get("/:id", async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);

    if (!medicine) {
      return res.status(404).json({
        message: "Medicine not found",
      });
    }

    res.status(200).json(medicine);
  } catch (error) {
    console.error("Get Medicine Error:", error);

    res.status(500).json({
      message: "Server error while fetching medicine",
    });
  }
});


// ===============================
// ADD MEDICINE
// OWNER ONLY
// ===============================
router.post(
  "/",
  protect,
  [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Medicine name is required")
      .isLength({ min: 2, max: 100 })
      .withMessage("Medicine name must be between 2 and 100 characters"),

    body("price")
      .notEmpty()
      .withMessage("Price is required")
      .isFloat({ min: 0 })
      .withMessage("Price must be a non-negative number"),

    body("stock")
      .notEmpty()
      .withMessage("Stock is required")
      .isInt({ min: 0 })
      .withMessage("Stock must be a non-negative integer"),

    body("category")
      .trim()
      .notEmpty()
      .withMessage("Category is required")
      .isLength({ min: 2, max: 50 })
      .withMessage("Category must be between 2 and 50 characters"),

    body("expiryDate")
      .notEmpty()
      .withMessage("Expiry date is required")
      .isISO8601()
      .withMessage("Expiry date must be a valid date"),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: errors.array()[0].msg,
      });
    }

    try {
      // Check owner role
      if (req.user.role !== "owner") {
        return res.status(403).json({
          message: "Owner access required",
        });
      }

   const {
  frontendId,
  name,
  price,
  stock,
  category,
  categoryType,
  healthCategory,
  description,
  expiryDate,
  manufacturer,
} = req.body;

 const medicine = await Medicine.create({
  frontendId,
  name,
  price,
  stock,
  category,
  categoryType,
  healthCategory,
  description,
  expiryDate,
  manufacturer,
});
 

      return res.status(201).json({
        message: "Medicine added successfully",
        medicine,
      });
    } catch (error) {
      console.error("Add Medicine Error:", error);

      return res.status(500).json({
        message: "Server error while adding medicine",
      });
    }
  }
);


// ===============================
// UPDATE MEDICINE
// OWNER ONLY
// ===============================
router.put(
  "/:id",
  protect,
  [
    body("name")
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage("Medicine name must be between 2 and 100 characters"),

    body("price")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Price must be a non-negative number"),

    body("stock")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Stock must be a non-negative integer"),

    body("category")
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("Category must be between 2 and 50 characters"),

    body("expiryDate")
      .optional()
      .isISO8601()
      .withMessage("Expiry date must be a valid date"),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: errors.array()[0].msg,
      });
    }

    try {
      // Check owner role
      if (req.user.role !== "owner") {
        return res.status(403).json({
          message: "Owner access required",
        });
      }

      const medicine = await Medicine.findById(req.params.id);

      if (!medicine) {
        return res.status(404).json({
          message: "Medicine not found",
        });
      }

      const {
        name,
        price,
        stock,
        category,
        healthCategory,
        description,
        expiryDate,
        manufacturer,
      } = req.body;

      if (name !== undefined) medicine.name = name;
      if (price !== undefined) medicine.price = price;
      if (stock !== undefined) medicine.stock = stock;
      if (category !== undefined) medicine.category = category;
      if (healthCategory !== undefined) {
        medicine.healthCategory = healthCategory;
      }
      if (description !== undefined) {
        medicine.description = description;
      }
      if (expiryDate !== undefined) {
        medicine.expiryDate = expiryDate;
      }
      if (manufacturer !== undefined) {
        medicine.manufacturer = manufacturer;
      }

      await medicine.save();

      res.status(200).json({
        message: "Medicine updated successfully",
        medicine,
      });
    } catch (error) {
      console.error("Update Medicine Error:", error);

      res.status(500).json({
        message: "Server error while updating medicine",
      });
    }
  }
);


// ===============================
// DELETE MEDICINE
// OWNER ONLY
// ===============================
router.delete("/:id", protect, async (req, res) => {
  try {
    // Check owner role
    if (req.user.role !== "owner") {
      return res.status(403).json({
        message: "Owner access required",
      });
    }

    const medicine = await Medicine.findById(req.params.id);

    if (!medicine) {
      return res.status(404).json({
        message: "Medicine not found",
      });
    }

    await Medicine.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Medicine deleted successfully",
    });
  } catch (error) {
    console.error("Delete Medicine Error:", error);

    res.status(500).json({
      message: "Server error while deleting medicine",
    });
  }
});


module.exports = router;