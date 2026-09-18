const express = require("express");
const Cart = require("../models/Cart");
const Medicine = require("../models/Medicine");
const protect = require("../middleware/authMiddleware");

const router = express.Router();


// =========================
// GET USER CART
// =========================

router.get("/", protect, async (req, res) => {
  try {
    let cart = await Cart.findOne({
      user: req.user.id,
    }).populate("items.medicine");

    if (!cart) {
      cart = await Cart.create({
        user: req.user.id,
        items: [],
      });
    }

    return res.status(200).json({
      cart,
    });
  } catch (error) {
    console.error("Get Cart Error:", error);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);

    return res.status(500).json({
      message: "Server error while fetching cart",
      error: error.message,
    });
  }
});


// =========================
// ADD MEDICINE TO CART
// =========================

router.post("/", protect, async (req, res) => {
  try {
    const { medicineId, quantity } = req.body;

    if (!medicineId) {
      return res.status(400).json({
        message: "Medicine ID is required",
      });
    }

  const requestedQuantity = Number(quantity);

if (
  !Number.isInteger(requestedQuantity) ||
  requestedQuantity < 1
) {
  return res.status(400).json({
    message: "Quantity must be a positive integer",
  });
}

    // Check medicine exists
    const medicine = await Medicine.findById(
      medicineId
    );

    if (!medicine) {
      return res.status(404).json({
        message: "Medicine not found",
      });
    }

    // Check stock
    if (medicine.stock === 0) {
      return res.status(400).json({
        message: "Medicine is out of stock",
      });
    }

    // Find user's cart
    let cart = await Cart.findOne({
      user: req.user.id,
    });

    if (!cart) {
      cart = new Cart({
        user: req.user.id,
        items: [],
      });
    }

    // Check if medicine already exists in cart
    const existingItem = cart.items.find(
      (item) =>
        item.medicine.toString() ===
        medicineId
    );

    if (existingItem) {
      const newQuantity =
        existingItem.quantity +
        requestedQuantity;

      if (newQuantity > medicine.stock) {
        return res.status(400).json({
          message: `Only ${medicine.stock} units available`,
        });
      }

      existingItem.quantity = newQuantity;
    } else {
      if (requestedQuantity > medicine.stock) {
        return res.status(400).json({
          message: `Only ${medicine.stock} units available`,
        });
      }

      cart.items.push({
        medicine: medicineId,
        quantity: requestedQuantity,
      });
    }

    await cart.save();

    await cart.populate("items.medicine");

    return res.status(200).json({
      message: "Medicine added to cart",
      cart,
    });
  } catch (error) {
    console.error("Add Cart Error:", error);

    return res.status(400).json({
      message: "Invalid medicine ID or cart data",
    });
  }
});


// =========================
// UPDATE CART QUANTITY
// =========================

router.put(
  "/:medicineId",
  protect,
  async (req, res) => {
    try {
      const { quantity } = req.body;

      const newQuantity = Number(quantity);

      if (
        !Number.isInteger(newQuantity) ||
        newQuantity < 1
      ) {
        return res.status(400).json({
          message:
            "Quantity must be a positive whole number",
        });
      }

      const medicine = await Medicine.findById(
        req.params.medicineId
      );

      if (!medicine) {
        return res.status(404).json({
          message: "Medicine not found",
        });
      }

      if (newQuantity > medicine.stock) {
        return res.status(400).json({
          message: `Only ${medicine.stock} units available`,
        });
      }

      const cart = await Cart.findOne({
        user: req.user.id,
      });

      if (!cart) {
        return res.status(404).json({
          message: "Cart not found",
        });
      }

      const item = cart.items.find(
        (cartItem) =>
          cartItem.medicine.toString() ===
          req.params.medicineId
      );

      if (!item) {
        return res.status(404).json({
          message: "Medicine is not in your cart",
        });
      }

      item.quantity = newQuantity;

      await cart.save();

      await cart.populate("items.medicine");

      return res.status(200).json({
        message: "Cart quantity updated",
        cart,
      });
    } catch (error) {
      console.error(
        "Update Cart Error:",
        error
      );

      return res.status(400).json({
        message:
          "Invalid medicine ID or quantity",
      });
    }
  }
);


// =========================
// REMOVE MEDICINE FROM CART
// =========================

router.delete(
  "/:medicineId",
  protect,
  async (req, res) => {
    try {
      const cart = await Cart.findOne({
        user: req.user.id,
      });

      if (!cart) {
        return res.status(404).json({
          message: "Cart not found",
        });
      }

      const originalLength =
        cart.items.length;

      cart.items = cart.items.filter(
        (item) =>
          item.medicine.toString() !==
          req.params.medicineId
      );

      if (
        cart.items.length === originalLength
      ) {
        return res.status(404).json({
          message: "Medicine is not in your cart",
        });
      }

      await cart.save();

      await cart.populate("items.medicine");

      return res.status(200).json({
        message:
          "Medicine removed from cart",
        cart,
      });
    } catch (error) {
      console.error(
        "Remove Cart Item Error:",
        error
      );

      return res.status(400).json({
        message: "Invalid medicine ID",
      });
    }
  }
);


// =========================
// CLEAR USER CART
// =========================

router.delete("/", protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({
      user: req.user.id,
    });

    if (!cart) {
      return res.status(200).json({
        message: "Cart is already empty",
        cart: {
          user: req.user.id,
          items: [],
        },
      });
    }

    cart.items = [];

    await cart.save();

    return res.status(200).json({
      message: "Cart cleared successfully",
      cart,
    });
  } catch (error) {
    console.error(
      "Clear Cart Error:",
      error
    );

    return res.status(500).json({
      message: "Server error while clearing cart",
    });
  }
});


module.exports = router;