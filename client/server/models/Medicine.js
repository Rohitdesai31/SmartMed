const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema(
  {
    frontendId: {
      type: Number,
      required: false,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },
    categoryType: {
  type: String,
  enum: ["Top Care", "Everyday Wellness"],
  default: "Top Care",
},

    healthCategory: {
      type: String,
      trim: true,
      default: "",
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    expiryDate: {
      type: Date,
      required: true,
    },

    manufacturer: {
      type: String,
      trim: true,
      default: "",
    },

    status: {
      type: String,
      enum: ["Available", "Low Stock", "Out of Stock"],
      default: "Out of Stock",
    },
  },
  {
    timestamps: true,
  }
);


// Automatically determine medicine status from stock
medicineSchema.pre("save", function () {
  if (this.stock === 0) {
    this.status = "Out of Stock";
  } else if (this.stock <= 10) {
    this.status = "Low Stock";
  } else {
    this.status = "Available";
  }
});


const Medicine = mongoose.model("Medicine", medicineSchema);

module.exports = Medicine;