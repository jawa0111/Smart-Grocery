const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    typicalQuantity: {
      type: Number,
      required: true,
      min: 0,
      default: 1,
    },
    unit: {
      type: String,
      required: true,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    location: {
      type: String,
      required: true,
      enum: ["Pantry", "Fridge", "Freezer", "Cupboard", "Other"],
    },
    notes: {
      type: String,
      default: "",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Inventory", inventorySchema); 