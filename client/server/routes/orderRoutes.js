const express = require("express");
const router = express.Router();

const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Medicine = require("../models/Medicine");
const protect = require("../middleware/authMiddleware");

// CREATE ORDER
router.post("/", protect, async (req, res) => {
  const session = await Order.startSession();

  try {
    // Start MongoDB transaction
    session.startTransaction();

    const { name, mobile, email, address, paymentMethod } = req.body;

    // Validate customer details
    if (!name || !mobile || !email || !address) {
      await session.abortTransaction();

      return res.status(400).json({
        message: "All customer details are required",
      });
    }

    // Validate payment method
    if (
      paymentMethod !== "Cash on Delivery" &&
      paymentMethod !== "Online Payment"
    ) {
      await session.abortTransaction();

      return res.status(400).json({
        message: "Invalid payment method",
      });
    }

    // Find user's cart inside transaction
    const cart = await Cart.findOne({
      user: req.user.id,
    })
      .populate("items.medicine")
      .session(session);

    if (!cart || cart.items.length === 0) {
      await session.abortTransaction();

      return res.status(400).json({
        message: "Cart is empty",
      });
    }

    // Check stock and prepare order items
    const orderItems = [];
    let subtotal = 0;

    for (const item of cart.items) {
      const medicine = item.medicine;

      if (!medicine) {
        await session.abortTransaction();

        return res.status(400).json({
          message: "A medicine in your cart no longer exists",
        });
      }

      if (medicine.stock < item.quantity) {
        await session.abortTransaction();

        return res.status(400).json({
          message: `Only ${medicine.stock} units of ${medicine.name} are available`,
        });
      }

      const itemTotal = medicine.price * item.quantity;

      orderItems.push({
        medicine: medicine._id,
        name: medicine.name,
        price: medicine.price,
        quantity: item.quantity,
        total: itemTotal,
      });

      subtotal += itemTotal;
    }

    // Delivery charge
    const deliveryCharge = subtotal > 0 ? 40 : 0;

    // Final total
    const total = subtotal + deliveryCharge;

    // Generate order ID
    const orderId = `SM${Date.now()}`;

    // Create order inside transaction
    const createdOrders = await Order.create(
      [
        {
          orderId,
          user: req.user.id,
          items: orderItems,
          customer: {
            name,
            mobile,
            email,
            address,
          },
          subtotal,
          deliveryCharge,
          total,
          paymentMethod,
          status: "placed",
          trackingStep: 0,
        },
      ],
      {
        session,
      },
    );

    const order = createdOrders[0];

    // Reduce medicine stock inside transaction

    for (const item of cart.items) {
      const updatedMedicine = await Medicine.findOneAndUpdate(
        {
          _id: item.medicine._id,
          stock: { $gte: item.quantity },
        },
        [
          {
            $set: {
              stock: {
                $subtract: ["$stock", item.quantity],
              },
            },
          },
          {
            $set: {
              status: {
                $cond: [
                  { $eq: ["$stock", 0] },
                  "Out of Stock",
                  {
                    $cond: [{ $lte: ["$stock", 10] }, "Low Stock", "Available"],
                  },
                ],
              },
            },
          },
        ],
        {
  new: true,
  session,
  updatePipeline: true,
},
      );

      if (!updatedMedicine) {
        throw new Error(
          `Only enough stock is not available for ${item.medicine.name}`,
        );
      }
    }

    // Clear user's cart inside transaction
    cart.items = [];

    await cart.save({
      session,
    });

    // Commit everything together
    await session.commitTransaction();

    // Return order
    res.status(201).json({
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    // Rollback everything if any operation fails
    await session.abortTransaction();

    console.error("Create Order Transaction Error:", error);

    // Return stock-related errors as normal client errors
    if (
      error.message &&
      error.message.startsWith("Only enough stock is not available")
    ) {
      return res.status(400).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: "Server error while creating order",
    });
  } finally {
    // Always close the transaction session
    await session.endSession();
  }
});

// GET LOGGED-IN USER ORDERS
router.get("/", protect, async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user.id,
    })
      .populate("items.medicine", "name price")
      .sort({ createdAt: -1 });

    res.status(200).json({
      orders,
    });
  } catch (error) {
    console.error("Get User Orders Error:", error);

    res.status(500).json({
      message: "Server error while fetching orders",
    });
  }
});

// GET ALL ORDERS - OWNER ONLY
router.get("/all", protect, async (req, res) => {
  try {
    // Check owner role
    if (req.user.role !== "owner") {
      return res.status(403).json({
        message: "Owner access required",
      });
    }

    const orders = await Order.find()
      .populate("user", "name email role")
      .populate("items.medicine", "name price")
      .sort({ createdAt: -1 });

    res.status(200).json({
      orders,
    });
  } catch (error) {
    console.error("Get All Orders Error:", error);

    res.status(500).json({
      message: "Server error while fetching all orders",
    });
  }
});

// GET SINGLE ORDER / TRACKING DETAILS - USER ONLY
router.get("/:orderId", protect, async (req, res) => {
  try {
    const { orderId } = req.params;

    // Find order belonging to logged-in user
    const order = await Order.findOne({
      orderId: orderId,
      user: req.user.id,
    }).populate("items.medicine", "name price");

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    // Tracking information
    const trackingStatuses = [
      {
        status: "placed",
        label: "Order Placed",
        step: 0,
      },
      {
        status: "confirmed",
        label: "Order Confirmed",
        step: 1,
      },
      {
        status: "preparing",
        label: "Preparing Order",
        step: 2,
      },
      {
        status: "shipped",
        label: "Order Shipped",
        step: 3,
      },
      {
        status: "out-for-delivery",
        label: "Out for Delivery",
        step: 4,
      },
      {
        status: "delivered",
        label: "Order Delivered",
        step: 5,
      },
    ];

    res.status(200).json({
      message: "Order tracking details fetched successfully",

      tracking: {
        orderId: order.orderId,
        status: order.status,
        trackingStep: order.trackingStep,
        statuses: trackingStatuses,
      },

      order: order,
    });
  } catch (error) {
    console.error("Get Order Tracking Error:", error);

    res.status(500).json({
      message: "Server error while fetching order tracking",
    });
  }
});

 
// UPDATE ORDER STATUS - OWNER ONLY
router.put("/:orderId/status", protect, async (req, res) => {
  const session = await Order.startSession();

  try {
    const { orderId } = req.params;
    const { status } = req.body;

    // Check owner role
    if (req.user.role !== "owner") {
      return res.status(403).json({
        message: "Owner access required",
      });
    }

    // Allowed statuses
    const statusSteps = {
      placed: 0,
      confirmed: 1,
      preparing: 2,
      shipped: 3,
      "out-for-delivery": 4,
      delivered: 5,
      cancelled: 0,
    };

    // Validate status
    if (!Object.prototype.hasOwnProperty.call(statusSteps, status)) {
      return res.status(400).json({
        message: "Invalid order status",
      });
    }

    // Start transaction
    session.startTransaction();

    // Find order inside transaction
    const order = await Order.findOne({
      orderId: orderId,
    }).session(session);

    if (!order) {
      await session.abortTransaction();

      return res.status(404).json({
        message: "Order not found",
      });
    }

    // Prevent invalid status transitions
    const allowedTransitions = {
      placed: ["confirmed", "cancelled"],
      confirmed: ["preparing", "cancelled"],
      preparing: ["shipped", "cancelled"],
      shipped: ["out-for-delivery", "cancelled"],
      "out-for-delivery": ["delivered", "cancelled"],
      delivered: [],
      cancelled: [],
    };

    if (!allowedTransitions[order.status].includes(status)) {
      await session.abortTransaction();

      return res.status(400).json({
        message: `Cannot change order status from ${order.status} to ${status}`,
      });
    }

    // Handle cancellation
    if (status === "cancelled") {
      // Restore stock for every medicine inside transaction
      for (const item of order.items) {
        const medicine = await Medicine.findById(
          item.medicine
        ).session(session);

        if (!medicine) {
          throw new Error(
            `Medicine ${item.name} no longer exists`
          );
        }

        medicine.stock += item.quantity;

        // Save stock restoration inside transaction
        await medicine.save({
          session,
        });
      }

      order.status = "cancelled";
      order.trackingStep = 0;
    } else {
      // Normal status update
      order.status = status;
      order.trackingStep = statusSteps[status];
    }

    // Save order inside transaction
    await order.save({
      session,
    });

    // Commit all changes
    await session.commitTransaction();

    res.status(200).json({
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    // Rollback all changes
    await session.abortTransaction();

    console.error("Update Order Status Transaction Error:", error);

    if (
      error.message &&
      error.message.startsWith("Medicine ")
    ) {
      return res.status(400).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: "Server error while updating order status",
    });
  } finally {
    // Always close transaction session
    await session.endSession();
  }
});
 

 
// CANCEL ORDER - USER ONLY
router.put("/:orderId/cancel", protect, async (req, res) => {
  const session = await Order.startSession();

  try {
    // Start transaction
    session.startTransaction();

    // Find only the logged-in user's order
    const order = await Order.findOne({
      orderId: req.params.orderId,
      user: req.user.id,
    }).session(session);

    if (!order) {
      await session.abortTransaction();

      return res.status(404).json({
        message: "Order not found",
      });
    }

    // Only active orders can be cancelled
    if (order.status === "cancelled" || order.status === "delivered") {
      await session.abortTransaction();

      return res.status(400).json({
        message: `Order cannot be cancelled because it is already ${order.status}`,
      });
    }

    // Restore stock for every medicine inside transaction
    for (const item of order.items) {
      const medicine = await Medicine.findById(
        item.medicine
      ).session(session);

      if (!medicine) {
        throw new Error(
          `Medicine ${item.name} no longer exists`
        );
      }

      medicine.stock += item.quantity;

      // Save stock restoration inside transaction
      await medicine.save({
        session,
      });
    }

    // Update order
    order.status = "cancelled";
    order.trackingStep = 0;

    await order.save({
      session,
    });

    // Commit everything together
    await session.commitTransaction();

    return res.status(200).json({
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    // Rollback stock + order update
    await session.abortTransaction();

    console.error(
      "Cancel Order Transaction Error:",
      error
    );

    if (
      error.message &&
      error.message.startsWith("Medicine ")
    ) {
      return res.status(400).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Server error while cancelling order",
    });
  } finally {
    // Always close transaction session
    await session.endSession();
  }
});
 


module.exports = router;
